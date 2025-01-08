import { Social, transformActions } from "@builddao/near-social-js";
import { NETWORK_ID } from "../config";

const SOCIAL_CONTRACT = {
  mainnet: "social.near",
  testnet: "v1.social08.testnet"
};

const NearSocialClient = new Social({
  contractId: SOCIAL_CONTRACT[NETWORK_ID],
  network: NETWORK_ID
});

export class NearSocialService {
  constructor(wallet) {
    this.wallet = wallet;
  }
  
  async createPost(content) {
    const account = await this.wallet.getAccount();
    const { publicKey, accountId } = account;

    console.log("account", account);

    try {
      const transaction = await NearSocialClient.set({
        data: {
          [accountId]: {
            post: {
              main: JSON.stringify(content)
            },
            index: {
              post: JSON.stringify({
                key: "main",
                value: {
                  type: content.type
                }
              })
            }
          }
        },
        account: {
          publicKey: publicKey,
          accountID: accountId
        }
      });
  
      const transformedActions = transformActions(transaction.actions);
  
      return {
        contractId: SOCIAL_CONTRACT[NETWORK_ID],
        actions: transformedActions
      };
    } catch (error) {
      console.error("Error creating post:", error);
      throw error;
    }
  }
}
