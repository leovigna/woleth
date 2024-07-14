import { existsSync, readFileSync } from "fs";
import { join } from "path";

/**
 * Load markdown template for locale
 */
export function loadTemplate(template: string, locale: string | undefined = "en", templatesDir = "./templates") {
    let path = join(templatesDir, locale, template);

    if (!existsSync(path)) {
        //Set path to default (english) locale
        path = join(templatesDir, "en", template);
    }

    return readFileSync(path, "utf-8");
}
