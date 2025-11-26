'use client'
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import type { FC } from 'react'; // Optional: for explicit typing

const ScrollToTop: FC = () => {
  const pathname = usePathname();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

export default ScrollToTop;