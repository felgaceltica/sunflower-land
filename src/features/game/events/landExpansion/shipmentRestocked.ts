import Decimal from "decimal.js-light";
import { StockableName } from "features/game/lib/constants";
import { getKeys } from "features/game/types/decorations";
import { GameState } from "features/game/types/game";
import { produce } from "immer";

export type ShipmentRestockAction = {
  type: "shipment.restocked";
};

type Options = {
  state: Readonly<GameState>;
  action: ShipmentRestockAction;
  createdAt?: number;
};

export const SHIPMENT_STOCK: Partial<Record<StockableName, number>> = {
  "Sunflower Seed": 100,
  "Potato Seed": 50,
  "Pumpkin Seed": 30,
  "Carrot Seed": 20,
  "Cabbage Seed": 20,
  "Soybean Seed": 20,
  "Beetroot Seed": 20,
  "Cauliflower Seed": 20,
  "Parsnip Seed": 10,

  Axe: 50,
  Pickaxe: 15,
  "Stone Pickaxe": 5,
  "Iron Pickaxe": 2,
  "Gold Pickaxe": 2,
  Rod: 10,
  "Sand Shovel": 25,
};

export function canRestockShipment({
  game,
  now = Date.now(),
}: {
  game: GameState;
  now?: number;
}) {
  const restockedAt = new Date(game.shipments.restockedAt ?? 0)
    .toISOString()
    .slice(0, 10);
  const today = new Date(now).toISOString().slice(0, 10);

  return restockedAt !== today;
}

export function nextShipmentAt({ game }: { game: GameState }): number {
  // TODO - new players get as soon as out of stock (first time)

  const currentTime = Date.now();

  // Calculate the time until the next day in milliseconds
  const nextDay = new Date(currentTime);
  nextDay.setUTCHours(24, 0, 0, 0);

  return nextDay.getTime();
}

export function shipmentRestock({
  state,
  createdAt = Date.now(),
}: Options): GameState {
  return produce(state, (game) => {
    if (!canRestockShipment({ game, now: createdAt })) {
      throw new Error("Already restocked today");
    }

    game.stock = getKeys(SHIPMENT_STOCK).reduce((acc, name) => {
      const previous = game.stock[name] ?? new Decimal(0);
      const newAmount = new Decimal(SHIPMENT_STOCK[name] ?? 0);

      return {
        ...acc,
        [name]: previous.gt(newAmount) ? previous : newAmount,
      };
    }, {});

    game.shipments.restockedAt = createdAt;

    return game;
  });
}
