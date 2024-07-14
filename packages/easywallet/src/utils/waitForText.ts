import { Message } from "grammy/types";
import { z, ZodString, ZodTypeAny } from "zod";
import { MyConversation, MyContext } from "../context.js";

/**
 * Inside conversation wait for next user input that is text
 * - `message.text` (Keyboard input)
 * - `callbackQuery.data` (Inline button)
 * @template T Zod Validator type (defaults to ZodString)
 * @param conversation
 * @param ctx
 * @param expected Expected strings (preferrably /command) (/cancel is always added)
 */
export async function waitForText<T extends ZodTypeAny = ZodString>(
    conversation: MyConversation,
    ctx: MyContext,
    validator: T,
): Promise<
    | {
          message: Message;
          text: string;
          data: z.output<T>;
          cancel: false;
      }
    | {
          message: Message;
          text: undefined;
          data: undefined;
          cancel: true;
      }
> {
    let errorMessage: Message.TextMessage | undefined;
    let response: MyContext;
    let text: string | undefined;
    let data: T | undefined;

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
                data: undefined,
                cancel: true,
            };
        }

        if (!text) {
            //Not text send error response and delete user input
            errorMessage = await ctx.reply(`${validator.description} required.\nPlease answer or /cancel`);
            if (ctx.chat?.id && response.message) {
                await ctx.api.deleteMessage(ctx.chat!.id, response.message?.message_id);
            }
        } else {
            const result = validator.safeParse(text);
            if (result.success) {
                data = result.data;
                // Valid Text, break loop
                break;
            }

            //Invalid text
            const formatted = result.error.format();
            errorMessage = await ctx.reply(`${formatted._errors.join(", ")}\nPlease answer or /cancel`);
        }
    }

    return {
        message: response.message!,
        text: text!,
        data: data!,
        cancel: false,
    };
}
