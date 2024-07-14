/* eslint-disable @typescript-eslint/no-unused-vars */
import { createClient } from "@owlprotocol/core-trpc/client";
import { OWL_API_SECRET } from "@easywallet/envvars";
import { Network } from "@owlprotocol/eth-firebase";
import { MyContext, MyConversation } from "../context.js";

const trpcUrl = "http://localhost:3000/api/trpc";

/**
 * Get network
 * @param conversation
 * @param _ctx
 * @returns
 */
export async function getNetwork(params: { chainId: number }, conversation: MyConversation, _ctx: MyContext) {
    const { chainId } = params;

    // Create Owl User
    if (!OWL_API_SECRET) throw new Error("OWL_API_SECRET undefined");
    const apiKey = OWL_API_SECRET;
    const client = createClient(
        {
            apiKey,
        },
        trpcUrl,
    );

    // Load networks
    const network = (await conversation.external(() => client.network.get.query({ chainId }))) as Network;

    return { network };
}

/**
 * Get list of supported networks
 * @param conversation
 * @param _ctx
 * @returns
 */
export async function getNetworks(conversation: MyConversation, _ctx: MyContext) {
    // Create Owl User
    if (!OWL_API_SECRET) throw new Error("OWL_API_SECRET undefined");
    const apiKey = OWL_API_SECRET;
    const client = createClient(
        {
            apiKey,
        },
        trpcUrl,
    );

    // Load networks
    const networks = (await conversation.external(() => client.network.list.query({}))) as Network[];

    return { networks };
}
