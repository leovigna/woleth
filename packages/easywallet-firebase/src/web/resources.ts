import { firestore, getFirebaseResource } from "@owlprotocol/crud-firebase/web";
import { telegramUserCol } from "./collection.js";
import {
    TelegramUserData,
    TelegramUserId,
    decodeTelegramUserId,
    encodeTelegramUserData,
    encodeTelegramUserDataPartial,
    encodeTelegramUserId,
} from "../models/index.js";

/**
 * To keep patterns consistent, top-level collections are still functions
 * but we have them be a constant result to avoid unecessary gc.
 * */
export const telegramUserResource = getFirebaseResource<TelegramUserData, TelegramUserId>(firestore, telegramUserCol, {
    encodeId: encodeTelegramUserId,
    decodeId: decodeTelegramUserId,
    encodeDataPartial: encodeTelegramUserDataPartial,
    encodeData: encodeTelegramUserData,
});
