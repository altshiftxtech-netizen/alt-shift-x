import React from 'react';
import {Textarea} from '@/components/ui/textarea';
import {cinematicDirective} from '@/components/upkeeper/cinemaSpec';
export default function UpkeeperPromptExpander({prompt,settings,onChange,disabled}){
  const directive=cinematicDirective(prompt,settings);
  return <details className="creative-disclosure rounded-xl border px-3 py-1"><summary>Cinematic Directive · {prompt.trim().split(/\s+/).length<15?'Auto-expanded':'Production spec'}</summary><label className="block text-xs text-muted-foreground pt-3">Edit before generating; changes update the production specification.<Textarea aria-label="Cinematic directive" rows={12} value={directive} disabled={disabled} onChange={e=>onChange({...settings,directive:e.target.value,directiveSource:prompt})} className="mt-2 text-sm"/></label></details>;
}