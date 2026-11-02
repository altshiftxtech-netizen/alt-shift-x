import React from 'react';
import {Button} from '@/components/ui/button';
export default function EmblemModifierAssist({message,onChoose,disabled}){
  return <div role="status" className="rounded-lg border p-3 space-y-2"><p className="text-sm">{message}</p><div className="flex flex-wrap gap-2">{[['Add Classic Eyes','add classic eyes'],['Add Chiseled Cyber Visor','add chiseled cyber visor'],['Add Sunglasses','add sunglasses']].map(([label,prompt])=><Button key={label} type="button" size="sm" variant="outline" className="h-auto whitespace-normal" disabled={disabled} onClick={()=>onChoose(prompt)}>{label}</Button>)}</div></div>;
}