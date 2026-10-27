import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { base44 } from '@/api/base44Client';

const REDEEMED_PREFIX = 'asx_redeemed_';
const GIFT_ISSUED_PREFIX = 'asx_gift_issued_';

export default function useGiftPassEngine() {
  const { user, isAuthenticated } = useAuth();
  const [giftReward, setGiftReward] = useState(null);
  const [open, setOpen] = useState(false);
  const [issuing, setIssuing] = useState(false);
  const [error, setError] = useState('');
  const userRedeemed = useRef([]);

  useEffect(() => {
    if (isAuthenticated && user?.redeemed_discounts) {
      userRedeemed.current = user.redeemed_discounts;
    } else {
      userRedeemed.current = [];
    }
  }, [isAuthenticated, user]);

  const checkRedemption = useCallback((tier) => {
    const localRedeemed = localStorage.getItem(`${REDEEMED_PREFIX}${tier}`) === 'true';
    const profileRedeemed = userRedeemed.current.includes(tier);
    return localRedeemed || profileRedeemed;
  }, []);

  const markRedeemed = useCallback((tier) => {
    localStorage.setItem(`${REDEEMED_PREFIX}${tier}`, 'true');
    if (isAuthenticated) {
      const current = userRedeemed.current;
      if (!current.includes(tier)) {
        const updated = [...current, tier];
        userRedeemed.current = updated;
        base44.auth.updateMe({ redeemed_discounts: updated }).catch(() => {});
      }
    }
  }, [isAuthenticated]);

  const triggerGift = useCallback(async (tier) => {
    if (!checkRedemption(tier)) return false;
    // Guest double-roll: if a gift was already issued for this tier in-session, still show gift mode
    setIssuing(true);
    setError('');
    try {
      const response = await base44.functions.invoke('issueGiftPromoCode', { tier });
      if (response.data?.code) {
        setGiftReward(response.data);
        setOpen(true);
        localStorage.setItem(`${GIFT_ISSUED_PREFIX}${tier}`, 'true');
        return true;
      }
      return false;
    } catch (err) {
      setError(err.message || 'Gift code issuance failed');
      return false;
    } finally {
      setIssuing(false);
    }
  }, [checkRedemption]);

  const dismiss = useCallback((value) => {
    setOpen(value);
    if (!value) setGiftReward(null);
  }, []);

  return {
    giftReward,
    open,
    setOpen: dismiss,
    issuing,
    error,
    checkRedemption,
    markRedeemed,
    triggerGift,
  };
}