// import { Address, isAddress } from "viem";
// import { MyContext, MyConversation } from "../context.js";
// import { waitForSelect } from "../utils/waitForSelect.js";
// import { waitForText } from "../utils/waitForText.js";

import { Address, getAddress } from "viem";
import { z } from "zod";
import { waitForText } from "./waitForText.js";
import { MyContext, MyConversation } from "../context.js";

export {};

//TODO: Get owlprotocol zod-sol validator
export const addressRegex = /^0x[a-fA-F0-9]{40}$/;
export const addressZod = z
    .string()
    .regex(addressRegex, { message: "Invalid Address" })
    .transform((a) => getAddress(a))
    .describe("An ethereum address") as z.ZodEffects<z.ZodString, Address, Address>;

export async function waitForAddress(conversation: MyConversation, ctx: MyContext) {
    return waitForText(conversation, ctx, addressZod);
}

//TODO: Wait for Address or ENS

//TODO: Wait for Account (Address/ENS/TG Contact)

/**
 * Inside conversation wait for next user input that is address
 * - Input Address / ENS
 * - Select Contact
 * @param conversation
 * @param ctx
 */
/*
export async function waitForAddress(
    conversation: MyConversation,
    ctx: MyContext,
): Promise<
    | {
          message: Message;
          address: Address;
          cancel: false;
      }
    | {
          message: Message;
          address: undefined;
          cancel: true;
      }
> {
    //Select Address
    const addressMethodResponse = await waitForSelect<"/address" | "/contact">(conversation, ctx, [
        { name: "Input Address", data: "/address" },
        { name: "Select Contact", data: "/contact" },
    ]);
    if (addressMethodResponse.cancel) {
        return {
            message: addressMethodResponse.message,
            address: undefined,
            cancel: true,
        };
    }

    let toAddress: string;
    let toUser: User | undefined;
    const addressMethod = addressMethodResponse.selected;

    if (addressMethod === "/address") {
        //TODO: Validation
        const input = await waitForText(conversation, ctx);
        if (input.cancel) {
            return {
                message: addressMethodResponse.message,
                address: undefined,
                cancel: true,
            };
        }

        if (!isAddress(input.text)) {
            await ctx.reply("Invalid address, mint cancelled");
            return;
        }

        toAddress = input.text;
    } else if (addressMethod === "/contact") {
        const toUserTelegramId = await waitForUser(conversation, ctx);
        if (toUserTelegramId.cancel) return;

        toUser = await conversation.external(() => usersCRUD._getWhereFirst({ telegramId: toUserTelegramId.userId }));
        if (!toUser) {
            //TODO: Handle user not existing
            ctx.reply(getMintInviteLinkMessage(), { parse_mode: "Markdown" });
            return;
        }

        const trpcTo = appRouter.createCaller({
            userId: toUser.id,
            user: toUser,
            //Passed for parser middleware but ignored in rest of middleware
            req: {
                body: {},
                headers: {},
            },
        });
        const safe = await conversation.external(() => trpcTo.safe.safeAddressMe({}));
        toAddress = safe.address;
    }
}

*/
