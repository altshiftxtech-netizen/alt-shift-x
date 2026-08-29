import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';
import JSZip from 'npm:jszip@3.10.1';

// testPwaExport — validates a PWA export's full download pipeline:
//   1. Verifies the PwaExport record exists and is active
//   2. Checks all referenced component_codes resolve to real Component records
//   3. Runs the generate_function (if set) and validates the zip contents
//   4. Reports any missing components, broken downloads, or file count issues
//
// Returns a detailed diagnostic report Bob Builder can use to fix packets.

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { export_id } = body;

    if (!export_id) {
      return Response.json({ error: 'export_id is required' }, { status: 400 });
    }

    // 1. Fetch the export record
    const exportRecord = await base44.asServiceRole.entities.PwaExport.get(export_id).catch(() => null);
    if (!exportRecord) {
      return Response.json({
        ok: false,
        error: 'PWA export record not found',
        export_id,
      }, { status: 404 });
    }

    const report: any = {
      export_id,
      name: exportRecord.name,
      version: exportRecord.version,
      status: exportRecord.status,
      date_wired: exportRecord.date_wired,
      checks: [],
      passed: 0,
      failed: 0,
      warnings: [],
    };

    // Check 1: Record is active
    const isActive = exportRecord.status === 'active';
    report.checks.push({
      check: 'Record is active',
      passed: isActive,
      detail: isActive ? 'ok' : `status is '${exportRecord.status}' — inactive exports won't appear in the dropdown`,
    });
    isActive ? report.passed++ : report.failed++;

    // 2. Resolve component codes
    const componentCodes = exportRecord.component_codes || [];
    let matchedComponents: any[] = [];
    let missingCodes: string[] = [];

    if (componentCodes.length > 0) {
      const allComponents = await base44.asServiceRole.entities.Component.filter({}, '-created_date', 200);
      matchedComponents = allComponents.filter(c => componentCodes.includes(c.code));
      missingCodes = componentCodes.filter(code => !matchedComponents.some(c => c.code === code));
    }

    const allComponentsResolved = missingCodes.length === 0;
    report.checks.push({
      check: `All component codes resolve (${matchedComponents.length}/${componentCodes.length})`,
      passed: allComponentsResolved,
      detail: allComponentsResolved
        ? `All ${componentCodes.length} component(s) found in the Component database`
        : `Missing: ${missingCodes.join(', ')} — create these components or remove them from the export`,
    });
    allComponentsResolved ? report.passed++ : report.failed++;

    // 3. Has download method
    const hasDownloadMethod = !!(exportRecord.file_url || exportRecord.generate_function);
    report.checks.push({
      check: 'Has download method (file_url or generate_function)',
      passed: hasDownloadMethod,
      detail: hasDownloadMethod
        ? (exportRecord.file_url ? 'Pre-built zip (file_url)' : `On-demand function: ${exportRecord.generate_function}`)
        : 'Neither file_url nor generate_function is set — the download button will show "No zip package wired up yet"',
    });
    hasDownloadMethod ? report.passed++ : report.failed++;

    // 4. Test the actual zip generation (if generate_function is set)
    if (exportRecord.generate_function) {
      try {
        const genResponse = await base44.functions.invoke(exportRecord.generate_function, { export_id });
        const genData = genResponse.data || genResponse;

        const hasZip = !!genData?.zip;
        const fileCount = genData?.files?.length || 0;
        const expectedFiles = 10;
        const hasAllFiles = fileCount === expectedFiles;

        report.checks.push({
          check: `generate_function returns valid zip (${fileCount}/${expectedFiles} files)`,
          passed: hasZip && hasAllFiles,
          detail: hasZip && hasAllFiles
            ? `Zip generated successfully with all ${expectedFiles} files: ${(genData.files || []).join(', ')}`
            : hasZip
              ? `Zip generated but only has ${fileCount}/${expectedFiles} files — expected 10`
              : 'generate_function returned no zip payload',
        });
        hasZip && hasAllFiles ? report.passed++ : report.failed++;

        // 5. Decode and validate the zip structure
        if (hasZip) {
          try {
            const b64 = genData.zip;
            const binStr = atob(b64);
            const bytes = new Uint8Array(binStr.length);
            for (let i = 0; i < binStr.length; i++) bytes[i] = binStr.charCodeAt(i);

            // Verify it's a valid zip by checking the magic bytes (PK)
            const isZipMagic = bytes[0] === 0x50 && bytes[1] === 0x4B;
            report.checks.push({
              check: 'Zip is a valid archive (PK magic bytes)',
              passed: isZipMagic,
              detail: isZipMagic ? 'Valid ZIP archive' : 'Invalid — not a ZIP file',
            });
            isZipMagic ? report.passed++ : report.failed++;

            // Try to parse with JSZip
            const zip = await JSZip.loadAsync(bytes);
            const fileNames = Object.keys(zip.files);
            const hasManifest = fileNames.includes('manifest.json');
            const hasSw = fileNames.includes('sw.js');
            const hasPayload = fileNames.includes('payload.json');
            const hasReadme = fileNames.includes('README.txt');

            const structureValid = hasManifest && hasSw && hasPayload && hasReadme;
            report.checks.push({
              check: 'Zip contains all critical files (manifest, sw, payload, README)',
              passed: structureValid,
              detail: structureValid
                ? 'All critical files present in the archive'
                : `Missing: ${[!hasManifest && 'manifest.json', !hasSw && 'sw.js', !hasPayload && 'payload.json', !hasReadme && 'README.txt'].filter(Boolean).join(', ')}`,
            });
            structureValid ? report.passed++ : report.failed++;

          } catch (zipError) {
            report.checks.push({
              check: 'Zip can be parsed and read',
              passed: false,
              detail: `Failed to parse zip: ${zipError.message}`,
            });
            report.failed++;
          }
        }

        report.generated_filename = genData?.filename;
        report.generated_component_count = genData?.component_count;

      } catch (genError) {
        report.checks.push({
          check: 'generate_function executes without error',
          passed: false,
          detail: `Function error: ${genError.message}`,
        });
        report.failed++;
      }
    }

    // Summary verdict
    report.ok = report.failed === 0;
    report.summary = report.ok
      ? `✓ All ${report.checks.length} checks passed — PWA export is fully functional`
      : `✗ ${report.failed} of ${report.checks.length} checks failed — see details above`;

    return Response.json(report);
  } catch (error) {
    console.error('testPwaExport error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}