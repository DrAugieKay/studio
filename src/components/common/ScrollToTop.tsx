
'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/**
 * A client component that automatically scrolls the window to the top
 * whenever the URL pathname changes.
 */
export default function ScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
