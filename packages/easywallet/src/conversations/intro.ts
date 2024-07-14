import { MyContext, MyConversation } from "../context.js";
import { getIntroMessage } from "../templates/getIntroMessage.js";

/**
 * Main intro
 * @param conversation
 * @param ctx
 */
export async function intro(_conversation: MyConversation, ctx: MyContext) {
    const locale = ctx.from?.language_code;
    await ctx.reply(getIntroMessage(locale), { parse_mode: "Markdown" });
}
