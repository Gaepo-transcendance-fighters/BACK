import { GameRecord } from 'src/entity/gameRecord.entity';
import { UserObject } from 'src/entity/users.entity';
import { GamePlayer } from '../game.player/game.player';
import { GameSpeed, GameType, MapNumber } from 'src/game/enum/game.type.enum';
import { GameOptionDto } from 'src/game/dto/game.option.dto';
import { Vector } from 'src/game/enum/game.vector.enum';
import { GameChannel } from 'src/entity/gameChannel.entity';
import { GameData } from 'src/game/enum/game.data.enum';
import { FrameData, Fps } from 'src/game/enum/frame.data.enum';
import { KeyPress } from 'src/game/class/key.press/key.press';
import { Animations } from 'src/game/class/animation/animation';
import { GamePhase } from 'src/game/enum/game.phase';

/**
 * 연산의 핵심. 간단한 데이터를 제외하곤 여기서 연산이 이루어 진다.
 */
export class GameRoom {
  roomId: string;
  intervalId: any;
  intervalPeriod: number;
  users: GamePlayer[];
  gameObj: GameData;
  latency: number[];
  latencyCnt: number[];
  animation: Animations;
  keyPress: KeyPress[];
  history: GameRecord[];
  channel: GameChannel;
  gamePhase: GamePhase;

  constructor(
    id: string,
    users: GamePlayer[],
    options: GameOptionDto,
    histories: GameRecord[],
    channel: GameChannel,
  ) {
    this.roomId = id;

    this.users = users;

    this.gameObj.gameType = options.gameType;
    this.gameObj.gameSpeed = options.speed;
    this.gameObj.gameMapNumber = options.mapNumber;
    this.gameObj.score1 = 0;
    this.gameObj.score2 = 0;
    this.gameObj.paddle1MinMax = [20, 20];
    this.gameObj.paddle2MinMax = [20, 20];

    this.latency = [];
    this.latencyCnt = [];

    this.animation = new Animations();

    this.keyPress[0] = new KeyPress();
    this.keyPress[1] = new KeyPress();

    this.history = histories;
    this.channel = channel;

    this.keyPress.map((item) => item.setMaxUnit(100));

    this.gamePhase = GamePhase.MAKE_ROOM;
  }

  // 게임을 초기화한다.
  public setNewGame() {
    // this.gamePhase = GamePhase.SET_NEW_GAME;
    this.resetBall();
    this.resetPaddle();
    this.setRandomStandardCoordinates();
    this.setNewLinearEquation();
    // TODO: 애니메이션 객체를 새롭게 만들어야 하는가?
    //
  }

  public resetBall() {
    this.gameObj.currentPosX = 0;
    this.gameObj.currentPosY = 0;
  }

  public resetPaddle() {
    this.gameObj.paddle1 = 0;
    this.gameObj.paddle2 = 0;
  }

  public setLatency(latency: number): number {
    this.animation.setMaxFps(latency);
    const maxFps = this.animation.getMaxFps();
    if (maxFps == 60) this.intervalPeriod = 15;
    else if (maxFps == 30) this.intervalPeriod = 30;
    else if (maxFps == 24) this.intervalPeriod = 40;
    else this.intervalPeriod = 100;
    this.keyPress.map((data) => data.setPressedNumberByMaxFps(maxFps));
    return maxFps;
  }

  public setIntervalId(id: any) {
    this.intervalId = id;
  }

  public getIntervalId(): any {
    return this.intervalId;
  }

  public stopInterval() {
    clearInterval(this.intervalId);
  }

  public getMaxFps(): number {
    if (this.animation.maxFps === null) return -1;
    return this.animation.maxFps;
  }

  public getIntervalMs(): number {
    return this.intervalPeriod;
  }

  public keyPressed(userIdx: number, value: number) {
    if (this.users[0].getUserObject().userIdx === userIdx) {
      this.keyPress[0].pushKey(value);
    } else if (this.users[1].getUserObject().userIdx === userIdx) {
      this.keyPress[1].pushKey(value);
    }
  }

  public getNextFrame(): FrameData {
    this.gamePhase = this.animation.makeFrame(this.gameObj, this.keyPress);
    return this.animation.currentDatas;
  }

  public setRandomStandardCoordinates() {
    this.gameObj.currentPosX = 0;
    this.gameObj.currentPosY = 0;
    this.gameObj.standardX = this.getRandomInt(-2, 2);
    this.gameObj.standardY = this.getRandomInt(-2, 2);
    let up = true;
    let right = true;
    this.gameObj.vector = null;

    if (this.gameObj.standardX < 0) right = false;
    if (this.gameObj.standardY < 0) up = false;

    if (right == true && up == true) {
      this.gameObj.vector = Vector.UPRIGHT;
    } else if (right == true && up == false) {
      this.gameObj.vector = Vector.DOWNRIGHT;
    } else if (right == false && up == true) {
      this.gameObj.vector = Vector.UPLEFT;
    } else {
      this.gameObj.vector = Vector.DWONLEFT;
    }
  }

  public setNewLinearEquation() {
    this.gameObj.angle =
      (this.gameObj.standardY - 0) / (this.gameObj.standardX - 0);
    this.gameObj.yIntercept =
      this.gameObj.standardY - this.gameObj.angle * this.gameObj.standardX;
  }

  public getRandomInt(min: number, max: number): number {
    let randomValue = Math.floor(Math.random() * (max - min + 1)) + min;
    if (randomValue == 0) randomValue = 1;
    return randomValue;
  }

  public getGamePhase(): GamePhase {
    return this.gamePhase;
  }

  public setGamePhase(value: GamePhase): GamePhase {
    this.gamePhase = value;
    return this.gamePhase;
  }

  public scoreStatus(): GamePhase {
    return this.gamePhase;
  }

  public getCurrentFrame(): FrameData {
    return this.animation.currentDatas;
  }
}
