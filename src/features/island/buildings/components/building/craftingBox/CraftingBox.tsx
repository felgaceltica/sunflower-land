import React, { useContext, useState } from "react";
import { PIXEL_SCALE } from "features/game/lib/constants";
import { SUNNYSIDE } from "assets/sunnyside";
import { Modal } from "components/ui/Modal";
import { CloseButtonPanel } from "features/game/components/CloseablePanel";
import { Context } from "features/game/GameProvider";
import { ITEM_DETAILS } from "features/game/types/images";
import { useTranslation } from "react-i18next";
import { CraftTab } from "./components/CraftTab";
import { RecipesTab } from "./components/RecipesTab";
import { hasFeatureAccess } from "lib/flags";
import { Recipe, RecipeIngredient } from "features/game/lib/crafting";
import { useSound } from "lib/utils/hooks/useSound";
import { MachineState } from "features/game/lib/gameMachine";
import { useSelector } from "@xstate/react";

const _craftingItem = (state: MachineState) =>
  state.context.state.craftingBox.item;
const _craftingBoxRecipes = (state: MachineState) =>
  state.context.state.craftingBox.recipes;

export const CraftingBox: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [currentTab, setCurrentTab] = useState(0);

  const { t } = useTranslation();

  const { gameService } = useContext(Context);

  const craftingItem = useSelector(gameService, _craftingItem);
  const recipes = useSelector(gameService, _craftingBoxRecipes);

  // Determine the current recipe if any
  const itemName = craftingItem?.collectible ?? craftingItem?.wearable;
  const currentRecipe = itemName ? recipes[itemName] ?? null : null;
  const paddedIngredients = [
    ...(currentRecipe?.ingredients ?? []),
    ...Array(9).fill(null),
  ].slice(0, 9);

  const [selectedItems, setSelectedItems] =
    useState<(RecipeIngredient | null)[]>(paddedIngredients);

  const handleOpen = () => {
    gameService.send("SAVE");
    setShowModal(true);
  };
  const handleClose = () => setShowModal(false);

  const hasAccess = hasFeatureAccess(
    gameService.getSnapshot().context.state,
    "CRAFTING_BOX",
  );
  const button = useSound("button");

  const handleSetupRecipe = (recipe: Recipe) => {
    const paddedIngredients = [
      ...recipe.ingredients,
      ...Array(9).fill(null),
    ].slice(0, 9);
    selectItems(paddedIngredients);
    setCurrentTab(0); // Switch to the craft tab
  };

  const selectItems = (items: (RecipeIngredient | null)[]) => {
    button.play();
    setSelectedItems(items);
  };

  return (
    <>
      <div
        className="absolute bottom-0"
        style={{
          width: `${PIXEL_SCALE * 16 * 3}px`,
          bottom: `${PIXEL_SCALE * 0}px`,
        }}
      >
        <img
          src={ITEM_DETAILS["Crafting Box"].image}
          alt={t("crafting.craftingBox")}
          className={`cursor-pointer hover:img-highlight absolute`}
          style={{
            left: `${PIXEL_SCALE * -1}px`,
            width: `${PIXEL_SCALE * 46}px`,
            bottom: `${PIXEL_SCALE * 0}px`,
          }}
          onClick={handleOpen}
        />
      </div>

      <Modal show={showModal} onHide={handleClose}>
        <CloseButtonPanel
          onClose={handleClose}
          tabs={[
            { name: t("craft"), icon: SUNNYSIDE.icons.hammer },
            { name: t("recipes"), icon: SUNNYSIDE.icons.basket },
          ]}
          currentTab={currentTab}
          setCurrentTab={setCurrentTab}
        >
          {!hasAccess ? (
            <p className="text-sm">{t("coming.soon")}</p>
          ) : (
            <>
              {currentTab === 0 && (
                <CraftTab
                  gameService={gameService}
                  selectedItems={selectedItems}
                  setSelectedItems={selectItems}
                />
              )}
              {currentTab === 1 && (
                <RecipesTab
                  gameService={gameService}
                  handleSetupRecipe={handleSetupRecipe}
                />
              )}
            </>
          )}
        </CloseButtonPanel>
      </Modal>
    </>
  );
};
