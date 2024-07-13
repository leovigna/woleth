import { firestore, getColRef } from "@owlprotocol/crud-firebase/web";
import { telegramUserPath } from "../collections.js";
import { TelegramUserData } from "../models/TelegramUser.js";

export const telegramUserCol = getColRef<TelegramUserData>(firestore, telegramUserPath);
