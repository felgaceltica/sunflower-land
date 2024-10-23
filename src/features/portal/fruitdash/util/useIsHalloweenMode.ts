import { OFFLINE_FARM } from "features/game/lib/landData";
import { hasFeatureAccess } from "lib/flags";
import { useState, useEffect } from "react";

const LOCAL_STORAGE_KEY = "settings.halloweenMode";
const HALLOWEEN_MODE_EVENT = "halloweenModeChanged";

export function cacheHalloweenModeSetting(value: boolean) {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(value));
  window.dispatchEvent(
    new CustomEvent(HALLOWEEN_MODE_EVENT, { detail: value }),
  );
}

export function getHalloweenModeSetting(): boolean {
  if (hasFeatureAccess(OFFLINE_FARM, "FRUIT_DASH_HALLOWEEN_EVENT")) return true;
  const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
  return cached ? JSON.parse(cached) : false;
}

export const useIsHalloweenMode = () => {
  const [isHalloweenMode, setIsHalloweenMode] = useState(
    getHalloweenModeSetting(),
  );

  const toggleHalloweenMode = () => {
    const newValue = !isHalloweenMode;
    setIsHalloweenMode(newValue);
    cacheHalloweenModeSetting(newValue);
  };

  useEffect(() => {
    const handleHalloweenModeChange = (event: CustomEvent) => {
      setIsHalloweenMode(event.detail);
    };

    window.addEventListener(
      HALLOWEEN_MODE_EVENT as any,
      handleHalloweenModeChange,
    );

    return () => {
      window.removeEventListener(
        HALLOWEEN_MODE_EVENT as any,
        handleHalloweenModeChange,
      );
    };
  }, []);

  return { isHalloweenMode, toggleHalloweenMode };
};
