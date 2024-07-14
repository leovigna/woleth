import { FirebaseQueryResource, FirebaseResource, FirestoreSDK } from "@owlprotocol/crud-firebase";
import { TypeOf, expectType } from "ts-expect";
import { z } from "zod";

export interface TelegramUserId {
    userId: string;
}
export const telegramUserIdZod = z
    .union([z.string(), z.object({ userId: z.string() })])
    .transform((arg) => (typeof arg === "string" ? arg : arg.userId));
export const encodeTelegramUserId: (id: string | TelegramUserId) => string = telegramUserIdZod.parse;
export const decodeTelegramUserId: (id: string) => Required<TelegramUserId> = (id) => {
    return { userId: id };
};

export interface TelegramUserData {
    readonly telegramId: number;
}
export const telegramUserDataZod = z
    .object({
        telegramId: z.number(),
    })
    .describe("user");
export const encodeTelegramUserData: (data: TelegramUserData) => TelegramUserData = telegramUserDataZod.parse;
export const encodeTelegramUserDataPartial: (data: Partial<TelegramUserData>) => Partial<TelegramUserData> =
    telegramUserDataZod.partial().parse;

export const userZod = telegramUserDataZod.extend({ userId: z.string().describe("user id") });

export type TelegramUser = Required<TelegramUserId> & TelegramUserData;
//Generic interfaces for resource, useful for writing logic that works both in firebase admin/web
export type TelegramUserResource = FirebaseResource<FirestoreSDK, TelegramUserData, TelegramUserId>;
//Generic interfaces for read resource, and group read resource (for subcollections)
export type TelegramUserQueryResource = FirebaseQueryResource<FirestoreSDK, TelegramUserData, TelegramUserId>;

//Check zod validator matches interface
expectType<TypeOf<TelegramUserData, z.input<typeof telegramUserDataZod>>>(true);
expectType<TypeOf<TelegramUserData, z.output<typeof telegramUserDataZod>>>(true);
