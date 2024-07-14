import { TelegramUser, telegramUserResource } from "@easywallet/firebase/admin";
import { createClient } from "@owlprotocol/core-trpc/client";
import { createUserCustodialAccount } from "@owlprotocol/clients";
import { OWL_API_SECRET } from "@easywallet/envvars";
import { Address, LocalAccount } from "viem";
import { getSimpleAccountAddress } from "@owlprotocol/contracts-account-abstraction";
import { MyContext, MyConversation } from "../context.js";

const baseUrl = "http://localhost:3000/api";
const trpcUrl = "http://localhost:3000/api/trpc";

export interface GetUserReturnValue {
    user: TelegramUser;
    account: LocalAccount;
    smartAccountAddress: Address;
}

/**
 * Get user info such as MPC Account & Smart Account Address
 * @param conversation
 * @param ctx
 * @returns
 */
export async function getUser(conversation: MyConversation, ctx: MyContext): Promise<GetUserReturnValue> {
    const telegramId = ctx.from?.id;
    if (!telegramId) throw new Error("ctx.from.id undefined!");

    // Create Telegram User in Firebase
    const user: TelegramUser = { userId: `${telegramId}`, telegramId };
    await conversation.external(() => telegramUserResource.upsert(user));

    // Create Owl User
    if (!OWL_API_SECRET) throw new Error("OWL_API_SECRET undefined");
    const apiKey = OWL_API_SECRET;
    const client = createClient(
        {
            apiKey,
        },
        trpcUrl,
    );

    // Load MPC Account
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

    // Compute Smart Account Address
    const smartAccountAddress = getSimpleAccountAddress({ owner: account.address });

    return { user, account, smartAccountAddress };
}
