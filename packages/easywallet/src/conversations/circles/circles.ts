import { Address, Chain, encodeFunctionData } from "viem";
import { MyContext, MyConversation } from "../../context.js";
import { getNetwork, getUser, getUserSmartAccount, sendTransactions } from "../../controllers/index.js";

//Network 10200
export const CIRCLES_V1 = "0xdbF22D4e8962Db3b2F1d9Ff55be728A887e47710" as Address;

/**
 * ENS Claim subdomain command
 * @param conversation
 * @param ctx
 */
export async function circlesSignup(conversation: MyConversation, ctx: MyContext) {
    const paramsUser = await getUser(conversation, ctx);
    const { network } = await getNetwork({ chainId: 10200 }, conversation, ctx);
    const chain = { ...network, id: network.chainId } as Chain;

    const paramsWallet = await getUserSmartAccount({ ...paramsUser, chain }, conversation);

    const signupAbi = {
        inputs: [],
        name: "signup",
        outputs: [],
        type: "function",
    };

    const signupData = encodeFunctionData({
        abi: [signupAbi],
        functionName: "signup",
        args: [],
    });

    const transactions = [
        {
            to: CIRCLES_V1,
            value: 0n,
            data: signupData,
        },
    ];

    await sendTransactions({ ...paramsWallet, chain, transactions }, conversation, ctx);

    ctx.reply("Congrats! Your signedup for Circles.");
}
