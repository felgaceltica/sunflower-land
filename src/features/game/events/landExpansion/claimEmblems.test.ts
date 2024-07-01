import { TEST_FARM } from "features/game/lib/constants";
import { claimEmblems } from "./claimEmblems";
import { FACTIONS, FACTION_EMBLEMS } from "./joinFaction";

describe("claimEmblems", () => {
  it("should throw if no faction has been pledged", () => {
    expect(() =>
      claimEmblems({
        state: TEST_FARM,
        action: {
          type: "emblems.claimed",
        },
      })
    ).toThrow("No faction has been pledged");
  });

  it("should throw if emblems have already been claimed", () => {
    expect(() =>
      claimEmblems({
        state: {
          ...TEST_FARM,
          faction: {
            name: "bumpkins",
            pledgedAt: 1,
            history: {},
            emblemsClaimedAt: 2,
            points: 10,
            donated: {
              daily: {
                resources: {},
                sfl: {},
              },
              totalItems: {},
            },
          },
        },
        action: {
          type: "emblems.claimed",
        },
      })
    ).toThrow("Emblems have already been claimed");
  });

  it("sets the emblems claimed at date", () => {
    const now = Date.now();

    const state = claimEmblems({
      state: {
        ...TEST_FARM,
        faction: {
          name: "bumpkins",
          history: {},
          pledgedAt: 1,
          points: 10,
          donated: {
            daily: {
              resources: {},
              sfl: {},
            },
            totalItems: {},
          },
        },
        createdAt: now,
      },
      action: {
        type: "emblems.claimed",
      },
      createdAt: now,
    });

    expect(state.faction?.emblemsClaimedAt).toEqual(now);
  });

  it.each(FACTIONS)("claims emblems for the %s faction", (faction) => {
    const points = 10;

    const state = claimEmblems({
      state: {
        ...TEST_FARM,
        faction: {
          name: faction,
          history: {},
          pledgedAt: 1,
          points,
          donated: {
            daily: {
              resources: {},
              sfl: {},
            },
            totalItems: {},
          },
        },
      },
      action: {
        type: "emblems.claimed",
      },
    });

    expect(state.inventory[FACTION_EMBLEMS[faction]]?.toNumber()).toStrictEqual(
      points
    );
  });
});
