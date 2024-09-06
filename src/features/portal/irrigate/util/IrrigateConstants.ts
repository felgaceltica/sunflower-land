export const MINIGAME_NAME = "irrigate";
export const ZOOM = window.innerWidth < 500 ? 2 : 4;
export const UNLIMITED_ATTEMPTS_SFL = 3;
export const RESTOCK_ATTEMPTS_SFL = 1;
export const DAILY_ATTEMPTS = 5;
export const RESTOCK_ATTEMPTS = 3;
export const BOARD_SIZE = Math.round(
  (window.innerWidth < window.innerHeight
    ? Math.round(window.innerWidth * 0.9)
    : Math.round(window.innerHeight * 0.9)) / ZOOM,
);
export const START_POSITION_X = 0;
export const START_POSITION_Y = 0;
