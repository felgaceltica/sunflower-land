import Decimal from "decimal.js-light";
import { feedAnimal } from "./feedAnimal";
import { INITIAL_FARM } from "features/game/lib/constants";

describe("feedAnimal", () => {
  const now = Date.now();

  it("gives 10 experience feeding hay to a level 1 chicken", () => {
    const chickenId = "xyz";

    const state = feedAnimal({
      createdAt: now,
      state: {
        ...INITIAL_FARM,
        inventory: {
          ...INITIAL_FARM.inventory,
          Hay: new Decimal(1),
        },
        henHouse: {
          ...INITIAL_FARM.henHouse,
          animals: {
            [chickenId]: {
              coordinates: { x: 0, y: 0 },
              id: chickenId,
              type: "Chicken",
              createdAt: 0,
              state: "idle",
              experience: 0,
              asleepAt: 0,
              lovedAt: 0,
              item: "Petting Hand",
            },
          },
        },
      },
      action: {
        type: "animal.fed",
        animal: "Chicken",
        id: chickenId,
        item: "Hay",
      },
    });

    expect(state.henHouse.animals[chickenId].experience).toBe(10);
  });

  it("gives 60 experience feeding kernel blend to a level 1 chicken", () => {
    const chickenId = "xyz";

    const state = feedAnimal({
      createdAt: now,
      state: {
        ...INITIAL_FARM,
        inventory: {
          ...INITIAL_FARM.inventory,
          "Kernel Blend": new Decimal(1),
        },
        henHouse: {
          ...INITIAL_FARM.henHouse,
          animals: {
            [chickenId]: {
              coordinates: { x: 0, y: 0 },
              id: chickenId,
              type: "Chicken",
              createdAt: 0,
              state: "idle",
              experience: 0,
              asleepAt: 0,
              lovedAt: 0,
              item: "Petting Hand",
            },
          },
        },
      },
      action: {
        type: "animal.fed",
        animal: "Chicken",
        id: chickenId,
        item: "Kernel Blend",
      },
    });

    expect(state.henHouse.animals[chickenId].experience).toBe(60);
  });

  it("gives 60 experience feeding kernel blend to a level 2 chicken", () => {
    const chickenId = "xyz";

    const state = feedAnimal({
      createdAt: now,
      state: {
        ...INITIAL_FARM,
        inventory: {
          ...INITIAL_FARM.inventory,
          "Kernel Blend": new Decimal(1),
        },
        henHouse: {
          ...INITIAL_FARM.henHouse,
          animals: {
            [chickenId]: {
              coordinates: { x: 0, y: 0 },
              id: chickenId,
              type: "Chicken",
              createdAt: 0,
              state: "idle",
              experience: 20,
              asleepAt: 0,
              lovedAt: 0,
              item: "Petting Hand",
            },
          },
        },
      },
      action: {
        type: "animal.fed",
        animal: "Chicken",
        id: chickenId,
        item: "Kernel Blend",
      },
    });

    expect(state.henHouse.animals[chickenId].experience).toBe(80);
  });

  it("feeds a cow", () => {
    const cowId = "123";

    const state = feedAnimal({
      createdAt: now,
      state: {
        ...INITIAL_FARM,
        inventory: {
          ...INITIAL_FARM.inventory,
          "Kernel Blend": new Decimal(5),
        },
        barn: {
          ...INITIAL_FARM.barn,
          animals: {
            [cowId]: {
              coordinates: { x: 0, y: 0 },
              id: cowId,
              type: "Cow",
              createdAt: 0,
              state: "idle",
              experience: 0,
              asleepAt: 0,
              lovedAt: 0,
              item: "Petting Hand",
            },
          },
        },
      },
      action: {
        type: "animal.fed",
        animal: "Cow",
        id: cowId,
        item: "Kernel Blend",
      },
    });

    expect(state.barn.animals[cowId].experience).not.toBe(0);
  });

  it("requires animal exists", () => {
    expect(() =>
      feedAnimal({
        createdAt: now,
        state: {
          ...INITIAL_FARM,
          inventory: {
            ...INITIAL_FARM.inventory,
            "Kernel Blend": new Decimal(1),
          },
          barn: {
            ...INITIAL_FARM.barn,
            animals: {},
          },
        },
        action: {
          type: "animal.fed",
          animal: "Cow",
          id: "123",
          item: "Kernel Blend",
        },
      }),
    ).toThrow("Animal 123 not found in building barn");
  });

  it("requires food exists in player inventory", () => {
    const cowId = "123";

    expect(() =>
      feedAnimal({
        createdAt: now,
        state: {
          ...INITIAL_FARM,
          barn: {
            ...INITIAL_FARM.barn,
            animals: {
              [cowId]: {
                coordinates: { x: 0, y: 0 },
                id: cowId,
                type: "Cow",
                createdAt: 0,
                state: "idle",
                experience: 0,
                asleepAt: 0,
                lovedAt: 0,
                item: "Petting Hand",
              },
            },
          },
        },
        action: {
          type: "animal.fed",
          animal: "Cow",
          id: cowId,
          item: "Kernel Blend",
        },
      }),
    ).toThrow("Player does not have enough Kernel Blend");
  });

  it("subtracts food from player inventory", () => {
    const cowId = "123";

    const state = feedAnimal({
      createdAt: now,
      state: {
        ...INITIAL_FARM,
        inventory: {
          ...INITIAL_FARM.inventory,
          "Kernel Blend": new Decimal(6),
        },
        barn: {
          ...INITIAL_FARM.barn,
          animals: {
            [cowId]: {
              coordinates: { x: 0, y: 0 },
              id: cowId,
              type: "Cow",
              createdAt: 0,
              state: "idle",
              experience: 0,
              asleepAt: 0,
              lovedAt: 0,
              item: "Petting Hand",
            },
          },
        },
      },
      action: {
        type: "animal.fed",
        animal: "Cow",
        id: cowId,
        item: "Kernel Blend",
      },
    });

    expect(state.inventory["Kernel Blend"]).toStrictEqual(new Decimal(1));
  });

  it("throws if the animal is asleep", () => {
    const chickenId = "xyz";

    expect(() =>
      feedAnimal({
        createdAt: now,
        state: {
          ...INITIAL_FARM,
          inventory: {
            ...INITIAL_FARM.inventory,
            "Kernel Blend": new Decimal(1),
          },
          henHouse: {
            ...INITIAL_FARM.henHouse,
            animals: {
              [chickenId]: {
                coordinates: { x: 0, y: 0 },
                id: chickenId,
                type: "Chicken",
                createdAt: 0,
                state: "idle",
                experience: 50,
                asleepAt: now,
                lovedAt: 0,
                item: "Petting Hand",
              },
            },
          },
        },
        action: {
          type: "animal.fed",
          animal: "Chicken",
          id: chickenId,
          item: "Kernel Blend",
        },
      }),
    ).toThrow("Animal is asleep");
  });

  it("throws an error if no food is provided and no Golden Egg is placed", () => {
    const chickenId = "xyz";

    expect(() =>
      feedAnimal({
        createdAt: now,
        state: {
          ...INITIAL_FARM,
          inventory: {},
          collectibles: {},
          henHouse: {
            ...INITIAL_FARM.henHouse,
            animals: {
              [chickenId]: {
                coordinates: { x: 0, y: 0 },
                id: chickenId,
                type: "Chicken",
                createdAt: 0,
                state: "idle",
                experience: 0,
                asleepAt: 0,
                lovedAt: 0,
                item: "Petting Hand",
              },
            },
          },
        },
        action: {
          type: "animal.fed",
          animal: "Chicken",
          id: chickenId,
        },
      }),
    ).toThrow("No food provided");
  });

  it("feeds for free if Golden Egg is placed and feeding Chicken", () => {
    const chickenId = "xyz";

    const state = feedAnimal({
      createdAt: now,
      state: {
        ...INITIAL_FARM,
        inventory: {
          ...INITIAL_FARM.inventory,
          "Gold Egg": new Decimal(1),
          Hay: new Decimal(1),
        },
        collectibles: {
          "Gold Egg": [
            {
              coordinates: { x: 0, y: 0 },
              createdAt: 0,
              id: "1",
              readyAt: 0,
            },
          ],
        },
        henHouse: {
          ...INITIAL_FARM.henHouse,
          animals: {
            [chickenId]: {
              coordinates: { x: 0, y: 0 },
              id: chickenId,
              type: "Chicken",
              createdAt: 0,
              state: "idle",
              experience: 0,
              asleepAt: 0,
              lovedAt: 0,
              item: "Petting Hand",
            },
          },
        },
      },
      action: {
        type: "animal.fed",
        animal: "Chicken",
        id: chickenId,
      },
    });

    expect(state.inventory.Hay).toStrictEqual(new Decimal(1));
  });

  it("picks the favourite food if Golden Egg is placed and feeding Chicken", () => {
    const chickenId = "xyz";

    const state = feedAnimal({
      createdAt: now,
      state: {
        ...INITIAL_FARM,
        inventory: {
          ...INITIAL_FARM.inventory,
          "Gold Egg": new Decimal(1),
        },
        collectibles: {
          "Gold Egg": [
            {
              coordinates: { x: 0, y: 0 },
              createdAt: 0,
              id: "1",
              readyAt: 0,
            },
          ],
        },
        henHouse: {
          ...INITIAL_FARM.henHouse,
          animals: {
            [chickenId]: {
              coordinates: { x: 0, y: 0 },
              id: chickenId,
              type: "Chicken",
              createdAt: 0,
              state: "idle",
              experience: 0,
              asleepAt: 0,
              lovedAt: 0,
              item: "Petting Hand",
            },
          },
        },
      },
      action: {
        type: "animal.fed",
        animal: "Chicken",
        id: chickenId,
      },
    });

    expect(state.henHouse.animals[chickenId].experience).toBe(60);
  });

  it("does not feed for free if Golden Egg is placed and feeding Cow", () => {
    const cowId = "123";

    expect(() =>
      feedAnimal({
        createdAt: now,
        state: {
          ...INITIAL_FARM,
          inventory: {
            ...INITIAL_FARM.inventory,
            "Gold Egg": new Decimal(1),
          },
          collectibles: {
            "Gold Egg": [
              {
                coordinates: { x: 0, y: 0 },
                createdAt: 0,
                id: "1",
                readyAt: 0,
              },
            ],
          },
          barn: {
            ...INITIAL_FARM.barn,
            animals: {
              [cowId]: {
                coordinates: { x: 0, y: 0 },
                id: cowId,
                type: "Cow",
                createdAt: 0,
                state: "idle",
                experience: 50,
                asleepAt: 0,
                lovedAt: 0,
                item: "Petting Hand",
              },
            },
          },
        },
        action: {
          type: "animal.fed",
          animal: "Cow",
          id: cowId,
          item: "Hay",
        },
      }),
    ).toThrow("Player does not have enough Hay");
  });

  it("sets the state to happy if fed favourite food", () => {
    const chickenId = "xyz";

    const state = feedAnimal({
      createdAt: now,
      state: {
        ...INITIAL_FARM,
        inventory: {
          ...INITIAL_FARM.inventory,
          "Kernel Blend": new Decimal(1),
        },
        henHouse: {
          ...INITIAL_FARM.henHouse,
          animals: {
            [chickenId]: {
              coordinates: { x: 0, y: 0 },
              id: chickenId,
              type: "Chicken",
              createdAt: 0,
              state: "idle",
              experience: 120,
              asleepAt: 0,
              lovedAt: 0,
              item: "Petting Hand",
            },
          },
        },
      },
      action: {
        type: "animal.fed",
        animal: "Chicken",
        id: chickenId,
        item: "Kernel Blend",
      },
    });

    expect(state.henHouse.animals[chickenId].state).toBe("happy");
  });

  it("sets the state to sad not fed favourite food", () => {
    const chickenId = "xyz";

    const state = feedAnimal({
      createdAt: now,
      state: {
        ...INITIAL_FARM,
        inventory: {
          ...INITIAL_FARM.inventory,
          Hay: new Decimal(1),
        },
        henHouse: {
          ...INITIAL_FARM.henHouse,
          animals: {
            [chickenId]: {
              coordinates: { x: 0, y: 0 },
              id: chickenId,
              type: "Chicken",
              createdAt: 0,
              state: "idle",
              experience: 0,
              asleepAt: 0,
              lovedAt: 0,
              item: "Petting Hand",
            },
          },
        },
      },
      action: {
        type: "animal.fed",
        animal: "Chicken",
        id: chickenId,
        item: "Hay",
      },
    });

    expect(state.henHouse.animals[chickenId].state).toBe("sad");
  });

  it("sets the state to ready when levelling up", () => {
    const chickenId = "xyz";

    const state = feedAnimal({
      createdAt: now,
      state: {
        ...INITIAL_FARM,
        inventory: {
          ...INITIAL_FARM.inventory,
          "Kernel Blend": new Decimal(1),
        },
        henHouse: {
          ...INITIAL_FARM.henHouse,
          animals: {
            [chickenId]: {
              coordinates: { x: 0, y: 0 },
              id: chickenId,
              type: "Chicken",
              createdAt: 0,
              state: "idle",
              experience: 20,
              asleepAt: 0,
              lovedAt: 0,
              item: "Petting Hand",
            },
          },
        },
      },
      action: {
        type: "animal.fed",
        animal: "Chicken",
        id: chickenId,
        item: "Kernel Blend",
      },
    });

    expect(state.henHouse.animals[chickenId].state).toBe("ready");
  });
  it("cures a sick animal with Barn Delight", () => {
    const chickenId = "xyz";

    const state = feedAnimal({
      createdAt: now,
      state: {
        ...INITIAL_FARM,
        inventory: {
          ...INITIAL_FARM.inventory,
          "Barn Delight": new Decimal(1),
        },
        henHouse: {
          ...INITIAL_FARM.henHouse,
          animals: {
            [chickenId]: {
              coordinates: { x: 0, y: 0 },
              id: chickenId,
              type: "Chicken",
              createdAt: 0,
              state: "sick",
              experience: 0,
              asleepAt: 0,
              lovedAt: 0,
              item: "Petting Hand",
            },
          },
        },
      },
      action: {
        type: "animal.fed",
        animal: "Chicken",
        id: chickenId,
        item: "Barn Delight",
      },
    });

    expect(state.henHouse.animals[chickenId].state).toBe("idle");
    expect(state.inventory["Barn Delight"]).toStrictEqual(new Decimal(0));
    expect(state.henHouse.animals[chickenId].experience).toBe(0);
  });

  it("throws an error when trying to cure a healthy animal", () => {
    const chickenId = "xyz";

    expect(() =>
      feedAnimal({
        createdAt: now,
        state: {
          ...INITIAL_FARM,
          inventory: {
            ...INITIAL_FARM.inventory,
            "Barn Delight": new Decimal(1),
          },
          henHouse: {
            ...INITIAL_FARM.henHouse,
            animals: {
              [chickenId]: {
                coordinates: { x: 0, y: 0 },
                id: chickenId,
                type: "Chicken",
                createdAt: 0,
                state: "idle",
                experience: 0,
                asleepAt: 0,
                lovedAt: 0,
                item: "Petting Hand",
              },
            },
          },
        },
        action: {
          type: "animal.fed",
          animal: "Chicken",
          id: chickenId,
          item: "Barn Delight",
        },
      }),
    ).toThrow("Cannot cure a healthy animal");
  });

  it("throws an error when trying to cure without Barn Delight", () => {
    const chickenId = "xyz";

    expect(() =>
      feedAnimal({
        createdAt: now,
        state: {
          ...INITIAL_FARM,
          henHouse: {
            ...INITIAL_FARM.henHouse,
            animals: {
              [chickenId]: {
                coordinates: { x: 0, y: 0 },
                id: chickenId,
                type: "Chicken",
                createdAt: 0,
                state: "sick",
                experience: 0,
                asleepAt: 0,
                lovedAt: 0,
                item: "Petting Hand",
              },
            },
          },
        },
        action: {
          type: "animal.fed",
          animal: "Chicken",
          id: chickenId,
          item: "Barn Delight",
        },
      }),
    ).toThrow("Not enough Barn Delight to cure the animal");
  });

  // Update the existing test for feeding a sick animal
  it("throws if the animal is sick and not fed Barn Delight", () => {
    const chickenId = "xyz";

    expect(() =>
      feedAnimal({
        createdAt: now,
        state: {
          ...INITIAL_FARM,
          inventory: {
            ...INITIAL_FARM.inventory,
            "Kernel Blend": new Decimal(1),
          },
          henHouse: {
            ...INITIAL_FARM.henHouse,
            animals: {
              [chickenId]: {
                coordinates: { x: 0, y: 0 },
                id: chickenId,
                type: "Chicken",
                createdAt: 0,
                state: "sick",
                experience: 0,
                asleepAt: 0,
                lovedAt: 0,
                item: "Petting Hand",
              },
            },
          },
        },
        action: {
          type: "animal.fed",
          animal: "Chicken",
          id: chickenId,
          item: "Kernel Blend",
        },
      }),
    ).toThrow("Cannot feed a sick animal");
  });

  it("increments the bumpkin activity when feeding an animal", () => {
    const state = feedAnimal({
      createdAt: now,
      state: {
        ...INITIAL_FARM,
        inventory: {
          ...INITIAL_FARM.inventory,
          "Kernel Blend": new Decimal(1),
        },
      },
      action: {
        type: "animal.fed",
        animal: "Chicken",
        id: "0",
        item: "Kernel Blend",
      },
    });

    expect(state.bumpkin?.activity["Chicken Fed"]).toBe(1);
  });

  it("increments the bumpkin activity when curing an animal", () => {
    const state = feedAnimal({
      createdAt: now,
      state: {
        ...INITIAL_FARM,
        inventory: {
          ...INITIAL_FARM.inventory,
          "Barn Delight": new Decimal(1),
        },
        henHouse: {
          ...INITIAL_FARM.henHouse,
          animals: {
            "0": {
              ...INITIAL_FARM.henHouse.animals["0"],
              state: "sick",
            },
          },
        },
      },
      action: {
        type: "animal.fed",
        animal: "Chicken",
        id: "0",
        item: "Barn Delight",
      },
    });

    expect(state.bumpkin?.activity["Chicken Cured"]).toBe(1);
  });
});
