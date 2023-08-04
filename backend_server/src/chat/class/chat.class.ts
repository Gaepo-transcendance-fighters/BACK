import { Socket } from 'socket.io';
import { Channel } from './channel.class';
import { UserObject } from 'src/users/entities/users.entity';

interface SocketObject {
  socket: Socket;
  user: UserObject;
}

interface Message {
  sender: string;
  msg: string;
}
export interface MessageInfo {
  message: Message[];
  userIdx1: number;
  userIdx2: number;
  userNickname1: string;
  userNickname2: string;
  channelIdx: number;
}

export class Chat {
  /******************************* 변수 *******************************/
  private protectedChannels: Channel[];
  private socektList: SocketObject[];
  static idxForSetChannelIdx = 0;

  /******************************* 메서드 *******************************/
  constructor() {
    this.protectedChannels = [];
    this.socektList = [];
  }

  // getter
  get getProtectedChannels(): Channel[] {
    return this.protectedChannels;
  }
  get getSocketList(): SocketObject[] {
    return this.socektList;
  }

  // setter
  set setProtectedChannels(protectedChannel: Channel) {
    this.protectedChannels.push(protectedChannel);
  }
  // setSocketList(setSocketObject(socket: Socket, user: UserObject): SocketObject))
  set setSocketList(SocketObject: SocketObject) {
    this.socektList.push(SocketObject);
  }
  // TODO: socketID 저장?
  setSocketObject(socket: Socket, user: UserObject): SocketObject {
    const socketObject = { socket, user };
    return socketObject;
  }

  // TODO: test 필요
  removeSocketObject(socketObject: SocketObject): void {
    const socketIdx = this.socektList.findIndex(
      (client) => client.user.nickname === socketObject.user.nickname,
    );
    if (socketIdx !== -1) {
      this.socektList.splice(socketIdx, 1);
    }
  }

  // method
  // FIXME: 여기서는 protected 와 private 을 한번에 처리. channelIdx 으로 삭제하기 때문에.
  removeChannel(channelIdx: number): void {
    // TODO: 실패 시 빈배열 반환이 어떤 걸 의미하는지 찾아보기.
    const protectedChannelIdx = this.protectedChannels.findIndex(
      (channel) => channel.getChannelIdx === channelIdx,
    );
    if (protectedChannelIdx !== -1) {
      this.protectedChannels.splice(protectedChannelIdx, 1);
    }
  }
}
