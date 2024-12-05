import { MarketplaceTrends } from "features/game/types/marketplace";
import { CONFIG } from "lib/config";
import { ERRORS } from "lib/errors";

const API_URL = CONFIG.API_URL;

export async function loadTrends({
  token,
}: {
  token: string;
}): Promise<MarketplaceTrends> {
  const url = new URL(`${API_URL}/marketplace/trends`);

  const response = await window.fetch(url.toString(), {
    method: "GET",
    headers: {
      "content-type": "application/json;charset=UTF-8",
      Authorization: `Bearer ${token}`,
    },
  });

  if (response.status === 429) {
    throw new Error(ERRORS.TOO_MANY_REQUESTS);
  }

  if (response.status >= 400) {
    throw new Error(ERRORS.FAILED_REQUEST);
  }

  return await response.json();
}
