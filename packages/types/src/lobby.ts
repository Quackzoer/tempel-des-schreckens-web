import type { BasePlayer } from "./player.ts";

export const lobbyStatus = ["Waiting", "In Progress", "Ended"] as const;
export type LobbyStatus = (typeof lobbyStatus)[number];

export type Lobby = {
  lobbyName: string;
  hostPlayerId: string;
  lobbyStatus: LobbyStatus;
  players: BasePlayer[];
};
