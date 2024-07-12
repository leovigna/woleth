/***** Commands *****/

import { intro, start } from "./conversations/index.js";

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
} as const satisfies Command;
export const WALLET_TOKENS = {
    command: "wallet_tokens",
    description: "View Tokens",
    menu: false,
} as const satisfies Command;
export const WALLET_COLLECTIBLES = {
    command: "wallet_collectibles",
    description: "View Collectibles",
    menu: false,
} as const satisfies Command;

export const ACTIVE_COMMANDS: Array<Command> = [START, INTRO, WALLET, WALLET_TOKENS, WALLET_COLLECTIBLES];
