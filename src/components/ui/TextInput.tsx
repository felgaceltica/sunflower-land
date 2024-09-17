import React, { ChangeEvent, useState } from "react";
import classNames from "classnames";

import bg from "assets/ui/input_box_border_white.png";
import activeBg from "assets/ui/active_input_box_border_white.png";
import { SquareIcon } from "./SquareIcon";

type Props = {
  value: string;
  className?: string;
  onValueChange: (value: string) => void;
  icon?: string;
};

export const TextInput: React.FC<Props> = ({
  value,
  onValueChange,
  icon,
  className,
}) => {
  const [isFocused, setIsFocused] = useState(false); // State for focus

  let padding = 0;

  if (isFocused) {
    padding += 2;
  }

  if (icon) {
    padding += 32;
  }
  return (
    <div className={classNames("relative w-full")}>
      <input
        style={{
          borderStyle: "solid",
          background: "white",
          borderImage: `url(${isFocused ? activeBg : bg})`,
          borderWidth: `10px 10px 10px 10px`,
          borderImageSlice: isFocused ? "4 fill" : "4 4 4 4 fill",
          padding: `0 ${padding}px`,
          imageRendering: "pixelated",
          borderImageRepeat: "stretch",
          outline: "none",
        }}
        type="text"
        placeholder="Search here..."
        value={value}
        onChange={(e: ChangeEvent<HTMLInputElement>) => {
          onValueChange(e.target.value);
        }}
        onFocus={() => setIsFocused(true)} // Set focus state to true
        onBlur={() => setIsFocused(false)} // Set focus state to false
        className={classNames(
          "!bg-transparent cursor-pointer  w-full p-2 h-12 font-secondary",
          className,
        )}
      />
      {icon && (
        <div className="absolute flex flex-row items-center mx-2 pointer-events-none h-full top-0 left-0">
          <SquareIcon icon={icon} width={10} />
        </div>
      )}
    </div>
  );
};
