import { GameState } from "features/game/types/game";
import { SEASONS } from "features/game/types/seasons";
import { CONFIG } from "lib/config";

const defaultFeatureFlag = ({ inventory }: GameState) =>
  CONFIG.NETWORK === "amoy" || !!inventory["Beta Pass"]?.gt(0);

const betaFeatureFlag = ({ inventory }: GameState) =>
  !!inventory["Beta Pass"]?.gt(0);

const testnetFeatureFlag = () => CONFIG.NETWORK === "amoy";

const timeBasedFeatureFlag = (date: Date) => () => {
  return testnetFeatureFlag() || Date.now() > date.getTime();
};

const betaTimeBasedFeatureFlag = (date: Date) => (game: GameState) => {
  return defaultFeatureFlag(game) || Date.now() > date.getTime();
};

const periodBasedFeatureFlag = (startDate: Date, endDate: Date) => () => {
  return Date.now() > startDate.getTime() && Date.now() < endDate.getTime();
};

// Used for testing production features
export const ADMIN_IDS = [1, 3, 51, 39488, 128727];
/**
 * Adam: 1
 * Spencer: 3
 * Sacul: 51
 * Craig: 39488
 * Elias: 128727
 */

type FeatureFlag = (game: GameState) => boolean;

export type ExperimentName = "ONBOARDING_CHALLENGES" | "GEM_BOOSTS";

/*
 * How to Use:
 * Add the feature name to this list when working on a new feature.
 * When the feature is ready for public release, delete the feature from this list.
 *
 * Do not delete JEST_TEST.
 */
const featureFlags = {
  CHORE_BOARD: defaultFeatureFlag,
  ONBOARDING_REWARDS: (game: GameState) =>
    game.experiments.includes("ONBOARDING_CHALLENGES"),
  SEASONAL_TIERS: timeBasedFeatureFlag(new Date("2024-11-01T00:00:00Z")),
  MARKETPLACE: testnetFeatureFlag,
  CROP_QUICK_SELECT: () => false,
  FRUIT_DASH: betaTimeBasedFeatureFlag(new Date("2024-09-10T00:00:00Z")),
  FRUIT_DASH_HALLOWEEN: timeBasedFeatureFlag(new Date("2024-11-01T00:00:00Z")),
  FRUIT_DASH_HALLOWEEN_EVENT: periodBasedFeatureFlag(
    new Date("2024-10-30T00:00:00Z"),
    new Date("2024-11-01T00:00:00Z"),
  ),
  PORTALS: testnetFeatureFlag,
  JEST_TEST: defaultFeatureFlag,
  EASTER: () => false, // To re-enable next easter
  SKILLS_REVAMP: testnetFeatureFlag,
  FSL: betaTimeBasedFeatureFlag(new Date("2024-10-10T00:00:00Z")),
  NEW_RESOURCES_GE: defaultFeatureFlag,
  ANIMAL_BUILDINGS: testnetFeatureFlag,
  BARLEY: testnetFeatureFlag,
  GEM_BOOSTS: (game: GameState) => game.experiments.includes("GEM_BOOSTS"),
  CHICKEN_GARBO: timeBasedFeatureFlag(SEASONS["Pharaoh's Treasure"].endDate),
  CRAFTING_BOX: betaTimeBasedFeatureFlag(new Date("2024-11-01T00:00:00Z")),
  FLOWER_BOUNTIES: timeBasedFeatureFlag(new Date("2024-11-01T00:00:00Z")),
} satisfies Record<string, FeatureFlag>;

export type FeatureName = keyof typeof featureFlags;

export const hasFeatureAccess = (game: GameState, featureName: FeatureName) => {
  return featureFlags[featureName](game);
};
