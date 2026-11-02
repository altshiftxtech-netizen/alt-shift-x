import React from 'react';
import { useQuery } from '@tanstack/react-query';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

const documents = {
  terms: { title: 'Terms of Service', keys: ['terms_of_service_part1', 'terms_of_service_part2'] },
  privacy: { title: 'Privacy Policy', keys: ['privacy_policy_part1', 'privacy_policy_part2'] },
};
const preventCopy = event => event.preventDefault();

export default function SuiteLegalPopup({ document, onClose }) {
  const policy = documents[document];
  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ['suite-legal-popup', document],
    enabled: !!policy,
    queryFn: () => base44.entities.SiteContent.filter({ key: { $in: policy.keys }, is_active: true }, { limit: 10 }),
  });
  const parts = policy?.keys.map(key => data?.items.find(record => record.key === key));
  const complete = parts?.every(part => part?.body);
  return (
    <Dialog open={!!policy} onOpenChange={open => { if (!open) onClose(); }}>
      <DialogContent className="max-w-3xl max-h-[85dvh] w-[calc(100%-2rem)] flex flex-col select-none" onCopy={preventCopy} onCut={preventCopy} onContextMenu={preventCopy} onDragStart={preventCopy}>
        <DialogHeader>
          <DialogTitle>{policy?.title}</DialogTitle>
          <DialogDescription>Read this policy without leaving the Proving Ground.</DialogDescription>
        </DialogHeader>
        <div className="min-h-0 overflow-y-auto overscroll-contain pr-2" tabIndex={0} aria-label={policy?.title}>
          {isPending ? <p role="status">Loading policy…</p> : isError ? <div role="alert"><p>Unable to load this policy.</p><Button variant="outline" onClick={() => refetch()}>Try again</Button></div> : !complete ? <p>This policy is not currently available in full. Please check back soon.</p> : (
            <article className="text-sm leading-relaxed [&_h1]:text-2xl [&_h1]:font-bold [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:mt-6 [&_p]:my-3 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_a]:underline">
              <ReactMarkdown rehypePlugins={[rehypeRaw]}>{parts.map(part => part.body).join('\n\n')}</ReactMarkdown>
            </article>
          )}
        </div>
        <Button variant="outline" className="shrink-0 self-start" onClick={onClose}>Back to Proving Ground</Button>
      </DialogContent>
    </Dialog>
  );
}