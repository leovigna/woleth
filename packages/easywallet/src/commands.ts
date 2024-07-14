/***** Commands *****/

import { ens, ensClaim, intro, start, wallet, walletCollectibles, walletTokens } from "./conversations/index.js";

/** Describes the parameter of a command */
export interface CommandParam {
    name: string;
    type: "string" | "number";
    description: string;
}

export interface Command {
    //command category
    category?: string;
    //command
    command: string;
    //description for User (showed in menu and /help command)
    description?: string;
    //display on menu
    menu?: boolean;
    //conversation
    conversation?: any;
}

export const START = {
    category: "intro",
    command: "start",
    description: "Start from the beginning",
    menu: false,
    conversation: start,
} as const satisfies Command;

export const INTRO = {
    category: "intro",
    command: "intro",
    description: "Main intro",
    menu: true,
    conversation: intro,
} as const satisfies Command;

export const WALLET = {
    category: "wallet",
    command: "wallet",
    description: "View Wallet",
    menu: true,
    conversation: wallet,
} as const satisfies Command;
export const WALLET_TOKENS = {
    command: "wallet_tokens",
    description: "View Tokens",
    menu: false,
    conversation: walletTokens,
} as const satisfies Command;
export const WALLET_COLLECTIBLES = {
    command: "wallet_collectibles",
    description: "View Collectibles",
    menu: false,
    conversation: walletCollectibles,
} as const satisfies Command;

/***** ENS Management *****/
export const ENS = {
    command: "ens",
    description: "Ethereum Naming Service",
    menu: true,
    conversation: ens,
} as const satisfies Command;

export const ENS_CLAIM = {
    command: "ens_claim",
    description: "Claim ENS Domain",
    menu: false,
    conversation: ensClaim,
} as const satisfies Command;

/***** Circles UBI Management *****/
//TODO: Mint Circles

export const ACTIVE_COMMANDS: Array<Command> = [
    START,
    INTRO,
    WALLET,
    WALLET_TOKENS,
    WALLET_COLLECTIBLES,
    ENS,
    ENS_CLAIM,
];
