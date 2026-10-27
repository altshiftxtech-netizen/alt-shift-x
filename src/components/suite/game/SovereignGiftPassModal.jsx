import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Copy, Check, Twitter, Linkedin, Mail, MessageCircle, Share2, Clock } from 'lucide-react';
import '@/components/suite/game/rocketDemo.css';

const APP_URL = 'https://altshiftx.tech';
const SUITE_URL = `${APP_URL}/suite`;

export default function SovereignGiftPassModal({ reward, open, onOpenChange }) {
  const [copied, setCopied] = useState(false);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (!open) return;
    setNow(Date.now());
    setCopied(false);
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [open]);

  if (!reward) return null;

  const remaining = Math.max(0, Math.ceil((new Date(reward.expiresAt).getTime() - now) / 1000));
  const expired = remaining === 0;
  const claimUrl = reward.claimUrl || `${APP_URL}/sovereignpass?promo=${reward.code}&gift=true`;

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(reward.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch {
      // Fallback for non-secure contexts
      const el = document.createElement('textarea');
      el.value = reward.code;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const tweetText = `I just triggered a repeat milestone on the @AltShiftX Proving Ground! Since I already have my Sovereign Pass, here is a free code for whoever grabs it first: ${reward.code} \u{1F449} ${SUITE_URL}`;
  const chatMessage = `Here is a free Sovereign Pass credit I unlocked on the Alt+Shift+X Proving Ground: ${claimUrl}`;
  const emailBody = `A fellow developer just unlocked a repeat milestone on the Alt+Shift+X Proving Ground and is gifting you a Sovereign Pass promo code.\n\nCode: ${reward.code}\nClaim here: ${claimUrl}\n\nValid for 15 minutes from issue. One redemption per code.`;

  const shareLinks = [
    { label: 'X / Twitter', icon: Twitter, url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`, color: 'var(--scene-cyan)' },
    { label: 'LinkedIn', icon: Linkedin, url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(claimUrl)}`, color: 'var(--scene-amber)' },
    { label: 'WhatsApp', icon: MessageCircle, url: `https://wa.me/?text=${encodeURIComponent(chatMessage)}`, color: 'var(--scene-cyan)' },
    { label: 'Email', icon: Mail, url: `mailto:?subject=${encodeURIComponent('Gift: Sovereign Pass Promo Code')}&body=${encodeURIComponent(emailBody)}`, color: 'var(--scene-amber)' },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="proving-reward sovereign-gift-pass">
        <span className="gift-badge">REPEAT MILESTONE ACHIEVED — ACTIVE PASS DETECTED</span>
        <DialogTitle>You've already claimed this discount. Pass the power forward.</DialogTitle>
        <DialogDescription>
          Your account already holds an active discount for {reward.tierLabel}. A fresh single-use Stripe promo code has been minted for a colleague or founder.
        </DialogDescription>

        <div className="gift-code-ticket">
          <div className="gift-code-notch gift-code-notch-left" />
          <div className="gift-code-body">
            <span className="gift-code-label">GIFT CODE</span>
            <code className="gift-code-value">{reward.code}</code>
            <span className="gift-code-meta">
              <Clock size={12} />
              {expired ? 'EXPIRED' : `${Math.floor(remaining / 60)}:${String(remaining % 60).padStart(2, '0')}`}
            </span>
          </div>
          <div className="gift-code-notch gift-code-notch-right" />
        </div>

        <Button onClick={copyCode} className="gift-copy-btn" disabled={expired}>
          {copied ? <><Check size={16} /> Copied to clipboard! Valid for 15 minutes.</> : <><Copy size={16} /> COPY CODE</>}
        </Button>

        <div className="gift-claim-link">
          <span className="gift-claim-label">Direct claim link:</span>
          <a href={claimUrl} target="_blank" rel="noopener noreferrer">{claimUrl}</a>
        </div>

        <div className="gift-share-section">
          <span className="gift-share-title"><Share2 size={14} /> 1-CLICK VIRAL SHARING</span>
          <div className="gift-share-buttons">
            {shareLinks.map(({ label, icon: Icon, url, color }) => (
              <a key={label} href={url} target="_blank" rel="noopener noreferrer" className="gift-share-btn" style={{ '--share-color': color }}>
                <Icon size={16} />
                <span>{label}</span>
              </a>
            ))}
          </div>
        </div>

        <p className="gift-fineprint">
          This promotional code is fully transferable and can be redeemed by any developer or organization at checkout. Valid for 15 minutes from issue. One redemption per code.
        </p>

        <p className="gift-double-dip-notice">
          Account already has an active discount applied. Share this code with a peer!
        </p>

        <Button variant="outline" onClick={() => onOpenChange(false)}>Return to Proving Ground</Button>
      </DialogContent>
    </Dialog>
  );
}