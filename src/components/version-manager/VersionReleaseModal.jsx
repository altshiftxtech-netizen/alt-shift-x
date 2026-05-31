import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertCircle, CheckCircle2, Loader2, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function VersionReleaseModal({ component, isOpen, onClose, onSuccess }) {
  const [step, setStep] = useState(1);
  const [version, setVersion] = useState('');
  const [userDescription, setUserDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [changelog, setChangelog] = useState(null);
  const [breakingChange, setBreakingChange] = useState(false);
  const [changes, setChanges] = useState(null);
  const [error, setError] = useState('');

  // Step 1: Generate changelog
  const handleGenerateChangelog = async () => {
    if (!version.trim()) {
      setError('Version is required');
      return;
    }

    setError('');
    setLoading(true);

    const versionRegex = /^\d+\.\d+\.\d+$/;
    if (!versionRegex.test(version)) {
      setError('Version must be in format X.Y.Z (e.g., 1.2.0)');
      setLoading(false);
      return;
    }

    const result = await base44.functions.invoke('generateComponentChangelog', {
      component_id: component.id,
      previous_snapshot: component._previousVersion || {},
      current_snapshot: component,
      version_description: userDescription,
    });

    if (result.data?.success) {
      setChangelog(result.data.changelog);
      setBreakingChange(result.data.breaking_change);
      setChanges(result.data.changes);
      setStep(2);
    } else {
      setError(result.data?.error || 'Failed to generate changelog. Make sure the component exists in the database.');
    }
    setLoading(false);
  };

  // Step 2: Release version
  const handleRelease = async () => {
    setLoading(true);
    setError('');

    const result = await base44.functions.invoke('releaseComponentVersion', {
      component_id: component.id,
      version,
      changelog,
      breaking_change: breakingChange,
      changes,
      snapshot: component,
      auto_upgrade_eligible: !breakingChange,
    });

    if (result.data?.success) {
      onSuccess(result.data);
      handleReset();
    } else {
      setError(result.data?.error || 'Failed to release version');
    }
    setLoading(false);
  };

  const handleReset = () => {
    setStep(1);
    setVersion('');
    setUserDescription('');
    setChangelog(null);
    setBreakingChange(false);
    setChanges(null);
    setError('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Release New Version — {component?.name}</DialogTitle>
        </DialogHeader>

        {step === 1 ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-1">Version (X.Y.Z)</label>
              <Input
                placeholder="e.g., 1.2.0"
                value={version}
                onChange={(e) => setVersion(e.target.value)}
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1">What changed? (Optional)</label>
              <Textarea
                placeholder="Describe updates, new features, bug fixes, etc."
                value={userDescription}
                onChange={(e) => setUserDescription(e.target.value)}
                disabled={loading}
                rows={4}
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            <p className="text-xs text-slate-500">AI will analyze changes and generate changelog automatically.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className={cn('border rounded-lg p-4', breakingChange ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50')}>
              <div className="flex items-start gap-2">
                {breakingChange ? (
                  <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                ) : (
                  <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                )}
                <div>
                  <p className={cn('font-semibold', breakingChange ? 'text-red-900' : 'text-green-900')}>
                    {breakingChange ? 'Breaking Change Detected' : 'Non-Breaking Update'}
                  </p>
                  <p className={cn('text-sm mt-1', breakingChange ? 'text-red-800' : 'text-green-800')}>
                    {breakingChange
                      ? 'This version breaks backward compatibility. Auto-upgrades will be blocked.'
                      : 'This version maintains backward compatibility. Auto-upgrades available.'}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold mb-2">Generated Changelog</p>
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm text-slate-700 leading-relaxed">
                {changelog}
              </div>
            </div>

            {changes && (
              <div className="grid grid-cols-3 gap-3 text-sm">
                {changes.added?.length > 0 && (
                  <div>
                    <p className="font-semibold text-green-700 mb-1">Added ({changes.added.length})</p>
                    <ul className="space-y-0.5">
                      {changes.added.map((item, i) => (
                        <li key={i} className="text-xs text-slate-600">• {item}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {changes.modified?.length > 0 && (
                  <div>
                    <p className="font-semibold text-blue-700 mb-1">Modified ({changes.modified.length})</p>
                    <ul className="space-y-0.5">
                      {changes.modified.map((item, i) => (
                        <li key={i} className="text-xs text-slate-600">• {item}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {changes.removed?.length > 0 && (
                  <div>
                    <p className="font-semibold text-red-700 mb-1">Removed ({changes.removed.length})</p>
                    <ul className="space-y-0.5">
                      {changes.removed.map((item, i) => (
                        <li key={i} className="text-xs text-slate-600">• {item}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}
          </div>
        )}

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={handleReset} disabled={loading}>
            Cancel
          </Button>
          {step === 1 ? (
            <Button onClick={handleGenerateChangelog} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                'Generate Changelog'
              )}
            </Button>
          ) : (
            <Button
              onClick={handleRelease}
              disabled={loading}
              className={breakingChange ? 'bg-red-600 hover:bg-red-700' : ''}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Publishing...
                </>
              ) : (
                `Publish v${version}`
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}