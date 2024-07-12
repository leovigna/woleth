import { TELEGRAM_BOT_NAME, TELEGRAM_BOT_HANDLE } from "@easywallet/envvars";
import { readFileSync } from "fs";

let introMessageCache: string;
/**
 * Load markdown file and templatize intro message
 * @returns
 */
export function getIntroMessage(): string {
    if (!introMessageCache) {
        const template = readFileSync("./templates/intro.md", "utf-8");
        introMessageCache = template
            .replaceAll("BOT_NAME", TELEGRAM_BOT_NAME)
            .replaceAll("BOT_TELEGRAM_HANDLE", TELEGRAM_BOT_HANDLE!);
    }

    return introMessageCache;
}
