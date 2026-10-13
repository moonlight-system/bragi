import { useEffect, useState } from "react";

export type MobileScreen = "playlists" | "songs" | "player" | "settings";

export function useMobileNav() {
  const [stack, setStack] = useState<MobileScreen[]>(["playlists"]);

  useEffect(() => {
    // tag the entry we start on, so coming back to it restores the right stack
    history.replaceState({ stack: ["playlists"] }, "");

    function onPopState(event: PopStateEvent) {
      setStack(event.state?.stack ?? ["playlists"]);
    }
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  function push(screen: MobileScreen) {
    const next = [...stack, screen];
    history.pushState({ stack: next }, "");
    setStack(next);
  }

  function back() {
    if (stack.length > 1) history.back();
  }

  // used by the Playlists tab: pop everything above the root screen
  function goToRoot() {
    if (stack.length > 1) history.go(-(stack.length - 1));
  }

  return { screen: stack[stack.length - 1], stack, push, back, goToRoot };
}