import { Keyboard } from "grammy";
import { walletTokens } from "./walletTokens.js";
import { walletCollectibles } from "./walletCollectibles.js";
import { MyContext, MyConversation } from "../context.js";

/**
 * Start conversation, wait for user input and enter new conversation
 * @param conversation
 * @param ctx
 */
export async function wallet(conversation: MyConversation, ctx: MyContext) {
    const account = "0x";
    /**
     * Tokens => Go through wallet_tokens conversation
     * Settings => Got through wallet_collectibles conversation
     * Back to Main Menu => Go through start conversation
     */
    const startKeyboard = new Keyboard()
        .text("Tokens")
        .row()
        .text("Collectibles")
        .row()
        //WARNING: Do NOT create a loop by creating a conversation back to start, simply return
        .text("Back to Main Menu")
        .resized()
        .persistent();
    ctx.reply(`Wallet ${account}`, { reply_markup: startKeyboard });

    const reply = await conversation.wait();
    const msg = reply.message!.text!;
    //while (msg != "Back to Main Menu") {
    if (msg === "Tokens") {
        await walletTokens(conversation, ctx);
    } else if (msg === "Collectibles") {
        await walletCollectibles(conversation, ctx);
    } else {
        ctx.reply("Back to Main Menu", { reply_markup: { remove_keyboard: true } });
    }
}
