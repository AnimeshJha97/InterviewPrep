"use client";

import { useLayoutEffect } from "react";

export function useMarketingReveal() {
  useLayoutEffect(() => {
    const previousScrollRestoration = window.history.scrollRestoration;
    const navigationEntry = window.performance.getEntriesByType("navigation")[0] as
      | PerformanceNavigationTiming
      | undefined;

    window.history.scrollRestoration = "manual";

    if (navigationEntry?.type === "reload") {
      window.scrollTo(0, 0);
    }

    const revealTargets = document.querySelectorAll<HTMLElement>("[data-reveal]");

    revealTargets.forEach((element, index) => {
      element.classList.remove("is-visible");
      element.style.transitionDelay = `${Math.min(index % 4, 3) * 80}ms`;
    });

    document.body.classList.add("marketing-reveal-ready");

    const refreshVisibleState = () => {
      revealTargets.forEach((element) => {
        const rect = element.getBoundingClientRect();
        const isInViewport = rect.top < window.innerHeight * 0.92 && rect.bottom > window.innerHeight * 0.08;

        if (isInViewport) {
          element.classList.add("is-visible");
        }
      });
    };

    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
          }
        });
      },
      {
        threshold: 0.16,
        rootMargin: "0px 0px -12% 0px",
      },
    );

    revealTargets.forEach((element) => revealObserver.observe(element));

    requestAnimationFrame(() => {
      requestAnimationFrame(refreshVisibleState);
    });

    const handlePageShow = () => {
      requestAnimationFrame(() => {
        refreshVisibleState();
      });
    };

    window.addEventListener("pageshow", handlePageShow);
    window.addEventListener("resize", handlePageShow);

    return () => {
      revealObserver.disconnect();
      window.history.scrollRestoration = previousScrollRestoration;
      window.removeEventListener("pageshow", handlePageShow);
      window.removeEventListener("resize", handlePageShow);
    };
  }, []);
}
