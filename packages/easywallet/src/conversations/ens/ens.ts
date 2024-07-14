import { MyContext, MyConversation } from "../../context.js";

/**
 * ENS Menu
 * @param conversation
 * @param ctx
 */
export async function ens(_conversation: MyConversation, ctx: MyContext) {
    await ctx.reply("ens", { parse_mode: "Markdown" });
}
