import React, { useContext, useEffect, useRef } from "react";
import { Game, AUTO } from "phaser";
import NinePatchPlugin from "phaser3-rex-plugins/plugins/ninepatch-plugin.js";
import GesturesPlugin from "phaser3-rex-plugins/plugins/gestures-plugin.js";

import { Preloader } from "features/world/scenes/Preloader";
import { PortalContext } from "./lib/PortalProvider";
import { useActor } from "@xstate/react";
import { WhackAMoleScene } from "./WhackAMoleScene";
import { MINIGAME_NAME } from "./util/WhackAMoleConstants";

export const WhackAMolePhaser: React.FC = () => {
  const { portalService } = useContext(PortalContext);
  const [portalState] = useActor(portalService);

  const game = useRef<Game>(undefined);

  // This must match the key of your scene [PortalExampleScene]
  const scene = MINIGAME_NAME;

  // Preloader is useful if you want to load the standard Sunflower Land assets + SFX
  const scenes = [Preloader, WhackAMoleScene];

  useEffect(() => {
    const config: Phaser.Types.Core.GameConfig = {
      type: AUTO,
      fps: {
        //min: 30,
        //limit: 60,
        target: 60,
        smoothStep: true,
      },
      backgroundColor: "#000000",
      parent: "phaser-example",
      input: {
        activePointers: 3,
      },
      autoRound: true,
      pixelArt: true,
      plugins: {
        scene: [
          {
            key: "rexGestures",
            plugin: GesturesPlugin,
            mapping: "rexGestures",
          },
        ],
        global: [
          {
            key: "rexNinePatchPlugin",
            plugin: NinePatchPlugin,
            start: true,
          },
        ],
      },
      width: window.innerWidth,
      height: window.innerHeight,

      physics: {
        default: "arcade",
        arcade: {
          debug: true,
          gravity: { x: 0, y: 0 },
        },
      },

      scene: scenes,
      loader: {
        crossOrigin: "anonymous",
      },
    };

    game.current = new Game({
      ...config,
      parent: "game-content",
    });

    game.current.registry.set("initialScene", scene);
    game.current.registry.set("gameState", portalState.context.state);
    game.current.registry.set("id", portalState.context.id);
    game.current.registry.set("portalService", portalService);

    return () => {
      game.current?.destroy(true);
    };
  }, []);

  const ref = useRef<HTMLDivElement>(null);

  return (
    <div>
      <div id="game-content" ref={ref} />
    </div>
  );
};
