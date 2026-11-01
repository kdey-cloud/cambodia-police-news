import { useLayoutEffect } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

const scrollPositions = new Map<string, number>();

export default function ScrollToTop() {
  const location = useLocation();
  const navigationType = useNavigationType();

  useLayoutEffect(() => {
    const currentKey = location.key;

    // Restore previous scroll position when pressing Back or Forward.
    if (navigationType === "POP") {
      const savedPosition = scrollPositions.get(currentKey);

      if (savedPosition !== undefined) {
        window.scrollTo({
          top: savedPosition,
          left: 0,
          behavior: "instant",
        });
      } else {
        window.scrollTo(0, 0);
      }
    } else {
      // New navigation: start at the top.
      window.scrollTo(0, 0);
    }

    return () => {
      // Save the current page's scroll position before leaving.
      scrollPositions.set(currentKey, window.scrollY);
    };
  }, [location.key, navigationType]);

  return null;
}
