import { MyContext, MyConversation } from "../context.js";
import { getIntroMessage } from "../templates/getIntroMessage.js";

/**
 * Main intro
 * @param conversation
 * @param ctx
 */
export async function intro(_conversation: MyConversation, ctx: MyContext) {
    await ctx.reply(getIntroMessage(), { parse_mode: "Markdown" });
}
