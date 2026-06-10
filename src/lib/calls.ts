/** Build a deterministic room id for a 1:1 call between two users. */
export function buildCallRoomId(userIdA: string, userIdB: string): string {
  return `call_${[userIdA, userIdB].sort().join("_")}`;
}

export const ICE_SERVERS: RTCIceServer[] = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun1.l.google.com:19302" },
];
