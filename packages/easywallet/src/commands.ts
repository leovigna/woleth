/***** Commands *****/

import { circlesSignup } from "./conversations/circles/index.js";
import { ens, ensClaimCommand, intro, start, wallet, walletCollectibles, walletTokens } from "./conversations/index.js";
import { walletDummyCommand } from "./conversations/wallet/walletDummyTx.js";

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
export const WALLET_DUMMY = {
    command: "wallet_dummy",
    description: "Sample AA Transaction",
    menu: false,
    conversation: walletDummyCommand,
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
    conversation: ensClaimCommand,
} as const satisfies Command;

/***** Circles UBI Management *****/
//TODO: Mint Circles
export const CIRCLES_SIGNUP = {
    command: "circle_signup",
    description: "Signup for Circles",
    menu: true,
    conversation: circlesSignup,
} as const satisfies Command;

export const CIRCLES_MINT = {
    command: "circle_mint",
    description: "Mint Circles",
    menu: true,
} as const satisfies Command;

export const ACTIVE_COMMANDS: Array<Command> = [
    START,
    INTRO,
    // WALLET,
    // WALLET_TOKENS,
    // WALLET_COLLECTIBLES,
    // WALLET_DUMMY,
    ENS,
    ENS_CLAIM,
    CIRCLES_SIGNUP,
    // CIRCLES_MINT,
];
