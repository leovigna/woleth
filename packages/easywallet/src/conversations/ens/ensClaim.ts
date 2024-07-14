import { MyContext, MyConversation } from "../../context.js";

/**
 * ENS Claim subdomain
 * @param conversation
 * @param ctx
 */
export async function ensClaim(_conversation: MyConversation, ctx: MyContext) {
    await ctx.reply("ens claim", { parse_mode: "Markdown" });
}
