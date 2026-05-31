import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { component_id, previous_snapshot, current_snapshot, version_description } = body;

    if (!component_id || !current_snapshot) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Fetch component to verify ownership (fall back to snapshot if not in DB yet)
    let component = current_snapshot;
    try {
      const components = await base44.entities.Component.filter({ id: component_id });
      if (components.length) {
        if (components[0].builder_id !== user.id) {
          return Response.json({ error: 'Unauthorized' }, { status: 403 });
        }
        component = components[0];
      }
    } catch (e) {
      // Component not in DB (e.g. mock/local data), use snapshot directly
      console.log('Component not found in DB, using snapshot data');
    }

    // Build diff summary for AI analysis
    const diffSummary = {
      component_name: component.name,
      component_code: component.code,
      user_description: version_description || 'Version update',
      previous: previous_snapshot || {},
      current: current_snapshot,
    };

    // Use AI to generate changelog and detect breaking changes
    const changelogResponse = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a technical documentation expert. Analyze this component change and generate a changelog with breaking change detection.

Component: ${diffSummary.component_name} (${diffSummary.component_code})
User Description: ${diffSummary.user_description}

Previous Version Schema: ${JSON.stringify(diffSummary.previous.schema || [], null, 2)}
Current Version Schema: ${JSON.stringify(diffSummary.current.schema || [], null, 2)}

Previous Version Features: ${JSON.stringify(diffSummary.previous.features || [], null, 2)}
Current Version Features: ${JSON.stringify(diffSummary.current.features || [], null, 2)}

Previous Price: $${diffSummary.previous.price || 0}/month
Current Price: $${diffSummary.current.price || 0}/month

Analyze the changes and provide:
1. A concise changelog entry (2-3 sentences)
2. A list of changes (added, modified, removed fields/features)
3. A breaking_change boolean (true if schema changes are incompatible)
4. Breaking change explanation if applicable

IMPORTANT:
- Breaking changes include: schema field removals, type changes, feature removals
- Non-breaking: new fields, new features, price increases, performance improvements
- Consider backward compatibility

Return ONLY valid JSON (no markdown, no code blocks).`,
      response_json_schema: {
        type: 'object',
        properties: {
          changelog: {
            type: 'string',
            description: 'Human-readable changelog entry',
          },
          breaking_change: {
            type: 'boolean',
            description: 'Whether this release breaks backward compatibility',
          },
          breaking_change_reason: {
            type: 'string',
            description: 'Explanation of breaking changes if applicable',
          },
          changes: {
            type: 'object',
            properties: {
              added: { type: 'array', items: { type: 'string' } },
              modified: { type: 'array', items: { type: 'string' } },
              removed: { type: 'array', items: { type: 'string' } },
            },
          },
        },
        required: ['changelog', 'breaking_change', 'changes'],
      },
    });

    console.log(`[INFO] Changelog generated for ${component.name}`);

    return Response.json({
      success: true,
      changelog: changelogResponse.changelog,
      breaking_change: changelogResponse.breaking_change,
      breaking_change_reason: changelogResponse.breaking_change_reason,
      changes: changelogResponse.changes,
      component_id,
      component_name: component.name,
    });
  } catch (error) {
    console.error('Changelog generation error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});