import { useEffect, useRef, useState } from 'react';
import remixMedia from '@/components/upkeeper/commercial/remixMedia';

export default function useRemixFootage(setError) {
  const [sources, setSources] = useState([]);
  const [scanning, setScanning] = useState(false);
  const owned = useRef(new Set());
  const mounted = useRef(true);
  const pending = useRef(false);
  useEffect(() => {
    mounted.current = true;
    const urls = owned.current;
    return () => { mounted.current = false; urls.forEach(url => URL.revokeObjectURL(url)); urls.clear(); };
  }, []);

  const add = async entries => {
    if (!entries.length || pending.current) return false;
    pending.current = true;
    setScanning(true); setError('');
    const scanned = [], failures = [];
    try {
      for (const entry of entries) {
        if (!mounted.current) return false;
        let url, name;
        try {
          if (typeof entry === 'string') {
            const parsed = new URL(entry);
            if (parsed.protocol !== 'https:' || parsed.username || parsed.password) throw new Error('Enter a direct HTTPS video URL.');
            if (/^(.*\.)?(youtube\.com|youtu\.be|youtube-nocookie\.com)$/i.test(parsed.hostname)) throw new Error('YouTube pages are not direct footage. Add a video file you have permission to reuse.');
            url = parsed.href; name = parsed.pathname.split('/').filter(Boolean).at(-1) || parsed.hostname;
          } else {
            name = entry.name;
            if (!/\.(mp4|mov|webm)$/i.test(name)) throw new Error('Choose MP4, MOV or WebM footage.');
            url = URL.createObjectURL(entry); owned.current.add(url);
          }
          if (!sources.some(s => s.url === url) && !scanned.some(s => s.url === url)) scanned.push(await remixMedia(url, name));
        } catch (e) {
          if (owned.current.delete(url)) URL.revokeObjectURL(url);
          failures.push(`${name ? `${name}: ` : ''}${e.message}`);
        }
      }
      if (!mounted.current) return false;
      setSources(current => [...current, ...scanned]);
      setError(failures.join(' '));
      return !failures.length;
    } finally { pending.current = false; if (mounted.current) setScanning(false); }
  };
  return { sources, scanning, add, remove: url => setSources(current => current.filter(s => s.url !== url)) };
}