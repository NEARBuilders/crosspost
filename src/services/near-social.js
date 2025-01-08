import { Social, transformActions } from "@builddao/near-social-js";
import { NETWORK_ID } from "../config";

const SOCIAL_CONTRACT = {
  mainnet: "social.near",
  testnet: "v1.social08.testnet",
};

const NearSocialClient = new Social({
  contractId: SOCIAL_CONTRACT[NETWORK_ID],
  network: NETWORK_ID,
});

// This service is used in the client context,
// Uses wallet connection to sign public transactions

export class NearSocialService {
  constructor(wallet) {
    this.wallet = wallet;
  }

  async createPost(content) {
    const account = await this.wallet.getAccount();
    const { publicKey, accountId } = account;

    try {
      const transaction = await NearSocialClient.set({
        data: {
          [accountId]: {
            post: {
              main: JSON.stringify(content),
            },
            index: {
              post: JSON.stringify({
                key: "main",
                value: {
                  type: content.type,
                },
              }),
            },
          },
        },
        account: { // this is used to validate that the user has permission to post ( will otherwise be blocked by contract )
          publicKey: publicKey,
          accountID: accountId,
        },
      });

      const transformedActions = transformActions(transaction.actions);

      return { 
        contractId: SOCIAL_CONTRACT[NETWORK_ID],
        actions: transformedActions,
      };
    } catch (error) {
      console.error("Error creating post:", error);
      throw error;
    }
  }
}
