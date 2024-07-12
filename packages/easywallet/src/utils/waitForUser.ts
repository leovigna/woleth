import { Message } from "grammy/types";
import { Keyboard } from "grammy";
import { MyConversation, MyContext } from "../context.js";

/**
 * Inside conversation wait for next user input that is a Telegram Contact
 * - `message.text` (Keyboard input)
 * - `callbackQuery.data` (Inline button)
 * @param conversation
 * @param ctx
 * @param expected Expected strings (preferrably /command) (/cancel is always added)
 */
export async function waitForUser(
    conversation: MyConversation,
    ctx: MyContext,
): Promise<
    | {
          message: Message;
          userId: number;
          cancel: false;
      }
    | {
          message: Message;
          userId: undefined;
          cancel: true;
      }
> {
    let errorMessage: Message.TextMessage | undefined;
    let response: MyContext;
    let userId: number | undefined;

    let inputUser = await ctx.reply("Please select a contact", {
        reply_markup: new Keyboard().requestUsers("Select contact", 1).resized(true).persistent(),
    });

    while (true) {
        //Wait for user input
        response = await conversation.wait();
        if (errorMessage) {
            //Sent error response previously, delete it
            await ctx.api.deleteMessage(ctx.chat!.id, errorMessage.message_id);
        }

        if (response.message?.text === "/cancel") {
            await ctx.api.deleteMessage(ctx.chat!.id, inputUser.message_id);
            return {
                message: response.message,
                userId: undefined,
                cancel: true,
            };
        }

        //TODO: Multiple possible (though default is 1)
        userId = response.message?.users_shared?.users[0].user_id;

        if (!userId) {
            //Not text send error response and delete user input
            errorMessage = await ctx.reply("Expected contact share. Please select or /cancel");
            if (ctx.chat?.id && response.message) {
                await ctx.api.deleteMessage(ctx.chat!.id, response.message?.message_id);
            }

            // Show the contacts input again
            inputUser = await ctx.reply("Please select a contact", {
                reply_markup: new Keyboard().requestUsers("Select contact", 1).resized(true).persistent(),
            });
        } else {
            //Text, break loop
            break;
        }
    }

    await ctx.api.deleteMessage(ctx.chat!.id, inputUser.message_id);

    return {
        message: response.message!,
        userId: userId!,
        cancel: false,
    };
}
