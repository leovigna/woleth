import { MyContext, MyConversation } from "../../context.js";
import { waitForSelect } from "../../utils/index.js";

/**
 * ENS Menu
 * @param conversation
 * @param ctx
 */
export async function ens(conversation: MyConversation, ctx: MyContext) {
    await ctx.reply("ens", { parse_mode: "Markdown" });

    const result = await waitForSelect(conversation, ctx, [
        { name: "Claim Subdomain", data: "ens_claim" },
        { name: "Manage Subdomain", data: "ens_manage" },
    ]);

    console.debug(result.selected);
}
