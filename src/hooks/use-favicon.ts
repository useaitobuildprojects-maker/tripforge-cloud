import { useEffect } from 'react';

export const useFavicon = (href?: string | null) => {
  useEffect(() => {
    if (!href) return;

    const head = document.head;

    const ensureIcon = (rel: string) => {
      let link = head.querySelector<HTMLLinkElement>(`link[rel='${rel}']`);
      if (!link) {
        link = document.createElement('link');
        link.rel = rel;
        head.appendChild(link);
      }
      link.type = 'image/png';
      link.href = href;
    };

    ensureIcon('icon');
    ensureIcon('shortcut icon');
  }, [href]);
};
