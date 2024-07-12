import { Message, PhotoSize } from "grammy/types";
import { MyConversation, MyContext } from "../context.js";

/**
 * Inside conversation wait for next user input that is an image
 * - Camera input
 * - Image upload
 * @param conversation
 * @param ctx
 * @param expected Expected strings (preferrably /command) (/cancel is always added)
 */
export async function waitForImage(
    conversation: MyConversation,
    ctx: MyContext,
): Promise<
    | {
          message: Message;
          fileId: string;
          cancel: false;
      }
    | {
          message: Message;
          fileId: undefined;
          cancel: true;
      }
> {
    let errorResponse: Message.TextMessage | undefined;
    let response: MyContext;
    let photos: PhotoSize[] | undefined;

    while (true) {
        //Wait for user input
        response = await conversation.wait();
        if (errorResponse) {
            //Sent error response previously, delete it
            await ctx.api.deleteMessage(ctx.chat!.id, errorResponse.message_id);
        }

        if (response.message?.text === "/cancel") {
            return {
                message: response.message,
                fileId: undefined,
                cancel: true,
            };
        }

        photos = response.message?.photo;

        if (!photos) {
            //Not text send error response and delete user input
            errorResponse = await ctx.reply("Expected image. Please upload/take photo or /cancel");
            if (ctx.chat?.id && response.message) {
                await ctx.api.deleteMessage(ctx.chat!.id, response.message?.message_id);
            }
        } else {
            //Text, break loop
            break;
        }
    }

    const hdPhoto = photos[photos.length - 1];
    const fileId = hdPhoto.file_id;

    return {
        message: response.message!,
        fileId,
        cancel: false,
    };
}
