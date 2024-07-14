import { InlineKeyboard } from "grammy";
import { Message } from "grammy/types";
import { z } from "zod";
import { waitForImage } from "./waitForImage.js";
import { waitForText } from "./waitForText.js";
import { MyConversation, MyContext } from "../context.js";

const confirmUploadZod = z.enum(["/confirm", "/upload"]);

/**
 * Inside wait for user to upload and confirm an image
 * @param conversation
 * @param ctx
 * @param imagePlaceHolder Initial placeholder
 */
export async function waitForImageEditable(
    conversation: MyConversation,
    ctx: MyContext,
    imagePlaceHolder: string,
    imageCaption?: string,
): Promise<
    | {
          message: Message;
          fileId?: string;
          cancel: false;
      }
    | {
          message: Message;
          fileId: undefined;
          cancel: true;
      }
> {
    //First time wait for user to hit button, after we are in edit mode
    let firstTime = true;
    let fileId: string | undefined;
    //TODO: Make imagePlaceholder optional
    const message = await ctx.replyWithPhoto(imagePlaceHolder, {
        caption: imageCaption,
        reply_markup: new InlineKeyboard()
            .text("Confirm", "/confirm")
            .text("Upload Image", "/upload")
            .text("Cancel", "/cancel"),
    });
    while (true) {
        if (!firstTime) {
            const imageInput = await ctx.reply("Please send or take a photo.");
            const imageResponse = await waitForImage(conversation, ctx);
            if (!imageResponse.cancel) {
                //Uploaded new image
                fileId = imageResponse.fileId;
                await ctx.api.deleteMessage(ctx.chat!.id, imageInput.message_id);
                await ctx.api.deleteMessage(ctx.chat!.id, imageResponse.message.message_id);
                await ctx.api.editMessageMedia(
                    ctx.chat!.id,
                    message.message_id,
                    {
                        type: "photo",
                        media: fileId,
                        caption: imageCaption,
                    },
                    {
                        reply_markup: new InlineKeyboard()
                            .text("Confirm", "/confirm")
                            .text("Change Image", "/upload")
                            .text("Cancel", "/cancel"),
                    },
                );
            }
        }
        firstTime = false;

        const confirmation = await waitForText(conversation, ctx, confirmUploadZod);
        await ctx.api.editMessageReplyMarkup(ctx.chat!.id, message.message_id, {
            reply_markup: undefined,
        });

        if (confirmation.data === "/confirm") {
            return {
                message,
                fileId,
                cancel: false,
            };
        } else if (confirmation.cancel) {
            await ctx.reply("Image upload cancelled");
            return {
                message,
                fileId: undefined,
                cancel: true,
            };
        }
    }
}
