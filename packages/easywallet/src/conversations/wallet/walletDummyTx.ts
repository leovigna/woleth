import { Chain, Address, Hex } from "viem";
import { MyContext, MyConversation } from "../../context.js";
import {
    getNetwork,
    getUser,
    GetUserSmartAccountReturnValue,
    getUserSmartAccount,
    sendTransactions,
} from "../../controllers/index.js";

/**
 * Dummy AA transaction command
 * @param conversation
 * @param ctx
 */
export async function walletDummyCommand(conversation: MyConversation, ctx: MyContext) {
    const paramsUser = await getUser(conversation, ctx);
    const { network } = await getNetwork({ chainId: 10200 }, conversation, ctx);
    const chain = { ...network, id: network.chainId } as Chain;

    const paramsWallet = await getUserSmartAccount({ ...paramsUser, chain }, conversation);
    await walletDummy({ ...paramsWallet, chain }, conversation, ctx);
}

/**
 * Dummy AA transaction
 * @param conversation
 * @param ctx
 */
export async function walletDummy(
    params: GetUserSmartAccountReturnValue & { chain: Chain },
    conversation: MyConversation,
    ctx: MyContext,
) {
    const transactions = [
        {
            to: "0xd8da6bf26964af9d7eed9e03e53415d37aa96045" as Address, //vitalik.eth
            value: 0n,
            data: "0x1234" as Hex,
        },
    ];

    await sendTransactions({ ...params, transactions }, conversation, ctx);
}
