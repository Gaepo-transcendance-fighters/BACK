import { FrameData } from 'src/game/enum/frame.data.enum';
import { GamePhase } from 'src/game/enum/game.phase';
import { KeyPress } from '../key.press/key.press';
import { GameData } from 'src/game/enum/game.data.enum';
import { Vector } from 'src/game/enum/game.vector.enum';
import { GameRoom } from '../game.room/game.room';

export class Animations {
  private readonly MAX_WIDTH = 500;
  private readonly min_WIDTH = -500;
  private readonly MAX_HEIGHT = 300;
  private readonly min_HEIGHT = -300;
  private readonly PADDLE_LINE_1 = -470;
  private readonly PADDLE_LINE_2 = 470;

  prevDatas: FrameData | null;
  currentDatas: FrameData | null;
  gameStatus: GamePhase;
  maxFps: number;
  currentFps: number;
  totalDistancePerSec: number;
  unitDistance: number;

  constructor() {
    this.prevDatas = {
		ballX: 0,
  		ballY: 0,
 		paddle1: 0,
  		paddle2: 0,
  		maxFrameRate: 0,
  		currentFrame: 0,
	};
	this.currentDatas = {
		ballX: 0,
  		ballY: 0,
 		paddle1: 0,
  		paddle2: 0,
  		maxFrameRate: 0,
  		currentFrame: 0,
	};
    this.maxFps = 0;
    this.currentFps = 0;
    this.totalDistancePerSec = 50;
    this.gameStatus = GamePhase.ON_PLAYING;
  }

  // 레이턴시를 가지고 최대 FPS를 확정짓는다.
  public setMaxFps(latency: number) {
    if (this.maxFps === null) this.maxFps = 0;
	console.log(`latency : ${latency}`)
    if (latency < 8) {
      this.maxFps = 60;
    } else if (latency >= 8 && latency < 15) {
      this.maxFps = 30;
    } else if (latency >= 15 && latency < 20) {
      this.maxFps = 24;
    } else if (latency >= 20 && latency < 50) {
      this.maxFps = 10;
    }
    this.unitDistance = parseFloat(
      (this.totalDistancePerSec / this.maxFps).toFixed(2),
    );
  }

  // getter FPS
  public getMaxFps(): number | null {
    return this.maxFps;
  }

  private setPaddleNotOverLimit(
    currentData: GameData,
    paddle1: number,
    paddle2: number,
  ) {
    currentData.paddle1MaxMin = [
      (currentData.paddle1MaxMin[0] += paddle1),
      (currentData.paddle1MaxMin[1] += paddle1),
    ];
    if (currentData.paddle1 > 0) {
      // 패들 좌표 수정
      if (currentData.paddle1MaxMin[0] >= this.MAX_HEIGHT) {
        currentData.paddle1 = this.MAX_HEIGHT - 20;
        currentData.paddle1MaxMin[0] = this.MAX_HEIGHT;
        currentData.paddle1MaxMin[1] = this.MAX_HEIGHT - 40;
      }
    } else {
      if (currentData.paddle1MaxMin[1] <= this.min_HEIGHT) {
        currentData.paddle1 = this.min_HEIGHT + 20;
        currentData.paddle1MaxMin[0] = this.min_HEIGHT + 40;
        currentData.paddle1MaxMin[1] = this.min_HEIGHT;
      }
    }
    currentData.paddle2MaxMin = [
      (currentData.paddle2MaxMin[0] += paddle2),
      (currentData.paddle2MaxMin[1] += paddle2),
    ];
    if (currentData.paddle2 > 0) {
      // 패들 좌표 수정
      if (currentData.paddle2MaxMin[0] >= this.MAX_HEIGHT) {
        currentData.paddle2 = this.MAX_HEIGHT - 20;
        currentData.paddle2MaxMin[0] = this.MAX_HEIGHT;
        currentData.paddle2MaxMin[1] = this.MAX_HEIGHT - 40;
      }
    } else {
      if (currentData.paddle2MaxMin[1] <= this.min_HEIGHT) {
        currentData.paddle2 = this.min_HEIGHT + 20;
        currentData.paddle2MaxMin[0] = this.min_HEIGHT + 40;
        currentData.paddle2MaxMin[1] = this.min_HEIGHT;
      }
    }
  }

  // 기존 데이터를 기반으로 다음 프레임 연산을 진행한다.
  public makeFrame(currentData: GameData, key: KeyPress[], room: GameRoom): GamePhase {
    // 기존 데이터 이관
    if (room.animation.currentDatas != null) {
      room.animation.prevDatas = room.animation.currentDatas;
    //   room.animation.currentDatas = null;
    }
	// console.log(`current data : ${room.animation.currentDatas}`);
	room.animation.currentDatas.ballX = currentData.currentPosX;
	room.animation.currentDatas.ballY = currentData.currentPosY;
	room.animation.currentDatas.paddle1 = currentData.paddle1;
	room.animation.currentDatas.paddle2 = currentData.paddle2;
	room.animation.currentDatas.currentFrame = room.animation.prevDatas.currentFrame
	room.animation.currentDatas.maxFrameRate = room.animation.prevDatas.maxFrameRate


    // 좌표 계산
    const nextX = parseFloat(
      (currentData.currentPosX + room.animation.unitDistance).toFixed(2),
    );
    const nextY = parseFloat(
      // y = ax + b, a, b의 값을 미리 설정
      (currentData.angle * nextX + currentData.yIntercept).toFixed(2),
    );
	console.log(`next X : ${nextX}`);
	console.log(`next Y : ${nextY}`);
	console.log(`angle : ${currentData.angle}`);
	console.log(`YUntercept : ${currentData.yIntercept}`);


    // 페들 데이터 바꿈
    const paddle1 = room.animation.currentDatas.paddle1 + key[0].popKeyValue();
    const paddle2 = room.animation.currentDatas.paddle2 + key[1].popKeyValue();

    // 프레임 값 갱신
    currentData.currentPosX = nextX;
    currentData.currentPosY = nextY;

    // 프레임 값 갱신 #2 paddle 최대, 최소 값 정리
    room.animation.setPaddleNotOverLimit(currentData, paddle1, paddle2);

    currentData.paddle1 = paddle1;
    currentData.paddle2 = paddle2;

    // 현재 게임 상태 갱신
	console.log(`room fps : ${room.animation.maxFps}`);
    if (room.animation.currentFps + 1 <= room.animation.maxFps)
      room.animation.currentFps = 1;
    else {
      room.animation.currentFps += 1;
    }
	room.animation.currentDatas.ballX = nextX;
	room.animation.currentDatas.ballY = nextY;
	room.animation.currentDatas.paddle1 = paddle1;
	room.animation.currentDatas.paddle2 = paddle2;
	room.animation.currentDatas.currentFrame = room.animation.currentFps;
	room.animation.currentDatas.maxFrameRate = room.animation.maxFps;

	console.log(`frame data - ball X: ${room.animation.currentDatas.ballX}`);
	console.log(`frame data - ball Y: ${room.animation.currentDatas.ballY}`);
	console.log(`frame data - paddle 1 : ${room.animation.currentDatas.paddle1}`);
	console.log(`frame data - paddle 2 : ${room.animation.currentDatas.paddle2}`);
	console.log(`frame data - curent Frame: ${room.animation.currentDatas.currentFrame}`);

    const type = room.animation.checkStrike(currentData, this);
    if (type.length === 2 || type.length === 3) {
      const cond1 = type.find((vec) => vec === GamePhase.HIT_THE_WALL);
      const cond2 = type.find((vec) => vec === GamePhase.HIT_THE_PADDLE);
      const cond3 = type.find((vec) => vec === GamePhase.HIT_THE_GOAL_POST);
      if (
        cond1 === GamePhase.HIT_THE_WALL &&
        cond2 === GamePhase.HIT_THE_PADDLE
      ) {
        room.animation.handleSituationWallAndPaddleStrike(currentData);
        room.animation.gameStatus = GamePhase.HIT_THE_PADDLE;
        return room.animation.gameStatus;
      } else if (
        cond1 === GamePhase.HIT_THE_WALL &&
        cond3 === GamePhase.HIT_THE_GOAL_POST
      ) {
        room.animation.gameStatus =
          room.animation.handleSituationWallAndGoalPostStrike(currentData);
        return room.animation.gameStatus;
      }
      // TODO: 조건 두개 이상
    } else {
      if (type[0] === GamePhase.HIT_THE_WALL) {
        room.animation.handleSituationWallStrike(currentData);
        room.animation.gameStatus = GamePhase.HIT_THE_WALL;
        return room.animation.gameStatus;
      } else if (type[0] === GamePhase.HIT_THE_PADDLE) {
        room.animation.handleSituationPaddleStrike(currentData);
        room.animation.gameStatus = GamePhase.HIT_THE_PADDLE;
        return room.animation.gameStatus;
      } else if (type[0] === GamePhase.HIT_THE_GOAL_POST) {
        room.animation.gameStatus = room.animation.handleSituationGoalPostStrike(currentData);
        return room.animation.gameStatus;
      }
      // TODO: 조건 한개 처리
    }
    room.animation.gameStatus = GamePhase.ON_PLAYING;
    return room.animation.gameStatus;
  }

  private reverseVectorY(currentData: GameData) {
    currentData.standardY *= -1;
    if (currentData.vector === Vector.UPLEFT) {
      currentData.vector = Vector.DOWNLEFT;
    } else if (currentData.vector === Vector.DOWNLEFT) {
      currentData.vector = Vector.UPLEFT;
    } else if (currentData.vector === Vector.UPRIGHT) {
      currentData.vector = Vector.DOWNRIGHT;
    } else {
      currentData.vector = Vector.DOWNRIGHT;
    }
  }

  private reverseVectorX(currentData: GameData) {
    if (currentData.vector === Vector.UPLEFT) {
      currentData.vector = Vector.UPRIGHT;
    } else if (currentData.vector === Vector.DOWNLEFT) {
      currentData.vector = Vector.DOWNRIGHT;
    } else if (currentData.vector === Vector.UPRIGHT) {
      currentData.vector = Vector.UPLEFT;
    } else {
      currentData.vector = Vector.DOWNLEFT;
    }
  }

  public handleSituationWallStrike(currentData: GameData) {
    this.reverseVectorY(currentData);
    this.setNewlinearEquation(currentData);
    return;
  }

  private changeAngleForPaddle(currentData: GameData) {
    switch (currentData.vector) {
      case Vector.UPLEFT:
        if (currentData.standardX === -1 && currentData.standardY === 2) {
          currentData.standardX = 2;
          currentData.standardY = 1;
        } else if (
          currentData.standardX === -1 &&
          currentData.standardY == -1
        ) {
          currentData.standardX = 1;
          currentData.standardY = 1;
        } else {
          currentData.standardX = 1;
          currentData.standardY = 2;
        }
        break;
      case Vector.UPRIGHT:
        if (currentData.standardX === 1 && currentData.standardY === 2) {
          currentData.standardX = -2;
          currentData.standardY = 1;
        } else if (currentData.standardX === 1 && currentData.standardY === 1) {
          currentData.standardX = -1;
          currentData.standardY = 1;
        } else {
          currentData.standardX = -1;
          currentData.standardY = 2;
        }
        break;
      case Vector.DOWNLEFT:
        if (currentData.standardX === -2 && currentData.standardY === -1) {
          currentData.standardX = 1;
          currentData.standardY = -2;
        } else if (
          currentData.standardX === -1 &&
          currentData.standardY === -1
        ) {
          currentData.standardX = 1;
          currentData.standardY = -1;
        } else {
          currentData.standardX = 2;
          currentData.standardY = -1;
        }
        break;
      case Vector.DOWNRIGHT:
        if (currentData.standardX === 1 && currentData.standardY === -2) {
          currentData.standardX = -2;
          currentData.standardY = -1;
        } else if (
          currentData.standardX === 1 &&
          currentData.standardY === -1
        ) {
          currentData.standardX = -1;
          currentData.standardY = -1;
        } else {
          currentData.standardX = -1;
          currentData.standardY = -2;
        }
        break;
    }
  }

  public handleSituationPaddleStrike(currentData: GameData) {
    const type: Vector = currentData.vector;
    if (type === Vector.DOWNLEFT || type === Vector.UPLEFT) {
      this.reverseVectorX(currentData);
      const y = currentData.currentPosY;
      const maxY = currentData.paddle1MaxMin[0];
      const minY = currentData.paddle1MaxMin[1];
      const rangeSize = Math.round((maxY - minY + 1) / 3);
      if (y > maxY - rangeSize) {
        //상단
        this.changeAngleForPaddle(currentData);
      } else if (y >= minY + rangeSize && y <= maxY - rangeSize) {
        //중간
        currentData.standardX *= -1;
      } else {
        //하단
        this.changeAngleForPaddle(currentData);
      }
    } else {
      this.reverseVectorX(currentData);
      const y = currentData.currentPosY;
      const maxY = currentData.paddle2MaxMin[0];
      const minY = currentData.paddle2MaxMin[1];
      const rangeSize = Math.round((maxY - minY + 1) / 3);
      if (y > maxY - rangeSize) {
        //상단
        this.changeAngleForPaddle(currentData);
      } else if (y >= minY + rangeSize && y <= maxY - rangeSize) {
        //중간
        currentData.standardX *= -1;
      } else {
        //하단
        this.changeAngleForPaddle(currentData);
      }
    }
    this.setNewlinearEquation(currentData);
  }

  public handleSituationGoalPostStrike(currentData: GameData): GamePhase {
    const type = currentData.vector;
    if (type === Vector.UPLEFT || type === Vector.DOWNLEFT) {
      currentData.score2++;
      if (currentData.score2 === 5) {
        const ret: GamePhase = GamePhase.MATCH_END;
        return ret;
      }
      const ret: GamePhase = GamePhase.HIT_THE_GOAL_POST;
      return ret;
    } else {
      currentData.score1++;
      if (currentData.score1 === 5) {
        const ret: GamePhase = GamePhase.MATCH_END;
        return ret;
      }
      const ret: GamePhase = GamePhase.HIT_THE_GOAL_POST;
      return ret;
    }
  }

  public handleSituationWallAndPaddleStrike(currentData: GameData) {
    this.handleSituationWallStrike(currentData);
    this.handleSituationPaddleStrike(currentData);
  }

  public handleSituationWallAndGoalPostStrike(
    currentData: GameData,
  ): GamePhase {
    const ret: GamePhase = GamePhase.MATCH_END;
    return ret;
  }

  public setNewlinearEquation(currentData: GameData) {
    currentData.angle =
      (currentData.standardY - 0) / (currentData.standardX - 0);
    currentData.yIntercept =
      currentData.standardY - currentData.angle * currentData.standardX;
  }

  // paddle에 부딪히는지 여부 판단
  private checkPaddleStrike(vector: Vector, currentData: GameData): boolean {
    let condition1;
    let condition2;
    if (vector === Vector.UPLEFT || vector === Vector.DOWNLEFT) {
      const max = currentData.currentPosY + 20;
      const min = currentData.currentPosY - 20;
      condition1 =
        max <= currentData.paddle1MaxMin[0] ||
        currentData.paddle1MaxMin[1] <= min;
      condition2 =
        min >= currentData.paddle1MaxMin[1] ||
        currentData.paddle1MaxMin[0] >= max;
    } else {
      const max = currentData.currentPosY + 20;
      const min = currentData.currentPosY - 20;
      condition1 =
        max <= currentData.paddle2MaxMin[0] ||
        currentData.paddle2MaxMin[1] <= min;
      condition2 =
        min >= currentData.paddle2MaxMin[1] ||
        currentData.paddle2MaxMin[0] >= max;
    }
    return condition1 || condition2;
  }

  // 벽에 부딪히는지를 판단한다.
  public checkStrike(currentData: GameData, aniData:Animations): GamePhase[] {
    const ret: GamePhase[] = [];
    switch (currentData.vector) {
      case Vector.UPLEFT:
        // 벽에 부딪히는지를 확인
        if (currentData.currentPosY + 20 >= aniData.MAX_HEIGHT) {
          currentData.currentPosY = 280;
          ret.push(GamePhase.HIT_THE_WALL);
        }
        // 패들 라인에 들어가는지 검증하고, 이럴 경우 패들 부딪힘 여부 판단
        if (currentData.currentPosX - 20 <= aniData.PADDLE_LINE_1) {
          if (aniData.checkPaddleStrike(Vector.UPLEFT, currentData)) {
            currentData.currentPosX = aniData.PADDLE_LINE_1;
            ret.push(GamePhase.HIT_THE_PADDLE);
          }
        }
        // 골대 라인에 부딪히는지 확인
        if (currentData.currentPosX - 20 <= aniData.min_WIDTH) {
          currentData.currentPosX = aniData.min_WIDTH;
          ret.push(GamePhase.HIT_THE_GOAL_POST);
        }
        break;
      case Vector.UPRIGHT:
        // 벽에 부딪히는지를 확인
        if (currentData.currentPosY + 20 >= aniData.MAX_HEIGHT) {
          currentData.currentPosY = 280;
          ret.push(GamePhase.HIT_THE_WALL);
        }
        // 패들 라인에 들어가는지 검증하고, 이럴 경우 패들 부딪힘 여부 판단
        if (currentData.currentPosX + 20 >= aniData.PADDLE_LINE_2) {
          if (aniData.checkPaddleStrike(Vector.UPRIGHT, currentData)) {
            currentData.currentPosX = aniData.PADDLE_LINE_2;
            ret.push(GamePhase.HIT_THE_PADDLE);
          }
        }
        // 골대 라인에 부딪히는지 확인
        if (currentData.currentPosX + 20 >= aniData.MAX_WIDTH) {
          currentData.currentPosX = aniData.MAX_WIDTH;
          ret.push(GamePhase.HIT_THE_GOAL_POST);
        }
        break;
      case Vector.DOWNLEFT:
        // 벽에 부딪히는지를 확인
        if (currentData.currentPosY + 20 <= aniData.min_HEIGHT) {
          currentData.currentPosY = -280;
          ret.push(GamePhase.HIT_THE_WALL);
        }
        // 패들 라인에 들어가는지 검증하고, 이럴 경우 패들 부딪힘 여부 판단
        if (currentData.currentPosX - 20 <= aniData.PADDLE_LINE_1) {
          if (aniData.checkPaddleStrike(Vector.DOWNLEFT, currentData)) {
            currentData.currentPosX = aniData.PADDLE_LINE_1;
            ret.push(GamePhase.HIT_THE_PADDLE);
          }
        }
        // 골대 라인에 부딪히는지 확인
        if (currentData.currentPosX - 20 <= aniData.min_WIDTH) {
          currentData.currentPosX = aniData.min_WIDTH;
          ret.push(GamePhase.HIT_THE_GOAL_POST);
        }
        break;
      case Vector.DOWNRIGHT:
        // 벽에 부딪히는지를 확인
        if (currentData.currentPosY + 20 <= aniData.min_HEIGHT) {
          currentData.currentPosY = -280;
          ret.push(GamePhase.HIT_THE_WALL);
        }
        // 패들 라인에 들어가는지 검증하고, 이럴 경우 패들 부딪힘 여부 판단
        if (currentData.currentPosX + 20 >= aniData.PADDLE_LINE_2) {
          if (aniData.checkPaddleStrike(Vector.DOWNRIGHT, currentData)) {
            currentData.currentPosX = aniData.PADDLE_LINE_2;
            ret.push(GamePhase.HIT_THE_PADDLE);
          }
        }
        // 골대 라인에 부딪히는지 확인
        if (currentData.currentPosX + 20 >= aniData.MAX_WIDTH) {
          currentData.currentPosX = aniData.MAX_WIDTH;
          ret.push(GamePhase.HIT_THE_GOAL_POST);
        }
        break;
    }
    return ret;
  }

  //   // 벡터 방향을 바꾼다.
  //   public changeVector(currentData: GameData) {
  //     if (this.gameStatus === GamePhase.HIT_THE_WALL) {
  //       currentData.standardY *= -1;
  //     } else if (this.gameStatus === GamePhase.HIT_THE_PADDLE) {
  //       // TODO: paddle 보정으로 어떻게 바뀌는지 체크해야함
  //     }
  //   }
}
