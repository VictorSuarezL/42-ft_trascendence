import { useEffect, useState } from 'react';
import type { ViewportState } from '../types/types';

const MOBILE_MAX = 430;
const TABLET_MAX = 1024;

function getViewportState(width: number): ViewportState {
  return {
    width,
    isMobile: width <= MOBILE_MAX,
    isTablet: width > MOBILE_MAX && width <= TABLET_MAX,
    isDesktop: width > TABLET_MAX,
  };
}

export function useViewPortWidth() {
  const [viewport, setViewport] = useState<ViewportState>(() =>
    getViewportState(window.innerWidth)
  );

  useEffect(() => {
    function handleResize() {
      setViewport(getViewportState(window.innerWidth));
    }

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return viewport;
}
