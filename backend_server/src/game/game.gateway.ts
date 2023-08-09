import {
  SubscribeMessage,
  WebSocketGateway,
  ConnectedSocket,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
  MessageBody,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { GameService } from './game.service';

import { ReturnMsgDto } from './dto/error.message.dto';
import { Logger, UseFilters } from '@nestjs/common';
import { WsExceptionFilter } from 'src/ws.exception.filter';
import { UsersService } from 'src/users/users.service';
import { GameOnlineMember } from './class/game.online.member/game.online.member';
import { GameOptionDto } from './dto/game.option.dto';
import { GameOptions } from './class/game.options/game.options';
import { GameRegiDto } from './dto/game.regi.dto';
import { GameLatencyGetDto } from './dto/game.latency.get.dto';

@WebSocketGateway({
  namespace: 'game',
  cors: {
    origin: ['http://localhost:3001'],
  },
})
@UseFilters(new WsExceptionFilter())
export class GameGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(
    private readonly gameService: GameService,
    private readonly usersService: UsersService,
  ) {}

  @WebSocketServer()
  server: Server;

  private logger: Logger = new Logger('GameGateway');

  handleDisconnect(client: Socket) {
    const userId: number = parseInt(
      client.handshake.query.userId as string,
      10,
    );
    // 게임 중에 있는지 파악하기
    // 게임 판정 승 로직 추가
    // 종료 시키기
    this.logger.log(userId + ' is disconnected');
  }

  async handleConnection(client: Socket) {
    const userId: number = parseInt(
      client.handshake.query.userId as string,
      10,
    );
    const date = Date.now();
    this.logger.log(`시작 일시 : ${date}`);
    this.logger.log(userId + ' is connected');
    const user = await this.usersService.getUserObjectFromDB(userId);
    this.logger.log(user.nickname);
    const OnUser = new GameOnlineMember(user, client);
    this.logger.log(OnUser.user.nickname);
    this.gameService.pushOnlineUser(OnUser).then((data) => {
      if (data === -1) {
        client.disconnect(true);
        return;
      }
      this.logger.log('현재 접속 자 : ' + data);
    });
  }

  afterInit(server: any) {
    this.logger.log('[ 🎮 Game ] Initialized!');
  }

  @SubscribeMessage('game_option')
  async sendGameOption(
    @ConnectedSocket() client: Socket,
    @MessageBody() options: GameOptionDto,
  ): Promise<ReturnMsgDto> {
    // await this.logger.log(`options is here : ${options.userIdx}`);
    const condition = this.gameService.sizeWaitPlayer();
    const after = this.gameService.setWaitPlayer(
      options.userIdx,
      new GameOptions(options.gameType, options.speed, options.mapNumber),
    );
    // this.gameService.checkStatus('game option start');
    if (after !== condition) {
      client.emit('game_option', options);
      return new ReturnMsgDto(200, 'OK!');
    } else return new ReturnMsgDto(501, 'setting error');
  }

  @SubscribeMessage('game_queue_regist')
  async putInQueue(
    @MessageBody() regiData: GameRegiDto,
  ): Promise<ReturnMsgDto> {
    const { userIdx, queueDate } = regiData;
    // this.gameService.checkStatus('game queue regist #1');
    // this.logger.log('여기까지 데이터 들어옴 : ', userIdx, queueDate);
    const roomNumber = await this.gameService.putInQueue(userIdx);
    // this.gameService.checkStatus('game queue regist #2');
    if (roomNumber == -1) return new ReturnMsgDto(400, 'Bad Request');
    else if (roomNumber === null) {
      //   this.logger.log('대기상태');
      return new ReturnMsgDto(200, 'Plz, Wait queue');
    } else if (roomNumber >= 0) {
      //   this.logger.log(`룸 작성 성공`);
      await this.gameService.setRoomToDB(roomNumber).then(() => {
        this.gameService.getReadyFirst(roomNumber, this.server);
        this.gameService.getReadySecond(roomNumber, this.server);
        return new ReturnMsgDto(200, 'OK!');
      });
    }
    // this.logger.log(`user: ${userIdx} - regi date : ${queueDate}`);
    // 세팅 상태를 파악하고
    // 넣어야 할 큐에 집어 넣기
    // 2명 채워지면 game_queue_success
    //	//	룸 생성으로 조인 시키기
    //  // 게임 준비 1차 전달
    //	//	// 게임 준비 2차 전달
    // 아니면 대기 상태로 빠짐
  }

  //   @SubscribeMessage('game_queue_success')
  //   sendQueueSuccess(): ReturnMsgDto {
  //     return new ReturnMsgDto(200, 'OK!');
  //   }

  @SubscribeMessage('game_queue_quit')
  cancleQueue(): ReturnMsgDto {
    // userIdx로 파악
    // 큐 안에 해당 대상 파악하기
    // 큐 안에 대상 삭제하기, 데이터 지우기
    // 해당 유저 커넥션 끊기
    return new ReturnMsgDto(200, 'OK!');
  }

  //   @SubscribeMessage('game_ready_first')
  //   readyFirstStep(): ReturnMsgDto {
  //     return new ReturnMsgDto(200, 'OK!');
  //   }

  //   @SubscribeMessage('game_ready_second')
  //   readySecondStep(): ReturnMsgDto {
  //     return new ReturnMsgDto(200, 'OK!');
  //   }

  @SubscribeMessage('game_ready_second_answer')
  async getLatency(
    @MessageBody() latencyData: GameLatencyGetDto,
  ): Promise<ReturnMsgDto> {
    const { userIdx, serverDateTime, clientDateTime } = latencyData;
    this.logger.log(`second answer: ${userIdx}`);
    const room = this.gameService.getRoomByUserIdx(userIdx);
    this.logger.log(`second answer: ${room.roomId}`);
    if (room === null) return new ReturnMsgDto(400, 'Bad Request');
    const latency = clientDateTime - serverDateTime;
    this.logger.log(`second answer: ${latency}`);
    if (this.gameService.setLatency(userIdx, room.roomId, latency)) {
      this.gameService.getReadyFinal(userIdx, this.server);
    }

    // 내용 전달 받기
    // 레이턴시 작성 #1
    //	// 일단 저장후 대기
    // 레이턴시 작성 #2
    //	// game_ready_final로 최종 내용 전달
    //	//	// 레이턴시 고려한 게임 시작
    return new ReturnMsgDto(200, 'OK!');
  }

  //   @SubscribeMessage('game_ready_final')
  //   sendFinalInfo(): ReturnMsgDto {
  //     return new ReturnMsgDto(200, 'OK!');
  //   }

  //   @SubscribeMessage('game_ready_start')
  //   startGame(): ReturnMsgDto {
  //     return new ReturnMsgDto(200, 'OK!');
  //   }

  @SubscribeMessage('game_predict_ball')
  async sendBallPrediction(): Promise<ReturnMsgDto> {
    // 공 부딪힌 시점 #1
    // 공 부딪힌 시점 #2
    //	// 공 예측 알고리즘으로 들어가기
    return new ReturnMsgDto(200, 'OK!');
  }

  @SubscribeMessage('game_move_paddle')
  async sendPaddleToTarget(): Promise<ReturnMsgDto> {
    // 누군지 파악하기
    // 해당 룸 상대방 소켓으로 전달하기
    return new ReturnMsgDto(200, 'OK!');
  }

  @SubscribeMessage('game_pause_score')
  async pauseAndNextGame(): Promise<ReturnMsgDto> {
    // 점수를 탄 내용 전달 받음 #1
    // 점수를 탄 내용 전달 받음 #2
    //	// 두개의 정보 판단 후
    //	//	// DB 저장 요청
    //	//	//	// 5점 득점 여부 판단
    //	//	//	//	// 아닐 경우 레이턴시 전달만 재 진행 (레이턴시 세컨드 엔서 api 로 간다)
    //	//	//	//	// 게임 종료 api 전달
    return new ReturnMsgDto(200, 'OK!');
  }

  //   @SubscribeMessage('game_get_score')
  //   endMatch(): ReturnMsgDto {
  //     return new ReturnMsgDto(200, 'OK!');
  //   }

  @SubscribeMessage('game_switch_to_chat')
  exitGame(@ConnectedSocket() client: Socket): ReturnMsgDto {
    // DB 설정 변경 필요
    const userIdx = parseInt(client.handshake.query.userId as string);
    this.gameService
      .popOnlineUser(userIdx)
      .then((data) => this.logger.log(data));
    return new ReturnMsgDto(200, 'OK!');
  }
}
