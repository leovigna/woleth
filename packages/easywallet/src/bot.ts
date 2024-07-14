import { Bot, GrammyError, HttpError, session } from "grammy";
import { TELEGRAM_BOT_HANDLE, TELEGRAM_BOT_TOKEN } from "@easywallet/envvars";
import { conversations, createConversation } from "@grammyjs/conversations";
import { MyContext, MySessionState } from "./context.js";
import { ACTIVE_COMMANDS } from "./commands.js";

if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_BOT_HANDLE) {
    throw new Error("TELEGRAM_BOT_TOKEN and TELEGRAM_BOT_HANDLE must be set");
}

export const bot = new Bot<MyContext>(TELEGRAM_BOT_TOKEN);

//Public commands (directly accesible from Menu)
bot.api.setMyCommands(
    ACTIVE_COMMANDS.filter((command) => command.menu).map((command) => {
        return { command: command.command, description: command.description ?? command.command };
    }),
);

bot.use(
    session<MySessionState, MyContext>({
        initial: () => ({
            safeWallet: {},
            step: "idle",
            chatHistory: [],
        }),
    }),
);

//Middleware
/**
 * General middleware on all messages, not applicable to conversations but it can still trigger within a conversation if a user clicks a previous button.
 * Updates context and chatHistory
 * @param ctx
 * @param next
 */

/*
export async function onMessageMiddleware(
    ctx: MyContext,
    //@ts-expect-error
    next: NextFunction, // is an alias for: () => Promise<void>
): Promise<void> {
    console.debug(ctx.update);
    await next();
}

bot.use(onMessageMiddleware);
*/

//Conversations
bot.use(conversations());
//Create conversations associated with commands
ACTIVE_COMMANDS.forEach((command) => {
    if (command.conversation) {
        bot.use(createConversation(command.conversation, command.command));
        bot.command(command.command, async (ctx) => {
            await ctx.conversation.enter(command.command);
        });
    }
});

// Error handling
bot.catch((err) => {
    const ctx = err.ctx;
    console.error(`Error while handling update ${ctx.update.update_id}:`);
    const e = err.error;
    if (e instanceof GrammyError) {
        console.error("Error in request:", e.description);
    } else if (e instanceof HttpError) {
        console.error("Could not contact Telegram:", e);
    } else {
        console.error("Unknown error:", e);
    }

    ctx.reply("An error occurred. Please try again.");
});
