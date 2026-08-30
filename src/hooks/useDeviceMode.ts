'use client';

import { useState, useEffect } from 'react';

export interface DeviceMode {
  isMobile: boolean;      // <= 768px (Smartphones)
  isTablet: boolean;      // 769px - 1024px (iPads / Tablets)
  isDesktop: boolean;     // > 1024px (Notebooks e Monitores)
  isPortrait: boolean;    // Altura > Largura
  isLandscape: boolean;   // Largura >= Altura
  screenWidth: number;
  screenHeight: number;
  isTouchDevice: boolean;
}

export function useDeviceMode(): DeviceMode {
  const [deviceMode, setDeviceMode] = useState<DeviceMode>(() => {
    if (typeof window === 'undefined') {
      return {
        isMobile: false,
        isTablet: false,
        isDesktop: true,
        isPortrait: false,
        isLandscape: true,
        screenWidth: 1280,
        screenHeight: 800,
        isTouchDevice: false,
      };
    }

    const w = window.innerWidth;
    const h = window.innerHeight;
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    return {
      isMobile: w <= 768,
      isTablet: w > 768 && w <= 1024,
      isDesktop: w > 1024,
      isPortrait: h > w,
      isLandscape: w >= h,
      screenWidth: w,
      screenHeight: h,
      isTouchDevice: isTouch,
    };
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let resizeTimer: NodeJS.Timeout;

    const handleResizeOrOrientation = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        const w = window.innerWidth;
        const h = window.innerHeight;
        const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

        setDeviceMode({
          isMobile: w <= 768,
          isTablet: w > 768 && w <= 1024,
          isDesktop: w > 1024,
          isPortrait: h > w,
          isLandscape: w >= h,
          screenWidth: w,
          screenHeight: h,
          isTouchDevice: isTouch,
        });
      }, 50);
    };

    window.addEventListener('resize', handleResizeOrOrientation, { passive: true });
    window.addEventListener('orientationchange', handleResizeOrOrientation, { passive: true });

    return () => {
      clearTimeout(resizeTimer);
      window.removeEventListener('resize', handleResizeOrOrientation);
      window.removeEventListener('orientationchange', handleResizeOrOrientation);
    };
  }, []);

  return deviceMode;
}
