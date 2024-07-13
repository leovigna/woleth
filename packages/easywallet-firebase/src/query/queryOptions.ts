import {
    getFirebaseQueryReactQueryOptions,
    getFirebaseResourceReactQueryOptions,
    Query,
} from "@owlprotocol/crud-firebase/query";
import { itemChildResource, itemResource } from "../web/resources.js";
import { itemChildGroupPath, itemPath } from "../collections.js";
import { ItemCompositeId, ItemData, ItemId, encodeItemId } from "../models/Item.js";
import { itemChildGroupQuery } from "../web/groupQueries.js";

/*** Collection Queries ***/
export const itemQueryOptions = getFirebaseResourceReactQueryOptions(itemResource, {
    prefixPath: [],
    collectionGroup: itemPath,
});

export const itemChildQueryOptions = getFirebaseResourceReactQueryOptions(itemChildResource, (collectionId: ItemId) => {
    return {
        prefixPath: [itemPath, encodeItemId(collectionId)],
        collectionGroup: itemChildGroupPath,
    };
});

/** Collection Group Queries */
export const itemChildGroupQueryOptions = getFirebaseQueryReactQueryOptions<
    ItemData,
    ItemCompositeId,
    Required<ItemId>,
    ItemData,
    ItemData,
    Query<"web", ItemData>
>(itemChildGroupQuery, { prefixPath: [], collectionGroup: itemChildGroupPath });
