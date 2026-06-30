"use client";

type PlayhtmlPlayerIdentity = {
  publicKey: string;
  name?: string;
  playerStyle: {
    colorPalette: string[];
    cursorStyle?: string;
  };
  discoveredSites?: string[];
  createdAt?: number;
};

const PLAYHTML_IDENTITY_STORAGE_KEY = "playhtml_player_identity";

let localPlayhtmlCursorIdentity: PlayhtmlPlayerIdentity | undefined;

export function getLocalPlayhtmlCursorIdentity():
  | PlayhtmlPlayerIdentity
  | undefined {
  if (typeof window === "undefined" || !isLocalhost()) {
    return undefined;
  }

  if (localPlayhtmlCursorIdentity) {
    return localPlayhtmlCursorIdentity;
  }

  const sharedIdentity = readIdentityFromStorage(
    window.localStorage,
    PLAYHTML_IDENTITY_STORAGE_KEY,
  );
  localPlayhtmlCursorIdentity = makeTabIdentity(sharedIdentity);

  return localPlayhtmlCursorIdentity;
}

function isLocalhost(): boolean {
  return ["localhost", "127.0.0.1", "::1"].includes(window.location.hostname);
}

function readIdentityFromStorage(
  storage: Storage,
  key: string,
): PlayhtmlPlayerIdentity | undefined {
  try {
    const value = storage.getItem(key);

    if (!value) {
      return undefined;
    }

    const parsed = JSON.parse(value) as PlayhtmlPlayerIdentity;

    return isValidIdentity(parsed) ? parsed : undefined;
  } catch {
    return undefined;
  }
}

function isValidIdentity(
  identity: PlayhtmlPlayerIdentity | null | undefined,
): identity is PlayhtmlPlayerIdentity {
  return Boolean(
    identity?.publicKey &&
      identity.playerStyle?.colorPalette?.[0],
  );
}

function makeTabIdentity(
  sharedIdentity: PlayhtmlPlayerIdentity | undefined,
): PlayhtmlPlayerIdentity {
  const publicKeyBase = sharedIdentity?.publicKey ?? randomId(16);

  return {
    ...sharedIdentity,
    publicKey: `${publicKeyBase}:tab:${randomId(10)}`,
    name: sharedIdentity?.name ?? "Local tab",
    playerStyle: {
      ...sharedIdentity?.playerStyle,
      colorPalette: [
        randomCursorColor(),
        ...(sharedIdentity?.playerStyle?.colorPalette?.slice(1) ?? []),
      ],
    },
    createdAt: Date.now(),
  };
}

function randomId(length: number): string {
  const values = new Uint8Array(length);
  crypto.getRandomValues(values);

  return Array.from(values, (value) => value.toString(16).padStart(2, "0"))
    .join("")
    .slice(0, length);
}

function randomCursorColor(): string {
  return `hsl(${Math.floor(Math.random() * 360)}, 70%, 45%)`;
}
