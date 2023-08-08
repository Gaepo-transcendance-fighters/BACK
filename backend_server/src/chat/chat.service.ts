import { Injectable, Logger } from '@nestjs/common';
import { Channel } from './class/channel.class';
import { Chat } from './class/chat.class';
import { Socket } from 'socket.io';
import { error } from 'console';
import { DataSource } from 'typeorm';
import { UserObject } from 'src/users/entity/users.entity';
import { DMChannel, DirectMessage, Mode } from './entities/chat.entity';
import { DMChannelRepository, DirectMessageRepository } from './DM.repository';
import { SendDMDto } from './dto/send-dm.dto';
import { chatCreateRoomReqDto, chatCreateRoomResDto } from './dto/chat.dto';

@Injectable()
export class ChatService {
  constructor(
    private chat: Chat,
    private dataSource: DataSource,
    private dmChannelRepository: DMChannelRepository,
    private directMessagesRepository: DirectMessageRepository,
  ) {}
  private logger: Logger = new Logger('ChatService');
  
  // TODO: 에러처리 catch ~ throw
  // FIXME: Error 객체반환하는거 맞는지 확인해야함
  enterChatRoom(
    client: Socket,
    clientData: any,
    channel: Channel,
  ): any | Error {
    // // 비밀번호 확인
    if (channel.getPassword !== null) {
      if (channel.getPassword !== clientData.password) {
        this.logger.log(`[ 💬 Socket API ] 'chat_enter _ Wrong_password`);
        return new error('Please check your password');
      }
    }
    this.logger.log(
      `[ 💬 Socket API ] enterChatRomm _ roomId: ${channel.getRoomId}`,
    );
    client.join(`Room${channel.getRoomId.toString()}`);
    channel.setMember = [clientData.nickname];
    // API: MAIN_CHAT_3
    client
      .to(`Room${channel.getRoomId.toString()}`)
      .emit('chat_enter_noti', clientData.nickname);
    this.logger.log(
      `[ 💬 Socket API ] ${clientData.nickname} Success enterChatRomm _ roomId: ${channel.getRoomId}`,
    );
    return {
      member: channel.getMember,
      channelIdx: channel.getChannelIdx,
    };
  }

  // API: MAIN_CHAT_5
  createPublicChatRoom(req: chatCreateRoomReqDto): chatCreateRoomResDto {
    const channel = new Channel();
    channel.setChannelIdx = Chat.idxForSetChannelIdx;
    channel.setRoomId = Chat.idxForSetChannelIdx;
    channel.setPassword = null;
    channel.setMember = ["wochae"];
    channel.setMode = Mode.PUBLIC;
    channel.setMessage = null;    
    channel.setOwner = req.nickname;
    channel.setAdmin = "";
    console.log("channel", channel);
    this.chat.setProtectedChannels = channel;
    return {
      member: channel.getMember,
      channelIdx: channel.getChannelIdx,
      password: false
    };
  }
  createProtectedChatRoom(req: chatCreateRoomReqDto): chatCreateRoomResDto {
    const channel = new Channel();
    channel.setChannelIdx = Chat.idxForSetChannelIdx;
    channel.setRoomId = Chat.idxForSetChannelIdx++;
    channel.setPassword = "pw";
    channel.setMember = ["wochae"];
    channel.setMode = Mode.PROTECTED;
    channel.setMessage = null;    
    channel.setOwner = req.nickname;
    channel.setAdmin = "wochae";
    
    this.chat.setProtectedChannels = channel;
    return {
      member: channel.getMember,
      channelIdx: channel.getChannelIdx,
      password: true
    };
  }

  /********************* check Room Member & client *********************/
  checkAlreadyInRoom(clientData: any): boolean {
    // find() 사용
    const channel = this.findChannelByRoomId(clientData.roomId);
    // if (channel == null) {
    //   return false;
    // }
    return channel.getMember.flat().find((member) => {
      return member === clientData.nickname;
    });
    // Set 사용
    // const channel = this.findChannelByRoomId(clientData.roomId);
    // const membersSet = new Set(channel.getMember.flat());
    // console.log(membersSet);
    // return membersSet.has(clientData.nickname);
  }

  /***************************** Find Channel *****************************/
  // TODO: 아래 세가지 함수로 하나로 합치는게 좋을까? 논의 필요
  // 합치게 되면, 반환되는 채널이 어떤 채널인지 구분할 수 있는 방법이 필요함.
  findChannelByRoomId(roomId: number): Channel {
    this.logger.log(
      `[ 💬 Socket API ] findChannelByRoomId _ roomId: ${roomId}`,
    );
    const protectedChannel: Channel = this.chat.getProtectedChannels.find(
      (channel) => channel.getRoomId === roomId,
    );
    const privateChannel: Channel = this.chat.getPrivateChannels.find(
      (channel) => channel.getRoomId === roomId,
    );
    return protectedChannel || privateChannel || null;
  }

  findProtectedChannelByRoomId(roomId: number): Channel {
    this.logger.log(
      `[ 💬 Socket API ] findChannelByRoomId _ roomId: ${roomId}`,
    );
    const protectedChannel: Channel = this.chat.getProtectedChannels.find(
      (channel) => channel.getRoomId === roomId,
    );
    if (protectedChannel == undefined || protectedChannel.getPassword == null) {
      return null;
    }
    return protectedChannel;
  }

  findPublicChannelByRoomId(roomId: number): Channel {
    this.logger.log(
      `[ 💬 Socket API ] findChannelByRoomId _ roomId: ${roomId}`,
    );
    const publicChannel: Channel = this.chat.getProtectedChannels.find(
      (channel) => channel.getRoomId === roomId,
    );
    if (publicChannel == undefined || publicChannel.getPassword != null) {
      return null;
    }
    return publicChannel;
  }

  findPrivateChannelByRoomId(roomId: number): Channel {
    this.logger.log(
      `[ 💬 Socket API ] findChannelByRoomId _ roomId: ${roomId}`,
    );
    const privateChannel = this.chat.getPrivateChannels.find(
      (channel) => channel.getRoomId === roomId,
    );
    if (privateChannel == undefined) {
      return null;
    }
    return privateChannel;
  }

  async createDmChannel(
    client: UserObject,
    target: UserObject,
    channelIdx: number,
    msg: SendDMDto,
  ): Promise<boolean> {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    let ret = true;
    const list = await this.dmChannelRepository.createChannel(
      client,
      target,
      channelIdx,
    );
    const firstDM = await this.directMessagesRepository.sendDm(
      msg,
      client,
      channelIdx,
    );

    await this.directMessagesRepository.save(firstDM);

    try {
      await queryRunner.manager.save(list[0]);
      await queryRunner.manager.save(list[1]);

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      ret = false;
    } finally {
      await queryRunner.release();
    }
    return ret;
  }
}
