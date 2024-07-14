import { NAMESTONE_API_KEY, NAMESTONE_API_URL, NAMESTONE_DOMAIN } from "@easywallet/envvars";
import { Address } from "viem";
import { MyContext, MyConversation } from "../context.js";

export interface EnsTextRecords {
    "com.twitter"?: string;
    "com.github"?: string;
    "com.discord"?: string;
    url?: string;
    location?: string;
    description?: string;
    avatar?: string;
    [key: string]: string | undefined;
}

export async function claimEnsName(
    params: { address: Address; name: string; textRecords?: EnsTextRecords },
    conversation: MyConversation,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _ctx: MyContext,
) {
    if (!NAMESTONE_API_KEY) throw new Error("NAMESTONE_API_KEY undefined");

    const nameStoneApiKey = NAMESTONE_API_KEY;
    const nameStoneDomain = NAMESTONE_DOMAIN;
    const { name, address, textRecords } = params;

    //TODO: Error handling
    await conversation.external(() =>
        fetch(`${NAMESTONE_API_URL}/claim-name`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: nameStoneApiKey,
            },
            body: JSON.stringify({
                domain: nameStoneDomain,
                name,
                address,
                text_records: textRecords ?? {},
            }),
        }),
    );

    return;
}

export async function setEnsName(
    params: { address: Address; name: string; textRecords?: EnsTextRecords },
    conversation: MyConversation,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _ctx: MyContext,
) {
    if (!NAMESTONE_API_KEY) throw new Error("NAMESTONE_API_KEY undefined");

    const nameStoneApiKey = NAMESTONE_API_KEY;
    const nameStoneDomain = NAMESTONE_DOMAIN;
    const { name, address, textRecords } = params;

    //TODO: Error handling
    await conversation.external(() =>
        fetch(`${NAMESTONE_API_URL}/set-name`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: nameStoneApiKey,
            },
            body: JSON.stringify({
                domain: nameStoneDomain,
                name,
                address,
                text_records: textRecords ?? {},
            }),
        }),
    );

    return;
}
