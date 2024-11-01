import React from "react";

import { CONFIG } from "lib/config";
import { Donations } from "./Donations";

const CONTRIBUTORS = [
  "Poro",
  "Telk",
  "Grith",
  "Maxam",
  "iSPANKzombiez",
  "Vergelsxtn",
  "shinon",
  "kohirabbit",
  "deefault",
  "Jc",
  "Andando",
  "frogchard",
  "whaitte",
  "LittleEins",
  "Neonlight",
  "Netherzapdos",
  "PurpleDrvnk",
];
const CHRISTMAS_EVENT_DONATION_ADDRESS = CONFIG.CHRISTMAS_EVENT_DONATION;

interface Props {
  onClose: () => void;
}

export const ExampleDonations: React.FC<Props> = ({ onClose }) => {
  return (
    <Donations
      contributors={CONTRIBUTORS}
      donationAddress={CHRISTMAS_EVENT_DONATION_ADDRESS}
      onClose={onClose}
    />
  );
};
