import { getFirebaseResourceReactQueryOptions } from "@owlprotocol/crud-firebase/query";
import { telegramUserResource } from "../web/resources.js";
import { telegramUserPath } from "../collections.js";

/*** Collection Queries ***/
export const telegramUserQueryOptions = getFirebaseResourceReactQueryOptions(telegramUserResource, {
    prefixPath: [],
    collectionGroup: telegramUserPath,
});
