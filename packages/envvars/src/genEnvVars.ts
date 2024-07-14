import { ESLint } from "eslint";
import { writeFileSync } from "fs";

export enum Platform {
    NODE = "NODE",
    BROWSER = "BROWSER",
}

/** Define an envvar, defaultValues, and enum values if applicable */
export interface EnvVarDef {
    readonly name: string;
    readonly defaultValue?: string;
    readonly enumValues?: string[];
    /** Which platform envvar is supported on neutral = both browser and node */
    readonly platform: "browser" | "node" | "neutral";
}

// Firebase config (admin & web sdks)
const FIREBASE_ENVVARS: EnvVarDef[] = [
    { name: "FIREBASE_MOCK", platform: "neutral", defaultValue: "true", enumValues: ["true", "false"] },
    { name: "FIREBASE_API_KEY", platform: "neutral" },
    { name: "FIREBASE_AUTH_DOMAIN", platform: "neutral" },
    { name: "FIREBASE_PROJECT_ID", platform: "neutral", defaultValue: "woleth" },
    { name: "FIREBASE_APP_ID", platform: "neutral", defaultValue: "woleth" },
    { name: "FIREBASE_MEASUREMENT_ID", platform: "neutral" },
    { name: "FIREBASE_SERVICE_EMAIL", platform: "node" },
    { name: "FIREBASE_PRIVATE_KEY", platform: "node" },
    { name: "FIREBASE_DATABASE_URL", platform: "neutral" },
    { name: "FIREBASE_STORAGE_BUCKET", platform: "neutral", defaultValue: "woleth" },
    { name: "FIREBASE_LOCAL_CACHE_SIZE", platform: "neutral", defaultValue: "-1" },
    {
        name: "FIREBASE_LOCAL_CACHE_MANAGER",
        platform: "neutral",
        defaultValue: "MEMORY",
        enumValues: ["MEMORY", "SINGLE_TAB", "MULTIPLE_TAB"],
    },
];

// Telegram
const TELEGRAM_BOT_ENVVARS: EnvVarDef[] = [
    { name: "TELEGRAM_BOT_TOKEN", platform: "node" },
    { name: "TELEGRAM_BOT_HANDLE", platform: "node", defaultValue: "@woleth" },
    { name: "TELEGRAM_BOT_NAME", platform: "node", defaultValue: "Easy Wallet" },
    { name: "STRIPE_TOKEN", platform: "node" },
];

// Owl Protocol
const OWL_ENVVARS: EnvVarDef[] = [{ name: "OWL_API_SECRET", platform: "node" }];

const NAMESTONE_ENVVARS: EnvVarDef[] = [
    { name: "NAMESTONE_API_URL", platform: "node", defaultValue: "https://namestone.xyz/api/public_v1" },
    {
        name: "NAMESTONE_API_KEY",
        platform: "node",
    },
    { name: "NAMESTONE_DOMAIN", platform: "node", defaultValue: "woleth.eth" },
];

const PIMLICO_ENVVARS: EnvVarDef[] = [
    {
        name: "PIMLICO_API_KEY",
        platform: "node",
    },
];

export const ENVVARS: EnvVarDef[] = [
    {
        name: "LOG_LEVEL",
        platform: "neutral",
        defaultValue: "warn",
        enumValues: ["trace", "debug", "info", "warn", "error"],
    },
    ...FIREBASE_ENVVARS,
    ...TELEGRAM_BOT_ENVVARS,
    ...OWL_ENVVARS,
    ...NAMESTONE_ENVVARS,
    ...PIMLICO_ENVVARS,
];

const NODE_ENV_VAR = {
    name: "NODE_ENV",
    defaultValue: "development",
    enumValues: ["development", "test", "ci", "staging", "production"],
};

/**
 * Support both import.meta.env imports and process.env imports
 * @param name of envvar
 * @param defaultValue default hard-coded value
 * @returns
 */
export function genEnvVarStatement(name: string, platform: Platform, defaultValue?: string): string {
    const varName = `export const ${name}`;
    let varValue: string;
    if (platform === Platform.NODE) {
        //value as process.env (NodeJS only)
        varValue = `process.env.${name}`;
    } else if (platform === Platform.BROWSER) {
        varValue = `import.meta.env.VITE_${name}`;
    } else {
        throw new Error(`Invalid moduleType ${platform}`);
    }
    //Add default value
    if (defaultValue) {
        varValue = `${varValue} ?? "${defaultValue}"`;
    }
    return `${varName} = ${varValue};`;
}

export function genEnvVarTypeDef(name: string, enumValues?: string[], defined?: boolean) {
    if (enumValues) return `readonly ${name}${defined ? "" : "?"}: ${enumValues.map((e) => `"${e}"`).join("|")};`;

    return `readonly ${name}${defined ? "" : "?"}: string;`;
}

/** Generate envvar exports */
export function genEnvVarsExports(envvars: EnvVarDef[], platform: Platform) {
    envvars = envvars.filter((e) => {
        if (platform === Platform.NODE) {
            return e.platform === "node" || e.platform === "neutral";
        } else if (platform === Platform.BROWSER) {
            return e.platform === "browser" || e.platform === "neutral";
        }
    });

    const exports = envvars.map((e) => genEnvVarStatement(e.name, platform, e.defaultValue)).join("\n");
    return exports;
}

/** Prefix data for the file */
export function genEnvVarsPrelude(envvars: EnvVarDef[], platform: Platform): string {
    envvars = envvars.filter((e) => {
        if (platform === Platform.NODE) {
            return e.platform === "node" || e.platform === "neutral";
        } else if (platform === Platform.BROWSER) {
            return e.platform === "browser" || e.platform === "neutral";
        }
    });

    const comment = `
/**
 * Environment variables. We use a hybrid solution that supports both import.meta.env for static
 * replacement used by client bundlers (Vite, Webpack...) and process.env for NodeJS libraries.
 * @module Environment
 */
console.debug("Loading ${platform} envvars")
`;

    if (platform === Platform.NODE) {
        //NODE_ENV loaded before .env file
        const dotenvLoad = `
import { dotenvConfig } from "./dotenvConfig.js";
dotenvConfig();`;

        const types = [
            genEnvVarTypeDef(NODE_ENV_VAR.name, NODE_ENV_VAR.enumValues),
            ...envvars.map((e) => genEnvVarTypeDef(e.name, e.enumValues)),
        ];
        const globalNameSpace = `declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace NodeJS {
        interface ProcessEnv {
            ${types.join("\n            ")}
        }
    }
}
`;
        return [comment, globalNameSpace, dotenvLoad].join("\n");
    } else if (platform === Platform.BROWSER) {
        const NODE_ENV_EXPORT = `export const NODE_ENV = import.meta.env.MODE ?? "development";`;

        const typesWithVITE = [...envvars.map((e) => genEnvVarTypeDef(`VITE_${e.name}`, e.enumValues))];
        const globalNameSpace = `declare global {
    interface ImportMetaEnv {
        ${typesWithVITE.join("\n        ")}
    }
}
`;
        //Define Import Meta
        const viteClientDTS = `/// <reference types="vite/client" />`;
        return [viteClientDTS, comment, globalNameSpace, NODE_ENV_EXPORT].join("\n");
    } else {
        throw new Error(`Invalid moduleType ${platform}`);
    }
}

export async function writeEnvVarFile(envvars: EnvVarDef[], moduleType: Platform, envVarsPath: string) {
    const file = `${genEnvVarsPrelude(envvars, moduleType)}\n${genEnvVarsExports(envvars, moduleType)}`;
    writeFileSync(envVarsPath, file);

    //Lint files
    const eslint = new ESLint({ useEslintrc: true, fix: true });
    const results = await eslint.lintFiles(envVarsPath);
    await ESLint.outputFixes(results);
}

export async function main() {
    await Promise.all([
        writeEnvVarFile(ENVVARS, Platform.BROWSER, "src/envvars.browser.ts"),
        writeEnvVarFile(ENVVARS, Platform.NODE, "src/envvars.ts"),
    ]);
}

main();
