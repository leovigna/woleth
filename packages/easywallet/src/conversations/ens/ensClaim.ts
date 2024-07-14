import { NAMESTONE_DOMAIN } from "@easywallet/envvars";
import { MyContext, MyConversation } from "../../context.js";
import { claimEnsName, getUser, GetUserReturnValue } from "../../controllers/index.js";

/**
 * ENS Claim subdomain command
 * @param conversation
 * @param ctx
 */
export async function ensClaimCommand(conversation: MyConversation, ctx: MyContext) {
    const params = await getUser(conversation, ctx);
    await ensClaim(params, conversation, ctx);
}

/**
 * ENS Claim subdomain conversation
 * @param conversation
 * @param ctx
 */
export async function ensClaim(params: GetUserReturnValue, conversation: MyConversation, ctx: MyContext) {
    const { smartAccountAddress } = params;
    const tgHandle = ctx.from!.username!;
    const name = tgHandle.replaceAll("_", "-").toLowerCase();

    await claimEnsName(
        {
            address: smartAccountAddress,
            name,
        },
        conversation,
        ctx,
    );

    await ctx.reply(
        `${name}.${NAMESTONE_DOMAIN} claimed you can now use it to receive funds to ${smartAccountAddress}!`,
        { parse_mode: "Markdown" },
    );
}
