import { OFFLINE_FARM } from "features/game/lib/landData";
import { useState } from "react";

export function getIsTimedEvent(EVENT_NAME: string): boolean {
  if (hasFeatureAccessFruitDash(OFFLINE_FARM, "FRUIT_DASH_TIMED_EVENT"))
    return TIMED_EVENT_NAME == EVENT_NAME;
  return false;
}

export const useIsTimedEvent = (EVENT_NAME: string) => {
  const [isTimedEvent, setIsTimedEvent] = useState(getIsTimedEvent(EVENT_NAME));

  return { isTimedEvent };
};

const periodBasedFeatureFlag =
  (startDate: Date, endDate: Date) => (game: GameState) => {
    return Date.now() > startDate.getTime() && Date.now() < endDate.getTime();
  };

const FRUIT_DASH_FEATURE_FLAGS = {
  FRUIT_DASH_TIMED_EVENT: periodBasedFeatureFlag(
    new Date("2025-04-17T00:00:00Z"),
    new Date("2025-04-21T00:00:00Z"),
  ),
} satisfies Record<string, FeatureFlag>;

//export type FeatureName = keyof typeof FEATURE_FLAGS;

export const hasFeatureAccessFruitDash = (
  game: GameState,
  featureName: FeatureName,
) => {
  return FRUIT_DASH_FEATURE_FLAGS[featureName](game);
};

const TIMED_EVENT_NAME = "EASTER";
