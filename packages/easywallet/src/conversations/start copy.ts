/* eslint-disable @typescript-eslint/no-unused-vars */
// import { conversations } from "@grammyjs/conversations";
import { TelegramUser, telegramUserResource } from "@easywallet/firebase/admin";
import { createClient } from "@owlprotocol/core-trpc/client";
import { createUserCustodialAccount, createOwlClients, getBundlerUrl } from "@owlprotocol/clients";
import {
    OWL_API_SECRET,
    NAMESTONE_API_URL,
    NAMESTONE_DOMAIN,
    NAMESTONE_API_KEY,
    STRIPE_TOKEN,
} from "@easywallet/envvars";
import { createSmartAccountClient } from "permissionless";
import { signerToSimpleSmartAccount } from "permissionless/accounts";
import { ENTRYPOINT_ADDRESS_V07 } from "permissionless/utils";
import { http } from "viem";
import { localhost } from "viem/chains";
import { getSimpleAccountAddress } from "@owlprotocol/contracts-account-abstraction";
import { MyContext, MyConversation } from "../context.js";
// import { waitForAddress } from "../utils/waitForAddress.js";
// import { getIntroMessage } from "../templates/index.js";

//TODO: Remove .env file
//TODO: Core-provider helper methods

export async function start(_conversation: MyConversation, _ctx: MyContext) {
    console.debug("test");
}

export async function start4(_conversation: MyConversation, ctx: MyContext) {
    if (!STRIPE_TOKEN) throw new Error("STRIPE_TOKEN undefined");

    //4242 4242 4242 4242
    //01/25
    //111
    //John Doe
    //Country (Any)
    //0000

    const result = await ctx.replyWithInvoice(
        "Pay 1$",
        "Please pay",
        "0x1",
        "USD",
        [{ label: "1 USDC", amount: 100 }],
        {
            provider_token: STRIPE_TOKEN,
        },
    );

    console.debug({ result });
}

export async function start3(conversation: MyConversation, ctx: MyContext) {
    //TODO: Locales
    // console.debug({ locale: ctx.from?.language_code });
    const { user } = await getConversationUser(conversation, ctx);

    // Create user with TRPC
    //TODO: Global?
    if (!OWL_API_SECRET) throw new Error("OWL_API_SECRET undefined");
    const apiKey = OWL_API_SECRET;
    const baseUrl = "http://localhost:3000/api";
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

    const account = await conversation.external(() =>
        createUserCustodialAccount({
            apiKey,
            userId: userOwl.userId,
            owlApiRestBaseUrl: baseUrl,
        }),
    );

    const smartAccountAddress = getSimpleAccountAddress({ owner: account.address });
    if (!NAMESTONE_API_KEY) throw new Error("NAMESTONE_API_KEY undefined");

    const nameStoneApiKey = NAMESTONE_API_KEY;
    const nameStoneDomain = NAMESTONE_DOMAIN;
    // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
    const tgHandle = ctx.from?.username!;
    const name = tgHandle.replaceAll("_", "-").toLowerCase();

    const nameStoneResult = await conversation.external(() =>
        fetch(`${NAMESTONE_API_URL}/set-name`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: nameStoneApiKey,
            },
            body: JSON.stringify({
                domain: nameStoneDomain,
                name,
                address: smartAccountAddress,
            }),
        }),
    );
    const nameStoneResultJson: { success: boolean } = await nameStoneResult.json();

    console.debug({ name, nameStoneResultJson });
}

export async function start2(conversation: MyConversation, ctx: MyContext) {
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
    const baseUrl = "http://localhost:3000/api";
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

    const account = await conversation.external(() =>
        createUserCustodialAccount({
            apiKey,
            userId: userOwl.userId,
            owlApiRestBaseUrl: baseUrl,
        }),
    );

    const chain = localhost;
    const chainId = 1337;
    const { publicClient, bundlerClient, paymasterClient } = createOwlClients({ chainId, baseUrl });

    const smartAccount = await conversation.external(() =>
        signerToSimpleSmartAccount(publicClient, {
            signer: account,
            factoryAddress: "0xe7a78ba9be87103c317a66ef78e6085bd74dd538", //Simple Smart Account factory
            entryPoint: ENTRYPOINT_ADDRESS_V07,
        }),
    );

    const smartAccountClient = createSmartAccountClient({
        account: smartAccount,
        entryPoint: ENTRYPOINT_ADDRESS_V07,
        chain,
        bundlerTransport: http(getBundlerUrl({ chainId, baseUrl })),
        middleware: {
            gasPrice: async () => {
                return (await conversation.external(() => bundlerClient.getUserOperationGasPrice())).fast;
            },
            sponsorUserOperation: paymasterClient.sponsorUserOperation,
        },
    });

    const txHash = await conversation.external(() =>
        smartAccountClient.sendTransaction({
            to: "0xd8da6bf26964af9d7eed9e03e53415d37aa96045", //vitalik.eth
            value: 0n,
            data: "0x1234",
        }),
    );

    await ctx.reply(`Transaction sent ${txHash}`);

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
