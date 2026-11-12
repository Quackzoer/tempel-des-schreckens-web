import type { LobbyStatus, BasePlayer } from "types";
import { Game } from "../game/game.ts";
import { MAX_PLAYERS, MIN_PLAYERS } from "../game/constants.ts";
export class Lobby {
  players: BasePlayer[] = [];
  lobbyStatus: LobbyStatus = "Waiting";
  // TODO set to game class
  game?: Game;
  constructor(
    public name: string,
    public hostPlayer: BasePlayer,
    public password?: string,
  ) {}
  addPlayer(player: BasePlayer) {
    if (this.lobbyStatus !== "Waiting")
      throw new Error("Can't add player while game is in progress");
    if (this.players.some((p) => p.id === player.id))
      throw new Error("Player already in the lobby");
    if (this.players.length === MAX_PLAYERS) throw new Error("Lobby is full");
    this.players.push(player);
  }
  removePlayer(playerId: string) {
    if (!this.players.some((p) => p.id === playerId)) throw new Error("Player not found");
    if (this.lobbyStatus !== "Waiting") throw new Error("Can't remove the player during game");
    if (this.hostPlayer.id === playerId && this.players.length > 1) {
      this.hostPlayer = this.players.find((p) => p.id !== this.hostPlayer.id)!;
    }
    this.players = this.players.filter((p) => p.id === playerId);
  }
  startGame() {
    if (this.lobbyStatus !== "Waiting") throw new Error("Game already started");
    if (this.players.length < MIN_PLAYERS) throw new Error("Not enough players");
    this.lobbyStatus = "In Progress";
    this.game = new Game(this.players);
  }
}
