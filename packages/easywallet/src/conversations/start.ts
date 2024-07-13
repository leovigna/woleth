// import { conversations } from "@grammyjs/conversations";
import { TelegramUser, telegramUserResource } from "@easywallet/firebase/admin";
import { createClient } from "@owlprotocol/core-trpc/client";
import { createUserCustodialLocalAccount } from "@owlprotocol/core-provider";
import { OWL_API_SECRET } from "@easywallet/envvars";
import { MyContext, MyConversation } from "../context.js";
// import { waitForAddress } from "../utils/waitForAddress.js";
// import { getIntroMessage } from "../templates/index.js";

//TODO: Remove .env file
//TODO: Core-provider helper methods

export async function start(conversation: MyConversation, ctx: MyContext) {
    /*
    const args = ctx.match as string;

    if (args) {
        let decodedArgs: Record<string, string>;
        try {
            const decodedArgsStr = Buffer.from(args, "base64");
            decodedArgs = JSON.parse(decodedArgsStr.toString());
        } catch (e) {
            await ctx.reply("😞 It seems like your link is invalid, redirecting your to the start.");
            await ctx.reply(getIntroMessage(), { parse_mode: "Markdown" });
            return;
        }

        console.debug(decodedArgs);
    }

    await ctx.reply(getIntroMessage(), { parse_mode: "Markdown" });
    */

    //TODO: Optimize caching?
    const { user } = await getConversationUser(conversation, ctx);

    // Create user with TRPC
    //TODO: Global?
    if (!OWL_API_SECRET) throw new Error("OWL_API_SECRET undefined");
    const apiKey = OWL_API_SECRET;
    const restUrl = "http://localhost:3000/api";
    const trpcUrl = "http://localhost:3000/api/trpc";

    const client = createClient(
        {
            apiKey,
        },
        trpcUrl,
    );

    const userOwl = await conversation.external(() =>
        client.admin.user.custodial.create.mutate({ externalId: `${user.telegramId}` }),
    );

    const userOwlWallets = await conversation.external(() =>
        client.admin.user.custodial.wallets.query({ userId: userOwl.userId }),
    );

    const userAccount = await conversation.external(() =>
        createUserCustodialLocalAccount({
            apiKey,
            userId: userOwl.userId,
            owlApiRestBaseUrl: restUrl,
        }),
    );

    console.debug({ user, userOwl, userOwlWallets: userOwlWallets.wallets, account: userAccount.address });

    //TODO: Create provider with core-provider

    // Address demo
    // await ctx.reply("Please send address");
    // const result = await waitForAddress(_conversation, ctx);
    // await ctx.reply("Thanks!");
    // console.debug(result);
}

export async function getConversationUser(
    conversation: MyConversation,
    ctx: MyContext,
): Promise<{ user: TelegramUser }> {
    const telegramId = ctx.from?.id;
    if (!telegramId) throw new Error("ctx.from.id undefined!");

    //Update user
    const user: TelegramUser = { userId: `${telegramId}`, telegramId };
    await conversation.external(() => telegramUserResource.upsert(user));

    return { user };
}
