import { firestore, getColRef, getColGroupRef } from "@owlprotocol/crud-firebase/web";
import { itemCompositePath, itemPath, itemChildPath, itemChildGroupPath } from "../collections.js";
import { ItemData, ItemId } from "../models/Item.js";

export const itemCol = getColRef<ItemData>(firestore, itemPath);
export const itemCompositeCol = getColRef<ItemData>(firestore, itemCompositePath);

export const itemChildColGroup = getColGroupRef<ItemData>(firestore, itemChildGroupPath);
export const itemChildCol = (collectionId: Required<ItemId>) =>
    getColRef<ItemData>(firestore, itemChildPath(collectionId));
