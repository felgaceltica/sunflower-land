import {
  GameState,
  AnimalFoodName,
  AnimalMedicineName,
} from "features/game/types/game";
import Decimal from "decimal.js-light";
import { trackActivity } from "features/game/types/bumpkinActivity";
import { getKeys } from "features/game/types/decorations";
import { ANIMAL_FOODS } from "features/game/types/animals";
import { produce } from "immer";

export type FeedMixedAction = {
  type: "feed.mixed";
  item: AnimalFoodName | AnimalMedicineName;
  amount?: number;
};

type Options = {
  state: Readonly<GameState>;
  action: FeedMixedAction;
};

export function feedMixed({ state, action }: Options) {
  return produce(state, (copy) => {
    const { bumpkin } = copy;

    if (!bumpkin) {
      throw new Error("Bumpkin not found");
    }

    const { item: feed, amount = 1 } = action;

    const selectedItem = ANIMAL_FOODS[feed];

    if (!selectedItem) {
      throw new Error("Item is not a feed!");
    }

    const price = selectedItem.coins ?? 0;

    if (price && copy.coins < price) {
      throw new Error("Insufficient Coins");
    }

    const subtractedInventory = getKeys(selectedItem.ingredients)?.reduce(
      (inventory, ingredient) => {
        const count = inventory[ingredient] ?? new Decimal(0);
        const requiredIngredients = new Decimal(
          selectedItem.ingredients[ingredient] ?? 0,
        ).mul(amount);

        if (count.lessThan(requiredIngredients)) {
          throw new Error(`Insufficient Ingredient: ${ingredient}`);
        }
        return {
          ...inventory,
          [ingredient]: count.sub(requiredIngredients),
        };
      },
      copy.inventory,
    );

    const oldAmount = copy.inventory[feed] ?? new Decimal(0);

    bumpkin.activity = trackActivity(
      "Coins Spent",
      bumpkin?.activity,
      new Decimal(price),
    );
    bumpkin.activity = trackActivity(
      `${feed} Mixed`,
      bumpkin?.activity,
      new Decimal(amount ?? 0),
    );
    copy.coins -= price;
    copy.inventory = {
      ...subtractedInventory,
      [feed]: oldAmount.add(amount ?? 0),
    };

    return copy;
  });
}
