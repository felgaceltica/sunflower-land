import { OFFLINE_FARM } from "features/game/lib/landData";
import { assign, createMachine, Interpreter, State } from "xstate";
import { CONFIG } from "lib/config";
import { decodeToken } from "features/auth/actions/login";
import {
  RESTOCK_ATTEMPTS_SFL,
  UNLIMITED_ATTEMPTS_SFL,
  DAILY_ATTEMPTS,
} from "../util/WhackAMoleConstants";
import { GameState } from "features/game/types/game";
import { purchaseMinigameItem } from "features/game/events/minigames/purchaseMinigameItem";
//import { playMinigame  } from "features/game/events/minigames/playMinigame";
import { startMinigameAttempt } from "features/game/events/minigames/startMinigameAttempt";
import { submitMinigameScore } from "features/game/events/minigames/submitMinigameScore";
import { submitScore, startAttempt } from "features/portal/lib/portalUtil";
import { getUrl, loadPortal } from "features/portal/actions/loadPortal";
import { getAttemptsLeft } from "../util/Utils";
//import { WhackAMoleAchievementsName } from "../WhackAMoleAchievements";

const getJWT = () => {
  const code = new URLSearchParams(window.location.search).get("jwt");
  return code;
};

export interface Context {
  id: number;
  jwt: string | null;
  isJoystickActive: boolean;
  state: GameState | undefined;
  //endAt: number;
  startedAt: number;
  attemptsLeft: number;
  lastScore: number;
  score: number;
  streak: number;
  lives: number;
}

type StartEvent = {
  type: "START";
  //duration: number;
};
type GainPointsEvent = {
  type: "GAIN_POINTS";
  points: number;
  time: number;
  takelife: number;
};
type GameOverEvent = {
  type: "GAME_OVER";
  score: number;
};
type EndEarlyEvent = {
  type: "END_GAME_EARLY";
  score: number;
};

// type UnlockAchievementsEvent = {
//   type: "UNLOCKED_ACHIEVEMENTS";
//   achievementNames: WhackAMoleAchievementsName[];
// };

type SetJoystickActiveEvent = {
  type: "SET_JOYSTICK_ACTIVE";
  isJoystickActive: boolean;
};

export type PortalEvent =
  | SetJoystickActiveEvent
  | { type: "CLAIM" }
  | { type: "CANCEL_PURCHASE" }
  | { type: "PURCHASED_RESTOCK" }
  | { type: "PURCHASED_UNLIMITED" }
  | { type: "RETRY" }
  | { type: "CONTINUE" }
  | { type: "RESET_STREAK" }
  | EndEarlyEvent
  | GainPointsEvent
  | GameOverEvent
  | StartEvent;
// | { type: "CROP_DEPOSITED" }
// | { type: "KILL_PLAYER" }
//| UnlockAchievementsEvent;

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
    attemptsLeft: 0,
    //endAt: 0,
    startedAt: 0,
    score: 0,
    lastScore: 0,
    streak: 0,
    lives: 3,
  },
  on: {
    SET_JOYSTICK_ACTIVE: {
      actions: assign<Context, any>({
        isJoystickActive: (_: Context, event: SetJoystickActiveEvent) => {
          return event.isJoystickActive;
        },
      }),
    },
    // UNLOCKED_ACHIEVEMENTS: {
    //   actions: assign<Context, any>({
    //     state: (context: Context, event: UnlockAchievementsEvent) => {
    //       achievementsUnlocked({ achievementNames: event.achievementNames });
    //       return unlockMinigameAchievements({
    //         state: context.state!,
    //         action: {
    //           type: "minigame.achievementsUnlocked",
    //           id: "mine-whack",
    //           achievementNames: event.achievementNames,
    //         },
    //       });
    //     },
    //   }) as any,
    // },
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

          const minigame = game.minigames.games["mine-whack"];
          const attemptsLeft = getAttemptsLeft(minigame, game);

          return { game, farmId, attemptsLeft };
        },
        onDone: [
          {
            target: "introduction", //TODO: introduction
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
                  id: "mine-whack",
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
                  id: "mine-whack",
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
            const minigame = context.state?.minigames.games["mine-whack"];
            const attemptsLeft = getAttemptsLeft(minigame, context.state);
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
          actions: assign<Context, any>({
            // endAt: (context: Context, event: StartEvent) => {
            //   return Date.now() + event.duration;
            // },
            startedAt: (context: Context, event: StartEvent) => {
              return Date.now();
            },
            score: 0,
            lives: 3,
            state: (context: any) => {
              startAttempt();
              return startMinigameAttempt({
                state: context.state,
                action: {
                  type: "minigame.attemptStarted",
                  id: "mine-whack",
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
        RESET_STREAK: {
          actions: assign<Context, any>({
            streak: (context: Context, event: GainPointsEvent) => {
              return 0;
            },
            lives: (context: Context, event: GainPointsEvent) => {
              return context.lives - 1;
            },
          }),
        },
        GAIN_POINTS: {
          actions: assign<Context, any>({
            streak: (context: Context, event: GainPointsEvent) => {
              if (event.points > 0) {
                return context.streak < 5 ? context.streak + 1 : 5;
              } else {
                return 0;
              }
            },
            score: (context: Context, event: GainPointsEvent) => {
              if (event.points > 0) {
                return context.score + event.points * (context.streak + 1);
              } else {
                return context.score + event.points;
              }
            },
            lives: (context: Context, event: GainPointsEvent) => {
              if (event.points < 0 && event.takelife) {
                return context.lives - 1;
              } else {
                return context.lives;
              }
            },
            // endAt: (context: Context, event: GainPointsEvent) => {
            //   return context.endAt + event.time;
            // },
          }),
        },
        END_GAME_EARLY: {
          target: "gameOver",
          actions: assign<Context, any>({
            //endAt: (context: any) => 0,
            lives: (context: any) => 0,
            lastScore: (context: any) => {
              return context.score;
            },
            state: (context: any) => {
              submitScore({ score: Math.round(context.score) });
              return submitMinigameScore({
                state: context.state,
                action: {
                  type: "minigame.scoreSubmitted",
                  score: Math.round(context.score),
                  id: "mine-whack",
                },
              });
            },
          }),
        },
        GAME_OVER: {
          target: "gameOver",
          actions: assign({
            lastScore: (context: any) => {
              return context.score;
            },
            state: (context: any) => {
              submitScore({ score: Math.round(context.score) });
              return submitMinigameScore({
                state: context.state,
                action: {
                  type: "minigame.scoreSubmitted",
                  score: Math.round(context.score),
                  id: "mine-whack",
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

            const minigame = context.state?.minigames.games["mine-whack"];
            const history = minigame?.history ?? {};

            return !!history[dateKey]?.prizeClaimedAt;
          },
          actions: assign({
            score: () => 0,
            lives: () => 0,
            streak: () => 0,
            startedAt: () => 0,
          }) as any,
        },

        {
          target: "winner",
          cond: (context) => {
            const prize = context.state?.minigames.prizes["mine-whack"];
            if (!prize) {
              return false;
            }

            return context.score >= prize.score;
          },
          actions: assign({
            score: () => 0,
            lives: () => 0,
            streak: () => 0,
            startedAt: () => 0,
          }) as any,
        },
        {
          target: "loser",
          actions: assign({
            score: () => 0,
            lives: () => 0,
            streak: () => 0,
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
            lives: () => 0,
            streak: () => 0,
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
            lives: () => 0,
            streak: () => 0,
            //startedAt: () => 0,
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
            lives: () => 0,
            streak: () => 0,
            //startedAt: () => 0,
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
