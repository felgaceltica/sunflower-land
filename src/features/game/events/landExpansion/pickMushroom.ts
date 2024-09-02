import Decimal from "decimal.js-light";
import { GameState } from "../../types/game";
import { produce } from "immer";

export type PickMushroomAction = {
  type: "mushroom.picked";
  id: string;
};

type Options = {
  state: Readonly<GameState>;
  action: PickMushroomAction;
  createdAt?: number;
};

export function pickMushroom({
  state,
  action,
  createdAt = Date.now(),
}: Options) {
  return produce(state, (copy) => {
    const mushrooms = copy.mushrooms?.mushrooms;

    if (!mushrooms) {
      throw new Error("Mushrooms not populated");
    }

    const mushroom = mushrooms[action.id];
    if (!mushroom) {
      throw new Error(`Mushroom not found: ${action.id}`);
    }

    delete mushrooms[action.id];

    const inventoryMushrooms = copy.inventory[mushroom.name] ?? new Decimal(0);
    copy.inventory[mushroom.name] = inventoryMushrooms.add(mushroom.amount);

    return copy;
  });
}
