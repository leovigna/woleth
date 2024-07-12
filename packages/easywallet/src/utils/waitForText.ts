import { Message } from "grammy/types";
import { MyConversation, MyContext } from "../context.js";

/**
 * Inside conversation wait for next user input that is text
 * - `message.text` (Keyboard input)
 * - `callbackQuery.data` (Inline button)
 * @param conversation
 * @param ctx
 * @param expected Expected strings (preferrably /command) (/cancel is always added)
 */
export async function waitForText<T extends string>(
    conversation: MyConversation,
    ctx: MyContext,
    expected?: T[],
): Promise<
    | {
          message: Message;
          text: T;
          cancel: false;
      }
    | {
          message: Message;
          text: undefined;
          cancel: true;
      }
> {
    let errorMessage: Message.TextMessage | undefined;
    let response: MyContext;
    let text: string | undefined;

    while (true) {
        //Wait for user input
        response = await conversation.wait();
        if (errorMessage) {
            //Sent error response previously, delete it
            await ctx.api.deleteMessage(ctx.chat!.id, errorMessage.message_id);
        }

        text = response.message?.text ?? response.callbackQuery?.data;
        if (text === "/cancel") {
            return {
                //TODO: Fix this, button may trigger this
                message: response.message!,
                text: undefined,
                cancel: true,
            };
        }

        if (!text) {
            //Not text send error response and delete user input
            errorMessage = await ctx.reply("Expected text input or button click. Please answer or /cancel");
            if (ctx.chat?.id && response.message) {
                await ctx.api.deleteMessage(ctx.chat!.id, response.message?.message_id);
            }
        } else if (expected && !expected.includes(text! as T)) {
            //Not expected text
            errorMessage = await ctx.reply(`Expected ${expected.join(" ")}. Please answer or /cancel`);
        } else {
            //Text, break loop
            break;
        }
    }

    return {
        message: response.message!,
        text: text as T,
        cancel: false,
    };
}
