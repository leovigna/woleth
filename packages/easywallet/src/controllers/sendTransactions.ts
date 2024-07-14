import { Address, Hex, Chain } from "viem";
import { getERC4337Nonce } from "@owlprotocol/contracts-account-abstraction";
import { GetUserSmartAccountReturnValue } from "./getUserSmartAccount.js";
import { MyConversation, MyContext } from "../context.js";
/**
 * Send Transactions using smart account
 * @param conversation
 * @param ctx
 */
export async function sendTransactions(
    params: GetUserSmartAccountReturnValue & {
        chain: Chain;
        transactions: {
            to: Address;
            value: bigint;
            data: Hex;
        }[];
    },
    conversation: MyConversation,
    ctx: MyContext,
) {
    const { smartAccount, smartAccountClient, bundlerClient, chain, transactions } = params;
    // Encode Call Data for User Operation
    const callData = await smartAccount.encodeCallData(transactions);
    // Prepare User Operation (factoryData, nonce, gas, paymaster)
    const userOperation = await conversation.external(() =>
        smartAccountClient.prepareUserOperationRequest({
            userOperation: {
                callData,
                // Random nonce
                nonce: getERC4337Nonce(),
            },
        }),
    );
    // Sign User Operation
    userOperation.signature = await smartAccount.signUserOperation(userOperation);
    // Submit User Operation
    const userOpHash = await conversation.external(() => bundlerClient.sendUserOperation({ userOperation }));

    //TODO: Search for Blockscout specifically
    const explorerUrl = chain.blockExplorers?.default.url;
    if (explorerUrl) {
        const userOpUrl = `${explorerUrl}/op/${userOpHash}`;
        await ctx.reply(`User Operation sent and is pending!\n${userOpUrl}`);
    } else {
        await ctx.reply(`User Operation sent and is pending!\n${userOpHash}`);
    }

    // Receipt promise
    const userOpReceipt = await conversation.external(() =>
        bundlerClient.waitForUserOperationReceipt({
            hash: userOpHash,
        }),
    );

    const transactionHash = userOpReceipt.receipt.transactionHash;
    if (explorerUrl) {
        const transactionUrl = `${explorerUrl}/tx/${transactionHash}`;
        await ctx.reply(`User Operation confirmed in transaction!\n${transactionUrl}`);
    } else {
        await ctx.reply(`User Operation confirmed in transaction!\n${transactionHash}`);
    }
}
