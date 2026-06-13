import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";

/**
 * useSiteContent — fetches an active SiteContent record by key.
 * Returns null until loaded, or if no active record exists for the key.
 * The UpKeeper writes these records live; the frontend just reads them.
 *
 * @param {string} key - the SiteContent key, e.g. "sanctions_footer_notice"
 * @returns {object|null} the active record, or null
 */
export function useSiteContent(key) {
  const [content, setContent] = useState(null);

  useEffect(() => {
    if (!key) return;
    let cancelled = false;
    base44.entities.SiteContent.filter({ key, is_active: true })
      .then((rows) => {
        if (!cancelled) setContent((rows && rows[0]) || null);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [key]);

  return content;
}

/**
 * useSiteContentSection — fetches all active records for a section (e.g. FAQ).
 * @param {string} section
 * @returns {array} active records (empty until loaded)
 */
export function useSiteContentSection(section) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    if (!section) return;
    let cancelled = false;
    base44.entities.SiteContent.filter({ section, is_active: true })
      .then((rows) => {
        if (!cancelled) setItems(rows || []);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [section]);

  return items;
}