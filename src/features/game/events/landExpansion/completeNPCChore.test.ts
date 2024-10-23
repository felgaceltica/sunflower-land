import { GameState } from "features/game/types/game";
import { completeNPCChore } from "./completeNPCChore";
import { INITIAL_BUMPKIN, TEST_FARM } from "features/game/lib/constants";
import Decimal from "decimal.js-light";
import { NpcChore } from "features/game/types/choreBoard";

describe("completeNPCChore", () => {
  const CHORE: NpcChore = {
    name: "CHOP_1_TREE",
    reward: { items: { Wood: 1 } },
    initialProgress: 0,
    startedAt: Date.now(),
  };

  it("throws an error if no chore exists for the NPC", () => {
    const state: GameState = {
      ...TEST_FARM,
      choreBoard: {
        chores: {},
      },
    };

    expect(() =>
      completeNPCChore({
        state,
        action: { type: "chore.fulfilled", npcName: "pumpkin' pete" },
      }),
    ).toThrow("No chore exists for this NPC");
  });

  it("throws an error if the chore is already completed", () => {
    const state: GameState = {
      ...TEST_FARM,
      choreBoard: {
        chores: {
          "pumpkin' pete": { ...CHORE, completedAt: Date.now() },
        },
      },
    };

    expect(() =>
      completeNPCChore({
        state,
        action: { type: "chore.fulfilled", npcName: "pumpkin' pete" },
      }),
    ).toThrow("Chore is already completed");
  });

  it("throws an error if chore requirements are not met", () => {
    const state: GameState = {
      ...TEST_FARM,
      bumpkin: {
        ...INITIAL_BUMPKIN,
        activity: {},
      },
      choreBoard: {
        chores: {
          "pumpkin' pete": CHORE,
        },
      },
    };

    expect(() =>
      completeNPCChore({
        state,
        action: { type: "chore.fulfilled", npcName: "pumpkin' pete" },
      }),
    ).toThrow("Chore requirements not met");
  });

  it("completes the chore when requirements are met", () => {
    const state: GameState = {
      ...TEST_FARM,
      bumpkin: {
        ...INITIAL_BUMPKIN,
        activity: { "Tree Chopped": 1 },
      },
      choreBoard: {
        chores: {
          "pumpkin' pete": CHORE,
        },
      },
    };

    const newState = completeNPCChore({
      state,
      action: { type: "chore.fulfilled", npcName: "pumpkin' pete" },
    });

    expect(
      newState.choreBoard.chores["pumpkin' pete"]?.completedAt,
    ).toBeDefined();
  });

  it("completes the chore when requirements are met with initial progress", () => {
    const state: GameState = {
      ...TEST_FARM,
      bumpkin: {
        ...INITIAL_BUMPKIN,
        activity: { "Tree Chopped": 2 },
      },
      choreBoard: {
        chores: {
          "pumpkin' pete": { ...CHORE, initialProgress: 1 },
        },
      },
    };

    const newState = completeNPCChore({
      state,
      action: { type: "chore.fulfilled", npcName: "pumpkin' pete" },
    });

    expect(
      newState.choreBoard.chores["pumpkin' pete"]?.completedAt,
    ).toBeDefined();
  });

  it("provides rewards when completing the chore", () => {
    const state: GameState = {
      ...TEST_FARM,
      bumpkin: {
        ...INITIAL_BUMPKIN,
        activity: { "Tree Chopped": 1 },
      },
      choreBoard: {
        chores: {
          "pumpkin' pete": CHORE,
        },
      },
    };

    const newState = completeNPCChore({
      state,
      action: { type: "chore.fulfilled", npcName: "pumpkin' pete" },
    });

    expect(newState.inventory.Wood).toEqual(new Decimal(1));
  });

  it("increases NPC friendship points when completing the chore", () => {
    const state: GameState = {
      ...TEST_FARM,
      bumpkin: {
        ...INITIAL_BUMPKIN,
        activity: { "Tree Chopped": 1 },
      },
      choreBoard: {
        chores: {
          "pumpkin' pete": CHORE,
        },
      },
    };

    const newState = completeNPCChore({
      state,
      action: { type: "chore.fulfilled", npcName: "pumpkin' pete" },
    });

    expect(newState.npcs?.["pumpkin' pete"]?.friendship?.points).toBe(1);
  });

  it("provides normal ticket rewards", () => {
    const state: GameState = {
      ...TEST_FARM,
      bumpkin: {
        ...INITIAL_BUMPKIN,
        activity: { "Tree Chopped": 1 },
      },
      choreBoard: {
        chores: {
          "pumpkin' pete": {
            ...CHORE,
            reward: { items: { ["Amber Fossil"]: 1 } },
          },
        },
      },
    };

    const newState = completeNPCChore({
      state,
      action: { type: "chore.fulfilled", npcName: "pumpkin' pete" },
      createdAt: new Date("2024-10-22").getTime(),
    });

    expect(newState.inventory["Amber Fossil"]).toEqual(new Decimal(1));
  });

  it("provides VIP ticket rewards", () => {
    const state: GameState = {
      ...TEST_FARM,
      bumpkin: {
        ...INITIAL_BUMPKIN,
        activity: { "Tree Chopped": 1 },
      },
      inventory: {
        "Lifetime Farmer Banner": new Decimal(1),
      },
      choreBoard: {
        chores: {
          "pumpkin' pete": {
            ...CHORE,
            reward: { items: { ["Amber Fossil"]: 1 } },
          },
        },
      },
    };

    const newState = completeNPCChore({
      state,
      action: { type: "chore.fulfilled", npcName: "pumpkin' pete" },
      createdAt: new Date("2024-10-22").getTime(),
    });

    expect(newState.inventory["Amber Fossil"]).toEqual(new Decimal(3));
  });
});
