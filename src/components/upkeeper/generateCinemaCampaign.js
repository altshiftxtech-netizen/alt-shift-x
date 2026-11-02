import {base44} from '@/api/base44Client';
import {reelSchema} from '@/components/upkeeper/creativePrompt';
import {cinematicDirective,cinemaDuration} from '@/components/upkeeper/cinemaSpec';
import {cinemaBrandAnchor} from '@/components/upkeeper/cinemaBrandGuard';
export default async function generateCinemaCampaign(prompt,assets){
  const directive=cinematicDirective(prompt,assets.cinema)+` Output aspect ratio: ${assets.cinema?.aspect||'9:16'}.`,files=assets.reference?[assets.reference.url]:[];
  const [campaign,hero,broll]=await Promise.all([
    base44.integrations.Core.InvokeLLM({prompt:`Write a ${cinemaDuration(assets.cinema)} second FOUR-phase cinematic reel and social copy. ${directive}\nReturn four scenes in order: hook, kinetic breakdown, feature/source spotlight, logo bumper with CTA. Each title under 8 words and body under 30 words. Preserve user-supplied brand names. Do not invent testimonials, proof, financial results or percentages. Give product title, value proposition, audience, 3 social posts and a practical action plan.`,file_urls:files,response_json_schema:{...reelSchema,properties:{...reelSchema.properties,scenes:{type:'array',minItems:4,maxItems:4,items:{type:'object',properties:{title:{type:'string'},body:{type:'string'}},required:['title','body']}},cta:{type:'string'}},required:[...reelSchema.required,'scenes','cta']}}),
    base44.integrations.Core.GenerateImage({prompt:`Create a high-contrast ${assets.cinema?.aspect||'9:16'} cinematic HERO still. ${directive} Photographic focal subject, premium production lighting. No text, no lettering, no logos, leave dark negative space for overlaid titles.`,existing_image_urls:files}),
    base44.integrations.Core.GenerateImage({prompt:`Create a ${assets.cinema?.aspect||'9:16'} secondary B-ROLL macro shot for this production: ${directive}. A visibly different angle from the hero: close-up material detail, atmospheric shallow focus, cinematic light. No lettering or logos.`,existing_image_urls:files})
  ]);
  return {...campaign,hero_url:hero.url,broll_url:broll.url,directive,brand_anchor:cinemaBrandAnchor(prompt),url:assets.campaign?.url||'',token_tag:'LOCAL CINEMA · SYNCHRONIZED CANVAS VIDEO'};
}