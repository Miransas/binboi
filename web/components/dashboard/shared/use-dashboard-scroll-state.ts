"use client";

import { useEffect, useState } from "react";

export function useDashboardScrollState(rootId = "dashboard-scroll-root", threshold = 56) {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const element = document.getElementById(rootId);
    if (!element) {
      return;
    }

    const handleScroll = () => {
      setIsScrolled(element.scrollTop > threshold);
    };

    handleScroll();
    element.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      element.removeEventListener("scroll", handleScroll);
    };
  }, [rootId, threshold]);

  return isScrolled;
}
