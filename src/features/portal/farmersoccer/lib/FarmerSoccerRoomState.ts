import { PlazaRoomState } from "features/world/types/Room";

export interface FarmerSoccerRoomState extends PlazaRoomState {
  scoreLeft: number;
  scoreRight: number;
  ballPositionX: number;
  ballPositionY: number;
  ballVelocityX: number;
  ballVelocityY: number;
}
