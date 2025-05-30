import React, { useState } from "react";

import { CONFIG } from "lib/config";
import { Button } from "components/ui/Button";
import { Label } from "components/ui/Label";
import { useAppTranslation } from "lib/i18n/useAppTranslations";
import { NumberInput } from "components/ui/NumberInput";
import Decimal from "decimal.js-light";
import { donate } from "features/portal/lib/portalUtil";
import { NPCParts } from "features/island/bumpkin/components/NPC";

let FelgaParts: Partial<NPCParts>;
let AsterionParts: Partial<NPCParts>;

// window
//   .fetch("https://api.sunflower-land.com/community/farms/155026", {
//     method: "GET",
//   })
//   .then((response) => {
//     response.json().then((json) => {
//       FelgaParts = json.farm.bumpkin.equipped;
//     });
//   });

// window
//   .fetch("https://api.sunflower-land.com/community/farms/55626", {
//     method: "GET",
//   })
//   .then((response) => {
//     response.json().then((json) => {
//       AsterionParts = json.farm.bumpkin.equipped;
//     });
//   });

export const WhackAMoleDonations: React.FC = () => {
  const { t } = useAppTranslation();

  const [donation, setDonation] = useState(new Decimal(1));
  const onDonationChange = (value: Decimal) => {
    setDonation(value);
  };
  const incrementDonation = () => {
    setDonation((value) => value.add(0.1));
  };

  const decrementDonation = () => {
    setDonation((value) => {
      if (value.lessThanOrEqualTo(0.1)) return new Decimal(0.1);
      return value.minus(0.1);
    });
  };

  const handleDonate = () => {
    donate({
      matic: donation.toNumber(),
      address: CONFIG.PORTAL_DONATION_ADDRESS,
    });
  };

  // waiting confirmation for address
  const isComingSoon = false;

  const nameFelga = "Felga";
  const nameAsterion = "Asterion";
  return (
    <div className="flex flex-col mb-1 p-2 text-sm">
      <p className="mb-2 text-center">{t("whackamole.donationDescription")}</p>

      <div className="flex flex-wrap mt-1 mb-4 gap-x-3 gap-y-1 justify-center">
        <>
          {/* <NPCIcon width={24} parts={FelgaParts} /> */}
          <Label key={nameFelga} type="chill">
            <span className="pl-1">{nameFelga}</span>
          </Label>
          {/* <NPCIcon width={24} parts={AsterionParts} /> */}
          <Label key={nameAsterion} type="chill">
            <span className="pl-1">{nameAsterion}</span>
          </Label>
        </>
      </div>
      <div className="flex flex-col items-center">
        <div className="flex">
          <Button className="w-12" onClick={decrementDonation}>
            {"-"}
          </Button>
          <div className="flex items-center w-24 mx-2 mt-1">
            <NumberInput
              value={donation}
              maxDecimalPlaces={1}
              isOutOfRange={donation.lessThan(0.1)}
              onValueChange={onDonationChange}
            />
          </div>
          <Button className="w-12" onClick={incrementDonation}>
            {"+"}
          </Button>
        </div>
        <span className="text-xs font-secondary my-2">{t("amount.pol")}</span>
      </div>

      {isComingSoon && (
        <Label type="default" className="mb-2">
          {t("coming.soon")}
        </Label>
      )}

      <Button
        className="w-full ml-1"
        onClick={handleDonate}
        disabled={isComingSoon || donation.lessThan(0.1)}
      >
        <span className="whitespace-nowrap">{t("donate")}</span>
      </Button>
    </div>
  );
};
