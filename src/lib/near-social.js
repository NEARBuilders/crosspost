import { NETWORK_ID } from "@/config";
import { Social } from "@builddao/near-social-js";

export const SOCIAL_CONTRACT = {
  mainnet: "social.near",
  testnet: "v1.social08.testnet",
};

export const NearSocialClient = new Social({
  contractId: SOCIAL_CONTRACT[NETWORK_ID],
  network: NETWORK_ID,
});

export const getImageUrl = (image) => {
  if (!image) return "";
  if (image.url) return image.url;
  if (image.ipfs_cid) return `https://ipfs.near.social/ipfs/${image.ipfs_cid}`;
  return "";
};

export async function getProfile(accountId) {
  const response = await NearSocialClient.get({
    keys: [`${accountId}/profile/**`],
  });
  if (!response) {
    throw new Error("Failed to fetch profile");
  }
  const { profile } = response[accountId];

  return profile;
}
