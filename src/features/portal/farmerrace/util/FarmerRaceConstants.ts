export const ZOOM = window.innerWidth < 500 ? 3 : 4;
export const SQUARE_WIDTH_TEXTURE = 18;
export const STREET_COLUMNS = 6;
export const INITIAL_SPEED = 0.5;
export const TOTAL_LINES =
  Math.ceil(window.innerHeight / SQUARE_WIDTH_TEXTURE / ZOOM) + 2;
export const START_HEIGHT =
  window.innerHeight / 2 - (TOTAL_LINES / 2) * SQUARE_WIDTH_TEXTURE;
export const FINAL_HEIGHT =
  window.innerHeight / 2 + (TOTAL_LINES / 2) * SQUARE_WIDTH_TEXTURE;
export const PLAYER_MIN_X =
  window.innerWidth / 2 -
  SQUARE_WIDTH_TEXTURE * (STREET_COLUMNS / 2) +
  SQUARE_WIDTH_TEXTURE / 2;
export const PLAYER_MAX_X =
  window.innerWidth / 2 +
  SQUARE_WIDTH_TEXTURE * (STREET_COLUMNS / 2) -
  SQUARE_WIDTH_TEXTURE / 2;
export const PLAYER_Y =
  window.innerHeight / 2 + SQUARE_WIDTH_TEXTURE * (TOTAL_LINES / 2 - 3);
export const TOTAL_COLUMNS = Math.ceil(
  window.innerWidth / SQUARE_WIDTH_TEXTURE / ZOOM
);
export const GRASS_COLUMNS =
  Math.ceil((TOTAL_COLUMNS - STREET_COLUMNS) / 2) + 1;
export const GRASS_LEFT_MIN =
  window.innerWidth / 2 -
  SQUARE_WIDTH_TEXTURE * (STREET_COLUMNS / 2) -
  SQUARE_WIDTH_TEXTURE * GRASS_COLUMNS;
export const GRASS_LEFT_MAX =
  GRASS_LEFT_MIN + SQUARE_WIDTH_TEXTURE * GRASS_COLUMNS;
export const GRASS_RIGHT_MIN =
  window.innerWidth / 2 + SQUARE_WIDTH_TEXTURE * (STREET_COLUMNS / 2);
export const GRASS_RIGHT_MAX =
  GRASS_RIGHT_MIN + SQUARE_WIDTH_TEXTURE * GRASS_COLUMNS;
export const GROUND_DEPTH = 50;
export const OBSTACLES_DEPTH = 100;
export const PLAYER_DEPTH = 200;
export const DECORATION_DEPTH = 200;
export const UNLIMITED_ATTEMPTS_SFL = 3;
export const RESTOCK_ATTEMPTS_SFL = 1;
export const DAILY_ATTEMPTS = 5;
