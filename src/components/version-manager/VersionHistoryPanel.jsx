import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, CheckCircle2, ChevronDown, ChevronUp, Tag } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function VersionHistoryPanel({ component }) {
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    loadVersions();
  }, [component.id]);

  const loadVersions = async () => {
    setLoading(true);
    const result = await base44.entities.ComponentVersion.filter(
      { component_id: component.id },
      '-published_at',
      50
    );
    setVersions(result || []);
    setLoading(false);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Version History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="w-4 h-4 border-2 border-slate-200 border-t-slate-800 rounded-full animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!versions.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Version History</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-slate-500 text-center py-8">No versions released yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <Tag className="w-4 h-4" />
          Version History ({versions.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {versions.map((v) => (
          <div key={v.id} className="border border-slate-200 rounded-lg overflow-hidden">
            <button
              onClick={() => setExpandedId(expandedId === v.id ? null : v.id)}
              className="w-full flex items-start gap-3 p-3 hover:bg-slate-50 transition-colors text-left"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-sm">v{v.version}</span>
                  <Badge
                    className={cn(
                      'text-xs',
                      v.breaking_change
                        ? 'bg-red-100 text-red-700'
                        : 'bg-green-100 text-green-700'
                    )}
                  >
                    {v.breaking_change ? 'Breaking' : 'Compatible'}
                  </Badge>
                  {!v.breaking_change && v.auto_upgrade_eligible && (
                    <Badge className="text-xs bg-blue-100 text-blue-700">Auto-upgrade</Badge>
                  )}
                </div>
                <p className="text-xs text-slate-500">
                  {new Date(v.published_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </p>
              </div>
              {expandedId === v.id ? (
                <ChevronUp className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-400" />
              )}
            </button>

            {expandedId === v.id && (
              <div className="border-t border-slate-200 bg-slate-50 p-3 space-y-2 text-sm">
                {v.breaking_change && (
                  <div className="flex gap-2 p-2 bg-red-50 border border-red-200 rounded text-red-800">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    <p className="text-xs">Breaking change: {v.changes?.reason}</p>
                  </div>
                )}

                <div>
                  <p className="font-semibold text-slate-700 mb-1">Changelog</p>
                  <p className="text-xs text-slate-600 leading-relaxed">{v.changelog}</p>
                </div>

                {v.changes && (
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    {v.changes.added?.length > 0 && (
                      <div>
                        <p className="font-semibold text-green-700">Added</p>
                        {v.changes.added.map((item, i) => (
                          <p key={i} className="text-slate-600">• {item}</p>
                        ))}
                      </div>
                    )}
                    {v.changes.modified?.length > 0 && (
                      <div>
                        <p className="font-semibold text-blue-700">Modified</p>
                        {v.changes.modified.map((item, i) => (
                          <p key={i} className="text-slate-600">• {item}</p>
                        ))}
                      </div>
                    )}
                    {v.changes.removed?.length > 0 && (
                      <div>
                        <p className="font-semibold text-red-700">Removed</p>
                        {v.changes.removed.map((item, i) => (
                          <p key={i} className="text-slate-600">• {item}</p>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {v.trust_score_at_publish && (
                  <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                    <span className="text-xs text-slate-600">Trust score at publish:</span>
                    <span className="font-semibold text-xs">{v.trust_score_at_publish}/100</span>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}