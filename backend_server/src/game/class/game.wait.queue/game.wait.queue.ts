import { GamePlayer } from '../game.player/game.player';
import { GameOptions } from '../game.options/game.options';

export type WaitPlayerTuple = [GamePlayer, GameOptions];

export class GameWaitQueue {
  private waitPlayers: WaitPlayerTuple[];

  constructor() {
    this.waitPlayers = [];
  }

  public size(): number {
    return this.waitPlayers.length;
  }

  public pushPlayer(player: GamePlayer, options: GameOptions): number {
    this.waitPlayers.push([player, options]);
    return this.waitPlayers.length;
  }

  public popPlayer(userIdx: number): WaitPlayerTuple {
    for (let i = 0; i < this.waitPlayers.length; i++) {
      if (this.waitPlayers[i][0].userIdx === userIdx) {
        const ret: WaitPlayerTuple = this.waitPlayers[i];
        this.waitPlayers.splice(i);
        return ret;
      }
    }
  }
}
