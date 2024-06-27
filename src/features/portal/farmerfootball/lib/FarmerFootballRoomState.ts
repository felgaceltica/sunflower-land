import { PlazaRoomState } from "features/world/types/Room";
import { CollectionSchema } from "@colyseus/schema";

export interface FarmerFootballRoomState extends PlazaRoomState {
  scoreLeft: number;
  scoreRight: number;

  matchState: string;
  leftTeam: CollectionSchema<string>;
  rightTeam: CollectionSchema<string>;

  leftQueue: CollectionSchema<string>;
  rightQueue: CollectionSchema<string>;

  currentTime: number;
  ballChanged: number;
  ballX: number;
  ballY: number;
  ballVX: number;
  ballVY: number;
}
