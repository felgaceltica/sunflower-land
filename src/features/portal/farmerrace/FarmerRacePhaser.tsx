import React, { useContext, useEffect, useRef } from "react";
import { Game, AUTO } from "phaser";
import NinePatchPlugin from "phaser3-rex-plugins/plugins/ninepatch-plugin.js";

import { Preloader } from "features/world/scenes/Preloader";
import { PortalContext } from "./lib/PortalProvider";
import { useActor } from "@xstate/react";
import { FarmerRaceScene } from "./FarmerRaceScene";
import { InteractableModals } from "features/world/ui/InteractableModals";
import { NPCModals } from "features/world/ui/NPCModals";

export const FarmerRacePhaser: React.FC = () => {
  const { portalService } = useContext(PortalContext);
  const [portalState] = useActor(portalService);

  const game = useRef<Game>();

  // This must match the key of your scene [PortalExampleScene]
  const scene = "farmer_race";

  // Preloader is useful if you want to load the standard Sunflower Land assets + SFX
  const scenes = [Preloader, FarmerRaceScene];

  useEffect(() => {
    const config: Phaser.Types.Core.GameConfig = {
      type: AUTO,
      fps: {
        //min: 30,
        //limit: 30,
        target: 60,
        smoothStep: true,
      },
      backgroundColor: "#000000",
      parent: "phaser-example",

      autoRound: true,
      pixelArt: true,
      plugins: {
        global: [
          {
            key: "rexNinePatchPlugin",
            plugin: NinePatchPlugin,
            start: true,
          },
          // {
          //   key: "rexVirtualJoystick",
          //   plugin: VirtualJoystickPlugin,
          //   start: true,
          // },
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

      {/* Comment out if you don't want to use our standard Bumpkin NPCs + click interactions */}
      {
        <NPCModals
          id={portalState.context.id as number}
          scene={"portal_example"}
        />
      }

      {/* Comment out if you don't want to use pop up modals from in game interactables */}
      {
        <InteractableModals
          id={portalState.context.id as number}
          scene="portal_example"
        />
      }
    </div>
  );
};
