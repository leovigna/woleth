import { TelegramUser } from "@easywallet/firebase/admin";
import { createOwlClients, getBundlerUrl } from "@owlprotocol/clients";
import { createSmartAccountClient } from "permissionless";
import { signerToSimpleSmartAccount } from "permissionless/accounts";
import { ENTRYPOINT_ADDRESS_V07 } from "permissionless/utils";
import { Address, Chain, http, LocalAccount } from "viem";
import { MyConversation } from "../context.js";

const baseUrl = "http://localhost:3000/api";

/**
 * Get permissionless smart account client
 * @param params
 * @param conversation
 * @param ctx
 */
export async function getUserSmartAccount(
    params: { chain: Chain; user: TelegramUser; account: LocalAccount; smartAccountAddress: Address },
    conversation: MyConversation,
    // ctx: MyContext,
) {
    const { account, chain } = params;

    const chainId = chain.id;
    const { publicClient, bundlerClient, paymasterClient } = createOwlClients({ chainId, baseUrl });

    const smartAccount = await conversation.external(() =>
        signerToSimpleSmartAccount(publicClient, {
            signer: account,
            factoryAddress: "0xe7a78ba9be87103c317a66ef78e6085bd74dd538", //Simple Smart Account factory
            entryPoint: ENTRYPOINT_ADDRESS_V07,
        }),
    );

    const smartAccountClient = createSmartAccountClient({
        account: smartAccount,
        entryPoint: ENTRYPOINT_ADDRESS_V07,
        chain,
        bundlerTransport: http(getBundlerUrl({ chainId, baseUrl })),
        middleware: {
            gasPrice: async () => {
                return (await conversation.external(() => bundlerClient.getUserOperationGasPrice())).fast;
            },
            sponsorUserOperation: paymasterClient.sponsorUserOperation,
        },
    });

    return { publicClient, bundlerClient, paymasterClient, smartAccount, smartAccountClient };
}
