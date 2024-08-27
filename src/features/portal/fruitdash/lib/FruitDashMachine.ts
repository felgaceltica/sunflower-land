import { OFFLINE_FARM } from "features/game/lib/landData";
import { assign, createMachine, Interpreter, State } from "xstate";
import { CONFIG } from "lib/config";
import { decodeToken } from "features/auth/actions/login";
import {
  RESTOCK_ATTEMPTS_SFL,
  UNLIMITED_ATTEMPTS_SFL,
  DAILY_ATTEMPTS,
} from "../util/FruitDashConstants";
import { GameState } from "features/game/types/game";
import { purchaseMinigameItem } from "features/game/events/minigames/purchaseMinigameItem";
//import { playMinigame  } from "features/game/events/minigames/playMinigame";
import { startMinigameAttempt } from "features/game/events/minigames/startMinigameAttempt";
import { submitMinigameScore } from "features/game/events/minigames/submitMinigameScore";
import {
  achievementsUnlocked,
  submitScore,
  startAttempt,
} from "features/portal/lib/portalUtil";
import { getUrl, loadPortal } from "features/portal/actions/loadPortal";
import { getAttemptsLeft } from "../util/Utils";
import { unlockMinigameAchievements } from "features/game/events/minigames/unlockMinigameAchievements";
import { FruitDashAchievementsName } from "../FruitDashAchievements";

const getJWT = () => {
  const code = new URLSearchParams(window.location.search).get("jwt");
  return code;
};

export interface Context {
  id: number;
  jwt: string | null;
  isJoystickActive: boolean;
  state: GameState | undefined;
  score: number;
  axes: number;
  startedAt: number;
  attemptsLeft: number;
}

type GainPointsEvent = {
  type: "GAIN_POINTS";
  points: number;
};

type UnlockAchievementsEvent = {
  type: "UNLOCKED_ACHIEVEMENTS";
  achievementNames: FruitDashAchievementsName[];
};

type SetJoystickActiveEvent = {
  type: "SET_JOYSTICK_ACTIVE";
  isJoystickActive: boolean;
};

export type PortalEvent =
  | SetJoystickActiveEvent
  | { type: "START" }
  | { type: "CLAIM" }
  | { type: "CANCEL_PURCHASE" }
  | { type: "PURCHASED_RESTOCK" }
  | { type: "PURCHASED_UNLIMITED" }
  | { type: "RETRY" }
  | { type: "CONTINUE" }
  | { type: "END_GAME_EARLY" }
  | { type: "GAME_OVER" }
  | GainPointsEvent
  | { type: "COLLECT_AXE" }
  | { type: "THROW_AXE" }
  // | { type: "CROP_DEPOSITED" }
  // | { type: "KILL_PLAYER" }
  | UnlockAchievementsEvent;

export type PortalState = {
  value:
    | "initialising"
    | "error"
    | "ready"
    | "unauthorised"
    | "loading"
    | "introduction"
    | "playing"
    | "gameOver"
    | "winner"
    | "loser"
    | "complete"
    | "starting"
    | "noAttempts";
  context: Context;
};

export type MachineInterpreter = Interpreter<
  Context,
  any,
  PortalEvent,
  PortalState
>;

export type PortalMachineState = State<Context, PortalEvent, PortalState>;

export const portalMachine = createMachine<Context, PortalEvent, PortalState>({
  id: "portalMachine",
  initial: "initialising",
  context: {
    id: 0,
    jwt: getJWT(),

    isJoystickActive: false,

    state: CONFIG.API_URL ? undefined : OFFLINE_FARM,

    score: 0,
    axes: 0,
    attemptsLeft: 0,
    startedAt: 0,
  },
  on: {
    SET_JOYSTICK_ACTIVE: {
      actions: assign<Context, any>({
        isJoystickActive: (_: Context, event: SetJoystickActiveEvent) => {
          return event.isJoystickActive;
        },
      }),
    },
    UNLOCKED_ACHIEVEMENTS: {
      actions: assign<Context, any>({
        state: (context: Context, event: UnlockAchievementsEvent) => {
          achievementsUnlocked({ achievementNames: event.achievementNames });
          return unlockMinigameAchievements({
            state: context.state!,
            action: {
              type: "minigame.achievementsUnlocked",
              id: "fruit-dash",
              achievementNames: event.achievementNames,
            },
          });
        },
      }) as any,
    },
  },
  states: {
    initialising: {
      always: [
        {
          target: "unauthorised",
          // TODO: Also validate token
          cond: (context) => !!CONFIG.API_URL && !context.jwt,
        },
        {
          target: "loading",
        },
      ],
    },
    loading: {
      id: "loading",
      invoke: {
        src: async (context) => {
          if (!getUrl()) {
            return { game: OFFLINE_FARM, attemptsLeft: DAILY_ATTEMPTS };
          }

          const { farmId } = decodeToken(context.jwt as string);

          // Load the game data
          const { game } = await loadPortal({
            portalId: CONFIG.PORTAL_APP,
            token: context.jwt as string,
          });

          const minigame = game.minigames.games["fruit-dash"];
          const attemptsLeft = getAttemptsLeft(minigame);

          return { game, farmId, attemptsLeft };
        },
        onDone: [
          {
            target: "introduction",
            actions: assign({
              state: (_: any, event) => event.data.game,
              id: (_: any, event) => event.data.farmId,
              attemptsLeft: (_: any, event) => event.data.attemptsLeft,
            }),
          },
        ],
        onError: {
          target: "error",
        },
      },
    },

    noAttempts: {
      on: {
        CANCEL_PURCHASE: {
          target: "introduction",
        },
        PURCHASED_RESTOCK: {
          target: "introduction",
          actions: assign<Context>({
            state: (context: Context) =>
              purchaseMinigameItem({
                state: context.state!,
                action: {
                  id: "fruit-dash",
                  sfl: RESTOCK_ATTEMPTS_SFL,
                  type: "minigame.itemPurchased",
                  items: {},
                },
              }),
          }) as any,
        },
        PURCHASED_UNLIMITED: {
          target: "introduction",
          actions: assign<Context>({
            state: (context: Context) =>
              purchaseMinigameItem({
                state: context.state!,
                action: {
                  id: "fruit-dash",
                  sfl: UNLIMITED_ATTEMPTS_SFL,
                  type: "minigame.itemPurchased",
                  items: {},
                },
              }),
          }) as any,
        },
      },
    },

    starting: {
      always: [
        {
          target: "noAttempts",
          cond: (context) => {
            const minigame = context.state?.minigames.games["fruit-dash"];
            const attemptsLeft = getAttemptsLeft(minigame);
            return attemptsLeft <= 0;
          },
        },
        {
          target: "ready",
        },
      ],
    },

    introduction: {
      on: {
        CONTINUE: {
          target: "starting",
        },
      },
    },

    ready: {
      on: {
        START: {
          target: "playing",
          actions: assign<Context>({
            startedAt: () => Date.now(),
            score: 0,
            axes: 0,
            state: (context: any) => {
              startAttempt();
              return startMinigameAttempt({
                state: context.state,
                action: {
                  type: "minigame.attemptStarted",
                  id: "fruit-dash",
                },
              });
            },
            attemptsLeft: (context: Context) => context.attemptsLeft - 1,
          }) as any,
        },
      },
    },

    playing: {
      on: {
        GAIN_POINTS: {
          actions: assign<Context, any>({
            score: (context: Context, event: GainPointsEvent) => {
              return context.score + event.points;
            },
          }),
        },
        COLLECT_AXE: {
          actions: assign<Context, any>({
            axes: (context: Context, event: GainPointsEvent) => {
              return context.axes + 1;
            },
          }),
        },
        THROW_AXE: {
          actions: assign<Context, any>({
            axes: (context: Context, event: GainPointsEvent) => {
              return context.axes - 1;
            },
          }),
        },
        END_GAME_EARLY: {
          actions: assign<Context, any>({
            startedAt: (context: any) => 0,
            state: (context: any) => {
              submitScore({ score: context.score });
              return submitMinigameScore({
                state: context.state,
                action: {
                  type: "minigame.scoreSubmitted",
                  score: Math.round(context.score),
                  id: "fruit-dash",
                },
              });
            },
          }),
          target: "introduction",
        },
        GAME_OVER: {
          target: "gameOver",
          actions: assign({
            state: (context: any) => {
              submitScore({ score: context.score });
              return submitMinigameScore({
                state: context.state,
                action: {
                  type: "minigame.scoreSubmitted",
                  score: Math.round(context.score),
                  id: "fruit-dash",
                },
              });
            },
          }) as any,
        },
      },
    },

    gameOver: {
      always: [
        {
          // they have already completed the mission before
          target: "complete",
          cond: (context) => {
            const dateKey = new Date().toISOString().slice(0, 10);

            const minigame = context.state?.minigames.games["fruit-dash"];
            const history = minigame?.history ?? {};

            return !!history[dateKey]?.prizeClaimedAt;
          },
        },

        {
          target: "winner",
          cond: (context) => {
            const prize = context.state?.minigames.prizes["fruit-dash"];
            if (!prize) {
              return false;
            }

            return context.score >= prize.score;
          },
        },
        {
          target: "loser",
          actions: assign({
            score: () => 0,
            axes: () => 0,
            startedAt: () => 0,
          }) as any,
        },
      ],
    },

    winner: {
      on: {
        RETRY: {
          target: "starting",
          actions: assign({
            score: () => 0,
            axes: () => 0,
            startedAt: () => 0,
          }) as any,
        },
      },
    },

    loser: {
      on: {
        RETRY: {
          target: "starting",
          actions: assign({
            score: () => 0,
            axes: () => 0,
            startedAt: () => 0,
          }) as any,
        },
      },
    },

    complete: {
      on: {
        RETRY: {
          target: "starting",
          actions: assign({
            score: () => 0,
            axes: () => 0,
            startedAt: () => 0,
          }) as any,
        },
      },
    },

    error: {
      on: {
        RETRY: {
          target: "initialising",
        },
      },
    },

    unauthorised: {},
  },
});
