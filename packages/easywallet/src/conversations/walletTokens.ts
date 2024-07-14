import { InlineKeyboard } from "grammy";
import { MyContext, MyConversation } from "../context.js";
import { userTokens } from "../data.js";

// Function to display tokens
export async function walletTokens(conversation: MyConversation, ctx: MyContext) {
    const chainId = 1;
    //Get user balances
    if (userTokens.length === 0) {
        ctx.reply("You have no tokens", { reply_markup: { remove_keyboard: true } });
    } else {
        const tokenOptionMessages = await Promise.all(
            userTokens.map(async (token) => {
                //TODO: Pad this so balances always take same no of chars
                const balance = token.balance;
                //TODO: Pad this so symbol always takes same no of chars (max 7)
                //TODO: Merge with ERC20 collection
                const symbol = "<symbol>"; //token.symbol;
                const name = "<name>"; //token.name;
                const message = `${balance} (${symbol}) ${name}`;
                //TODO: command should be send_tokens:networkId:address
                const sendTokenKeyboard = new InlineKeyboard().text("Send", `${token.address}`);

                return ctx.reply(message, { reply_markup: sendTokenKeyboard });
            }),
        );

        //Get Token
        const tokenSelectedCtx = await conversation.wait();
        const tokenMessageId = tokenSelectedCtx.update.callback_query?.message?.message_id;
        //Delete other token messages
        await Promise.all(
            tokenOptionMessages.map((m) => {
                if (m.message_id != tokenMessageId) {
                    return tokenSelectedCtx.api.deleteMessage(m.chat.id, m.message_id);
                }
            }),
        );

        const tokenSelectedAddress = tokenSelectedCtx.update.callback_query?.data;
        const tokenSelected = userTokens.find((t) => t.address === tokenSelectedAddress)!;

        //Get Token Amount
        await ctx.reply(`How many do you want to send?`);
        //await ctx.reply(`How many ${tokenSelected.name} (${tokenSelected.symbol}) do you want to send?`);

        const tokenAmountCtx = await conversation.wait();
        const tokenAmountStr = tokenAmountCtx.message?.text;
        const amountRegex = /^[0-9]*[.,]?[0-9]+$/; // Regex to check if the message is a valid number
        if (!amountRegex.test(tokenAmountStr!)) {
            await ctx.reply(`The amount you entered is not valid. Please enter a valid number:`);
            //TODO: go back as loop
        }
        //TODO: Figure out wei conversion
        //const tokenAmount = parseInt(tokenAmountStr!);

        //Get Token To
        await ctx.reply(`You are trying to send ${tokenAmountStr}. Please enter the recipient's address:`);
        const tokenToCtx = await conversation.wait();
        const tokenTo = tokenToCtx.update.message?.text;
        const ethAddressRegex = /^0x[a-fA-F0-9]{40}$/;
        if (!ethAddressRegex.test(tokenTo!)) {
            await ctx.reply(
                `The address you entered is not formatted correctly.\n\n` +
                    `An Ethereum address should start with '0x' followed by 40 hexadecimal characters. ` +
                    `Please enter a valid Ethereum address:`,
            );
            //TODO: go back as loop
        }

        console.debug({
            chainId,
            token: tokenSelected.address,
            to: tokenTo,
            amount: tokenAmountStr,
        });

        const hash = "0x";

        ctx.reply(`Tokens sent ${hash}`);
    }
}
