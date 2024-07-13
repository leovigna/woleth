import { Message } from "grammy/types";
import { InlineKeyboard } from "grammy";
import { z } from "zod";
import { waitForText } from "./waitForText.js";
import { MyContext, MyConversation } from "../context.js";

/**
 * Data model, defines name and parameters
 */
interface DataModel {
    name: string;
    params: {
        [key: string]: {
            name: string;
            //User prompt
            prompt?: string;
            //TODO: Add other types
            //type: "string",
            //validator that returns error message
            validator?: (input: string) => Promise<string | undefined>;
        };
    };
}

/**
 * Default draft render, shows model name and then new line for each key
 * @param model
 * @returns
 */
export function defaultDraftRenderFunction<T = Record<string, string>>(model: DataModel) {
    return function (draft: Partial<T>) {
        let msg =
            Object.keys(draft).length === Object.keys(model.params).length
                ? `✅ Confirm your input for ${model.name}\n`
                : `✏️ Please provide the following input for ${model.name}\n`;

        for (const [key, param] of Object.entries(model.params)) {
            //@ts-expect-error
            msg = msg + "\n" + `${param.name}: ${draft[key] ?? "Please provide input"}`;
        }
        return msg;
    };
}

/**
 * Continue conversation until data model is filled
 * Keeps mutating draft
 * @param conversation
 * @param ctx
 * @param initial input draft
 */
export async function waitForModel<T = Record<string, string>>(
    conversation: MyConversation,
    ctx: MyContext,
    model: DataModel,
    draft: Partial<T> = {},
    draftRender?: (draft: Partial<T>) => string,
): Promise<{ data: T; message: Message } | undefined> {
    const draftRenderDefined = draftRender ?? defaultDraftRenderFunction(model);
    //First time only edit undefined keys
    let firstTime = true;
    const message = await ctx.reply(draftRenderDefined(draft));

    while (true) {
        for (const [key, param] of Object.entries(model.params)) {
            //First pass only edits undefined keys, second pass is edit all
            //@ts-expect-error
            if (!draft[key] || !firstTime) {
                const questionInputMsg = await ctx.reply(param.prompt ?? `${model.name} ${param.name}?`);
                const { message: responseInputMsg, text: responseInput } = await waitForText(
                    conversation,
                    ctx,
                    z.string(),
                );
                if (responseInput === "/cancel") {
                    await Promise.all([
                        ctx.api.deleteMessage(ctx.chat!.id, message.message_id),
                        ctx.api.deleteMessage(ctx.chat!.id, questionInputMsg.message_id),
                        ctx.api.deleteMessage(ctx.chat!.id, responseInputMsg.message_id),
                    ]);
                    await ctx.reply(`${model.name} creation cancelled`);
                    return;
                }

                //Edit draft
                //@ts-expect-error
                draft[key] = responseInput;

                //Delete user inputs
                await ctx.api.editMessageText(ctx.chat!.id, message.message_id, draftRenderDefined(draft));
                await Promise.all([
                    ctx.api.deleteMessage(ctx.chat!.id, questionInputMsg.message_id),
                    ctx.api.deleteMessage(ctx.chat!.id, responseInputMsg.message_id),
                ]);
            }
        }

        //Wait for user confirmation
        await ctx.api.editMessageReplyMarkup(ctx.chat!.id, message.message_id, {
            reply_markup: new InlineKeyboard()
                .text("Confirm", "/confirm")
                .text("Edit", "/edit")
                .text("Cancel", "/cancel"),
        });

        const confirmation = await waitForText<"/confirm" | "/edit">(conversation, ctx, ["/confirm", "/edit"]);
        await ctx.api.editMessageReplyMarkup(ctx.chat!.id, message.message_id, {
            reply_markup: undefined,
        });

        if (confirmation.text === "/confirm") {
            return {
                data: draft as T,
                message,
            };
        } else if (confirmation.cancel) {
            await ctx.reply(`${model.name} creation cancelled`);
            return;
        }

        firstTime = false;
    }
}
