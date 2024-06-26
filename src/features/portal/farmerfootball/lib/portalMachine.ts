import { OFFLINE_FARM } from "features/game/lib/landData";
import { GameState } from "features/game/types/game";
import { assign, createMachine, Interpreter, State } from "xstate";
import { loadPortal } from "../actions/loadPortal";
import { CONFIG } from "lib/config";
import { claimArcadeToken } from "../actions/claimArcadeToken";
import { Client, Room } from "colyseus.js";
import { FarmerFootballRoomState } from "./FarmerFootballRoomState";
import { SPAWNS } from "features/world/lib/spawn";
import { decodeToken } from "features/auth/actions/login";

const getJWT = () => {
  const code = new URLSearchParams(window.location.search).get("jwt");

  return code;
};

const getServer = () => {
  const code = new URLSearchParams(window.location.search).get("server");

  return code;
};

const hasReadRules = () => {
  return !!localStorage.getItem("rules.read");
};

export const acknowledgeCropBoomRules = () => {
  localStorage.setItem("rules.read", new Date().toISOString());
};

export interface FarmerFootballContext {
  id: number;
  jwt: string;
  state: GameState;
  mmoServer?: Room<FarmerFootballRoomState>;
}

export type PortalEvent =
  | { type: "START" }
  | { type: "CLAIM" }
  | { type: "RETRY" }
  | { type: "CONTINUE" };

export type PortalState = {
  value:
    | "initialising"
    | "error"
    | "idle"
    | "ready"
    | "unauthorised"
    | "loading"
    | "claiming"
    | "completed"
    | "rules";
  context: FarmerFootballContext;
};

export type MachineInterpreter = Interpreter<
  FarmerFootballContext,
  any,
  PortalEvent,
  PortalState
>;

export type PortalMachineState = State<
  FarmerFootballContext,
  PortalEvent,
  PortalState
>;

export const portalMachine = createMachine({
  id: "portalMachine",
  initial: "initialising",
  context: {
    id: 0,
    jwt: getJWT(),
    state: CONFIG.API_URL ? undefined : OFFLINE_FARM,

    completeAcknowledged: false,
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
    introduction: {
      always: [
        { target: "rules", cond: () => !hasReadRules() },
        {
          target: "ready",
        },
      ],
    },

    loading: {
      id: "loading",
      invoke: {
        src: async (context) => {
          if (!CONFIG.API_URL) {
            return { game: OFFLINE_FARM };
          }

          const { farmId } = decodeToken(context.jwt as string);

          // Load the game data
          const { game } = await loadPortal({
            portalId: CONFIG.PORTAL_APP,
            token: context.jwt as string,
          });

          // Join the MMO Server
          let mmoServer: Room<FarmerFootballRoomState> | undefined;
          const serverName = getServer() ?? "farmer_football";
          const mmoUrl = CONFIG.ROOM_URL;
          if (serverName && mmoUrl) {
            const client = new Client(mmoUrl);
            mmoServer = await client?.joinOrCreate<FarmerFootballRoomState>(
              serverName,
              {
                jwt: context.jwt,
                bumpkin: game?.bumpkin,
                farmId,
                x: SPAWNS().farmer_football.default.x,
                y: SPAWNS().farmer_football.default.y,
                sceneId: "farmer_football",
                experience: game.bumpkin?.experience ?? 0,
              }
            );
          }

          return { game, mmoServer, farmId };
        },
        onDone: [
          {
            target: "introduction",
            actions: assign({
              state: (_: any, event) => event.data.game,
              mmoServer: (_: any, event) => event.data.mmoServer,
              id: (_: any, event) => event.data.farmId,
            }),
          },
        ],
        onError: {
          target: "error",
        },
      },
    },

    rules: {
      on: {
        CONTINUE: {
          target: "introduction",
        },
      },
    },

    ready: {
      on: {
        CLAIM: {
          target: "claiming",
        },
      },
    },
    claiming: {
      id: "claiming",
      invoke: {
        src: async (context) => {
          const { game } = await claimArcadeToken({
            token: context.jwt as string,
          });

          return { game };
        },
        onDone: [
          {
            target: "completed",
            actions: assign({
              state: (_: any, event) => event.data.game,
            }),
          },
        ],
        onError: [
          {
            target: "error",
          },
        ],
      },
    },

    completed: {
      on: {
        CONTINUE: {
          target: "ready",
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
