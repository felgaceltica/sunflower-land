import React from "react";
import { SUNNYSIDE } from "assets/sunnyside";
import { PIXEL_SCALE } from "features/game/lib/constants";
import {
  AnimalFoodName,
  AnimalMedicineName,
  LoveAnimalItem,
} from "features/game/types/game";

import { ITEM_DETAILS } from "features/game/types/images";
// TODO: Add love items

type RequestItem = AnimalFoodName | AnimalMedicineName | LoveAnimalItem;

type RequestBubbleProps = {
  top: number;
  left: number;
  request: RequestItem;
  quantity?: number;
};

const ANIMAL_REQUEST_IMAGES: Record<
  RequestItem,
  { src: string; width: number; height: number }
> = {
  "Kernel Blend": {
    src: ITEM_DETAILS["Kernel Blend"].image,
    width: 16,
    height: 16,
  },
  Hay: {
    src: ITEM_DETAILS.Hay.image,
    width: 16,
    height: 16,
  },
  "Barn Delight": {
    src: ITEM_DETAILS["Barn Delight"].image,
    width: 12,
    height: 16,
  },
  NutriBarley: {
    src: ITEM_DETAILS.NutriBarley.image,
    width: 15,
    height: 16,
  },
  "Mixed Grain": {
    src: ITEM_DETAILS["Mixed Grain"].image,
    width: 16,
    height: 15,
  },
  "Petting Hand": {
    src: ITEM_DETAILS["Petting Hand"].image,
    width: 14,
    height: 14,
  },
  Brush: {
    src: ITEM_DETAILS.Brush.image,
    width: 15,
    height: 16,
  },
  "Music Box": {
    src: ITEM_DETAILS["Music Box"].image,
    width: 16,
    height: 17,
  },
};

export const RequestBubble: React.FC<RequestBubbleProps> = ({
  request,
  top,
  left,
  quantity,
}) => {
  const image = ANIMAL_REQUEST_IMAGES[request];
  // 15px is the width of the quantity text
  const leftBorderWidth = PIXEL_SCALE * 5;
  const parentWidth = image.width + (quantity ? 15 : 0) + leftBorderWidth;
  return (
    <div
      className="absolute inline-flex justify-center items-center z-40"
      style={{
        top: `${top}px`,
        left: `${left}px`,

        borderImage: `url(${SUNNYSIDE.ui.speechBorder})`,
        borderStyle: "solid",
        borderTopWidth: `${PIXEL_SCALE * 2}px`,
        borderRightWidth: `${PIXEL_SCALE * 2}px`,
        borderBottomWidth: `${PIXEL_SCALE * 4}px`,
        borderLeftWidth: `${PIXEL_SCALE * 5}px`,

        borderImageSlice: "2 2 4 5 fill",
        imageRendering: "pixelated",
        borderImageRepeat: "stretch",
        width: `${Math.max(parentWidth, 30)}px`,
      }}
    >
      <div
        className="flex justify-center items-center"
        style={{
          marginLeft: `-${(PIXEL_SCALE * 5) / 2}px`,
        }}
      >
        <img src={image.src} style={{ width: `${image.width}px` }} />
        {quantity && <p className="text-xxs">{`x${quantity}`}</p>}
      </div>
    </div>
  );
};