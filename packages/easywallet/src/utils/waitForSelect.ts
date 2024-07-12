import { Message } from "grammy/types";
import { InlineKeyboard } from "grammy";
import { MyConversation, MyContext } from "../context.js";

/**
 * Inside conversation wait for next user input to select one of the items.
 * A single message is sent with one button per option
 * - `callbackQuery.data` (Inline button) => get index and derive which object to return
 * @param conversation
 * @param ctx
 * @param options Expected options with name and data, name is used for button text
 * @param title Title of message
 */
export async function waitForSelect<T>(
    conversation: MyConversation,
    ctx: MyContext,
    options: { name: string; data: T }[],
    title = "Please select an option",
): Promise<
    | {
          message: Message;
          selected: T;
          cancel: false;
      }
    | {
          message: Message;
          selected: undefined;
          cancel: true;
      }
> {
    let errorMessage: Message.TextMessage | undefined;
    let response: MyContext;
    let selectedMessageIdx: number | undefined;

    //Event if we await promises lineary, there is no guarantee on order in which message show up
    const keyboard = options.reduce((acc, option, idx) => acc.text(`${option.name}`, `${idx}`), new InlineKeyboard());
    const message = await ctx.reply(title, { reply_markup: keyboard });

    while (true) {
        //Wait for user input
        response = await conversation.wait();
        if (errorMessage) {
            //Sent error response previously, delete it
            await ctx.api.deleteMessage(ctx.chat!.id, errorMessage.message_id);
        }

        if (response.message?.text === "/cancel") {
            //Delete options
            await ctx.api.deleteMessage(ctx.chat!.id, message.message_id);

            return {
                message: response.message,
                selected: undefined,
                cancel: true,
            };
        }

        //Find message selected
        selectedMessageIdx = response.callbackQuery?.data ? parseInt(response.callbackQuery.data) : undefined;

        if (selectedMessageIdx === undefined) {
            //Not selected. Send error response and delete user input
            errorMessage = await ctx.reply("Please select one of the options or /cancel");
            if (ctx.chat?.id && response.message) {
                await ctx.api.deleteMessage(ctx.chat!.id, response.message?.message_id);
            }
        } else {
            //Selected, break loop
            break;
        }
    }

    //Delete options, remove button from selected
    await ctx.api.deleteMessage(ctx.chat!.id, message.message_id);

    return {
        message: response.message!,
        selected: options[selectedMessageIdx].data,
        cancel: false,
    };
}

/**
 * Inside conversation wait for next user input to select one of the items.
 * Each item is in a separate message with a Select button
 * - `callbackQuery.data` (Inline button) => get index and derive which object to return
 * @param conversation
 * @param ctx
 * @param options Expected options with name and data, name is used for message text
 */
export async function waitForSelectMultiMessage<T>(
    conversation: MyConversation,
    ctx: MyContext,
    options: { name: string; data: T }[],
): Promise<
    | {
          message: Message;
          selected: T;
          cancel: false;
      }
    | {
          message: Message;
          selected: undefined;
          cancel: true;
      }
> {
    let errorMessage: Message.TextMessage | undefined;
    let response: MyContext;
    let selectedMessageIdx: number | undefined;

    //Event if we await promises lineary, there is no guarantee on order in which message show up
    const messages = await Promise.all(
        options.map((option, idx: number) => {
            return ctx.reply(option.name, { reply_markup: new InlineKeyboard().text("Select", `${idx}`) });
        }),
    );

    while (true) {
        //Wait for user input
        response = await conversation.wait();
        if (errorMessage) {
            //Sent error response previously, delete it
            await ctx.api.deleteMessage(ctx.chat!.id, errorMessage.message_id);
        }

        if (response.message?.text === "/cancel") {
            //Delete options
            await Promise.all(
                messages.map((message) => {
                    return ctx.api.deleteMessage(ctx.chat!.id, message.message_id);
                }),
            );

            return {
                message: response.message,
                selected: undefined,
                cancel: true,
            };
        }

        //Find message selected
        selectedMessageIdx = response.callbackQuery?.data ? parseInt(response.callbackQuery.data) : undefined;

        if (selectedMessageIdx === undefined) {
            //Not selected. Send error response and delete user input
            errorMessage = await ctx.reply("Please select one of the options or /cancel");
            if (ctx.chat?.id && response.message) {
                await ctx.api.deleteMessage(ctx.chat!.id, response.message?.message_id);
            }
        } else {
            //Selected, break loop
            break;
        }
    }

    //Delete options, remove button from selected
    await Promise.all(
        messages.map((message, idx) => {
            if (idx === selectedMessageIdx) {
                return ctx.api.editMessageReplyMarkup(ctx.chat!.id, message.message_id, { reply_markup: undefined });
            } else {
                return ctx.api.deleteMessage(ctx.chat!.id, message.message_id);
            }
        }),
    );

    return {
        message: response.message!,
        selected: options[selectedMessageIdx].data,
        cancel: false,
    };
}
