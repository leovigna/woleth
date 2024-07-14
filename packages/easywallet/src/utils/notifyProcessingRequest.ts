import { MyContext } from "../context.js";

/**
 * Send notification to user that we are processign their request and send the typing action
 * Does not make calls to external services so conversation.external not required?
 * @param ctx
 */
export async function notifyProcessingRequest(ctx: MyContext) {
    //Send loading message and set action to typing
    //Don't use reply util to avoid bloating history
    const processingNotify = await ctx.reply("Processing request...");

    //Forgot the StackOverflow post but this patch makes typing animation work
    //@ts-expect-error
    ctx.webhookReply = false;
    ctx.replyWithChatAction("typing");
    //@ts-expect-error
    ctx.webhookReply = true;

    return processingNotify;
}
