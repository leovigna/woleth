import { TelegramUser } from "@easywallet/firebase/admin";
import { createOwlClients } from "@owlprotocol/clients";
import { createSmartAccountClient, SmartAccountClient } from "permissionless";
import { signerToSimpleSmartAccount, SimpleSmartAccount } from "permissionless/accounts";
import { ENTRYPOINT_ADDRESS_V07 } from "permissionless/utils";
import { Address, Chain, http, LocalAccount, PublicClient } from "viem";
import {
    createPimlicoBundlerClient,
    createPimlicoPaymasterClient,
    PimlicoBundlerClient,
    PimlicoPaymasterClient,
} from "permissionless/clients/pimlico";
import { PIMLICO_API_KEY } from "@easywallet/envvars";
import { MyConversation } from "../context.js";

const baseUrl = "http://localhost:3000/api";

export interface GetUserSmartAccountParams {
    chain: Chain;
    user: TelegramUser;
    account: LocalAccount;
    smartAccountAddress: Address;
}

export interface GetUserSmartAccountReturnValue {
    publicClient: PublicClient;
    bundlerClient: PimlicoBundlerClient<ENTRYPOINT_ADDRESS_V07>;
    paymasterClient: PimlicoPaymasterClient<ENTRYPOINT_ADDRESS_V07>;
    smartAccount: SimpleSmartAccount<ENTRYPOINT_ADDRESS_V07>;
    smartAccountClient: SmartAccountClient;
}

/**
 * Get permissionless smart account client
 * @param params
 * @param conversation
 * @param ctx
 */
export async function getUserSmartAccount(
    params: GetUserSmartAccountParams,
    conversation: MyConversation,
    // ctx: MyContext,
): Promise<GetUserSmartAccountReturnValue> {
    const { account, chain, smartAccountAddress } = params;

    const chainId = chain.id;
    const { publicClient /*bundlerClient, paymasterClient*/ } = createOwlClients({ chainId, baseUrl });

    if (!PIMLICO_API_KEY) throw new Error("PIMLICO_API_KEY undefined");
    const pimlicoApiKey = PIMLICO_API_KEY;

    //getBundlerUrl({ chainId, baseUrl }
    const bundlerUrl = `https://api.pimlico.io/v2/10200/rpc?apikey=${pimlicoApiKey}`;
    const bundlerClient = createPimlicoBundlerClient({
        transport: http(bundlerUrl, { retryCount: 10, timeout: 20_000 }),
        entryPoint: ENTRYPOINT_ADDRESS_V07,
    });

    const paymasterUrl = `https://api.pimlico.io/v2/10200/rpc?apikey=${pimlicoApiKey}`;
    const paymasterClient = createPimlicoPaymasterClient({
        transport: http(paymasterUrl, { retryCount: 10, timeout: 20_000 }),
        entryPoint: ENTRYPOINT_ADDRESS_V07,
    });

    const smartAccount = await conversation.external(() =>
        signerToSimpleSmartAccount(publicClient, {
            signer: account,
            address: smartAccountAddress,
            factoryAddress: "0xe7a78ba9be87103c317a66ef78e6085bd74dd538", //Simple Smart Account factory
            entryPoint: ENTRYPOINT_ADDRESS_V07,
        }),
    );

    const smartAccountClient = createSmartAccountClient({
        account: smartAccount,
        entryPoint: ENTRYPOINT_ADDRESS_V07,
        chain,
        bundlerTransport: http(bundlerUrl, { retryCount: 10, timeout: 20_000 }),
        middleware: {
            gasPrice: async () => {
                return (await conversation.external(() => bundlerClient.getUserOperationGasPrice())).fast;
            },
            sponsorUserOperation: paymasterClient.sponsorUserOperation,
        },
    });

    return { publicClient: publicClient as any, bundlerClient, paymasterClient, smartAccount, smartAccountClient };
}
