//Network 10200
export const CIRCLES_V2 = "0x2066CDA98F98397185483aaB26A89445addD6740";

import { Hash } from "viem";
/**
 * Get a test bytes32 string (eg. hash)
 * @param n
 * @returns
 */
export function getBytes32(n: number | bigint): Hash {
    return ("0x" + n.toString(16).padStart(64, "0")) as Hash;
}

console.debug(getBytes32(1));
