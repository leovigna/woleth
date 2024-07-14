import { TELEGRAM_BOT_NAME, TELEGRAM_BOT_HANDLE } from "@easywallet/envvars";
import { loadTemplate } from "./loadTemplate.js";

/**
 * Load markdown file and templatize intro message
 * @returns
 */
export function getIntroMessage(locale: string | undefined): string {
    const template = loadTemplate("intro.md", locale);
    return template.replaceAll("$BOT_NAME", TELEGRAM_BOT_NAME).replaceAll("$BOT_TELEGRAM_HANDLE", TELEGRAM_BOT_HANDLE!);
}
