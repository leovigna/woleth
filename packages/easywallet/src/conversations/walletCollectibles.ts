import { InlineKeyboard } from "grammy";
import { MyContext, MyConversation } from "../context.js";
import { userNFTs } from "../data.js";

export async function walletCollectibles(_conversation: MyConversation, ctx: MyContext) {
    for (const nft of userNFTs) {
        const message = `🎨 Your NFT Collection:
Name: ${nft.name}
Collection: ${nft.collection}
Token ID: ${nft.tokenId}`;

        const openSeaUrl = `https://opensea.io/assets/${nft.contractAddress}/${nft.tokenId}`;

        const nftKeyboard = new InlineKeyboard()
            .text("Send", `send_nft:${nft.tokenId}`)
            .row()
            .url("View On Opensea", openSeaUrl);

        await ctx.replyWithPhoto(nft.imageUrl, { caption: message, reply_markup: nftKeyboard });
    }
}
