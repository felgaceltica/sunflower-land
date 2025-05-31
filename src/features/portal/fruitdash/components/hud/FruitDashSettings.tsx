import React, { useContext, useEffect, useRef, useState } from "react";

import settings from "assets/icons/settings.png";

import { PIXEL_SCALE } from "features/game/lib/constants";

import { SUNNYSIDE } from "assets/sunnyside";
import { useSound } from "lib/utils/hooks/useSound";
// import { useIsDarkMode } from "lib/utils/hooks/useIsDarkMode";
import darkModeIcon from "assets/icons/dark_mode.png";
import lightModeIcon from "assets/icons/light_mode.png";

import { PortalContext } from "../../lib/PortalProvider";
import { PortalMachineState } from "../../lib/FruitDashMachine";
import { useSelector } from "@xstate/react";
import classNames from "classnames";
import { isTouchDevice } from "features/world/lib/device";
import sound_on from "assets/icons/sound_on.png";
import sound_off from "assets/icons/sound_off.png";
import music_on from "../../assets/music_on.png";
import music_off from "../../assets/music_off.png";
import { useIsAudioMuted } from "lib/utils/hooks/useIsAudioMuted";
import { useIsHalloweenMode } from "../../util/useIsHalloweenMode";
import { useIsMusicMuted } from "../../util/useIsMusicMuted";

const buttonWidth = PIXEL_SCALE * 22;
const buttonHeight = PIXEL_SCALE * 23;

const _isJoystickActive = (state: PortalMachineState) =>
  state.context.isJoystickActive;
const _state = (state: PortalMachineState) => state.context.state;

export const FruitDashSettings: React.FC = () => {
  const { portalService } = useContext(PortalContext);
  const state = useSelector(portalService, _state);
  const { isHalloweenMode, toggleHalloweenMode } = useIsHalloweenMode();
  const { isMusicMuted, toggleMusicMuted } = useIsMusicMuted();
  const { isAudioMuted, toggleAudioMuted } = useIsAudioMuted();

  useEffect(() => {
    Howler.mute(isAudioMuted);
  }, [isAudioMuted]);

  const [showMoreButtons, setShowMoreButtons] = useState(false);

  const isJoystickActive = useSelector(portalService, _isJoystickActive);

  const button = useSound("button");

  const cogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: any) => {
      if (cogRef.current && !cogRef.current.contains(event.target)) {
        setShowMoreButtons(false);
      }
    };

    document.addEventListener("click", handleClickOutside, true);
    return () => {
      document.removeEventListener("click", handleClickOutside, true);
    };
  }, []);

  useEffect(() => {
    if (isJoystickActive) {
      setShowMoreButtons(false);
      cogRef.current?.blur();
    }
  }, [isJoystickActive]);

  const settingButton = (
    index: number,
    onClick: () => void,
    children: JSX.Element,
  ) => {
    const rightMargin = 8;

    return (
      <div
        key={`button-${index}`}
        onClick={onClick}
        className={classNames("absolute z-50 mb-2 cursor-pointer", {
          "hover:img-highlight": !isJoystickActive && !isTouchDevice(),
        })}
        style={{
          width: `${buttonWidth}px`,
          height: `${buttonHeight}px`,
          transition: "transform 250ms ease",
          transform: "translateX(0)",
          ...(showMoreButtons && {
            transform: `translateX(-${(buttonWidth + rightMargin) * index}px)`,
          }),
        }}
      >
        <img
          src={SUNNYSIDE.ui.round_button}
          className="absolute"
          style={{
            width: `${buttonWidth}px`,
          }}
        />
        {children}
      </div>
    );
  };

  const audioButton = (index: number) =>
    settingButton(
      index,
      () => {
        button.play();
        toggleAudioMuted();
      },
      <img
        src={isAudioMuted ? sound_off : sound_on}
        className="absolute"
        style={{
          top: `${PIXEL_SCALE * 4}px`,
          left: `${PIXEL_SCALE * 5}px`,
          width: `${PIXEL_SCALE * 13}px`,
        }}
      />,
    );
  const musicButton = (index: number) =>
    settingButton(
      index,
      () => {
        button.play();
        toggleMusicMuted();
      },
      <img
        src={isMusicMuted ? music_off : music_on}
        className="absolute"
        style={{
          top: `${PIXEL_SCALE * 4}px`,
          left: `${PIXEL_SCALE * 5}px`,
          width: `${PIXEL_SCALE * 13}px`,
        }}
      />,
    );
  const halloweenModeButton = (index: number) =>
    settingButton(
      index,
      () => {
        button.play();
        toggleHalloweenMode();
        PubSub.publish("restartScene");
      },
      <img
        src={isHalloweenMode ? lightModeIcon : darkModeIcon}
        className="absolute"
        style={{
          top: `${PIXEL_SCALE * 6}px`,
          left: `${PIXEL_SCALE * 6}px`,
          width: `${PIXEL_SCALE * 10}px`,
        }}
      />,
    );

  const gearButton = (index: number) =>
    settingButton(
      index,
      () => {
        button.play();
        setShowMoreButtons(!showMoreButtons);
      },
      <img
        src={settings}
        className="absolute"
        style={{
          top: `${PIXEL_SCALE * 4}px`,
          left: `${PIXEL_SCALE * 4}px`,
          width: `${PIXEL_SCALE * 14}px`,
        }}
      />,
    );

  // list of buttons to show in the HUD from right to left in order
  const buttons = [gearButton, musicButton, audioButton, halloweenModeButton];
  return (
    <div
      className="fixed z-50 flex flex-col justify-between"
      style={{
        right: `${PIXEL_SCALE * 3}px`,
        bottom: `${PIXEL_SCALE * 3}px`,
      }}
    >
      <div
        className="relative"
        style={{ height: `${buttonHeight}px`, width: `${buttonWidth}px` }}
        ref={cogRef}
      >
        {buttons.map((item, index) => item(index)).reverse()}
      </div>
    </div>
  );
};
