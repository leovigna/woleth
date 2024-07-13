// import { conversations } from "@grammyjs/conversations";
import { MyContext, MyConversation } from "../context.js";
import { waitForAddress } from "../utils/waitForAddress.js";
// import { getIntroMessage } from "../templates/index.js";

export async function start(_conversation: MyConversation, ctx: MyContext) {
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
    }

    await ctx.reply(getIntroMessage(), { parse_mode: "Markdown" });
    */
    await ctx.reply("Please send address");
    const result = await waitForAddress(_conversation, ctx);
    await ctx.reply("Thanks!");
    console.debug(result);
}
