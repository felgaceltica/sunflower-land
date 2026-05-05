import { OFFLINE_FARM } from "features/game/lib/landData";
import { hasFeatureAccess, TIMED_EVENT_NAME } from "lib/flags";
import { useState } from "react";

export function getIsTimedEvent(EVENT_NAME: string): boolean {
  if (hasFeatureAccess(OFFLINE_FARM, "FRUIT_DASH_TIMED_EVENT"))
    return TIMED_EVENT_NAME == EVENT_NAME;
  return false;
}

export const useIsTimedEvent = (EVENT_NAME: string) => {
  const [isTimedEvent, setIsTimedEvent] = useState(getIsTimedEvent(EVENT_NAME));

  return { isTimedEvent };
};
