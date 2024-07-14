import { MyContext, MyConversation } from "../context.js";
import { getIntroMessage } from "../templates/index.js";

export async function start(_conversation: MyConversation, ctx: MyContext) {
    //TODO: Referral, parse bot init
    /*
    const args = ctx.match as string;

    if (args) {
        let decodedArgs: Record<string, string>;
        try {
            const decodedArgsStr = Buffer.from(args, "base64");
            decodedArgs = JSON.parse(decodedArgsStr.toString());
        } catch (e) {
            await ctx.reply("😞 It seems like your link is invalid, redirecting your to the start.");
            await ctx.reply(getIntroMessage(), { parse_mode: "Markdown" });
            return;
        }

        console.debug(decodedArgs);
    }*/

    const locale = ctx.from?.language_code;
    console.debug({ locale });
    await ctx.reply(getIntroMessage(locale), { parse_mode: "Markdown" });
}
