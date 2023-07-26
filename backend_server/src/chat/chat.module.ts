import { Logger, Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { Chat } from './class/chat.class';
import { Channel } from './class/channel.class';
import { Message } from './class/message.class';

@Module({
  // TODO: Member 와 관련된 것을 추가해야함
  providers: [ChatGateway, ChatService, Chat], // FIXME: Channel 은 어차피 Chat 으로 접근할거니까 필요 없겠지?
})
export class ChatModule {
  private logger: Logger = new Logger('ChatModule');
  constructor(private chat: Chat) {
    // FIXME: 테스트용 코드
    // TODO: enum 추가
    const channel1 = new Channel();
    const testMsg = new Message(1, 1, 'test');
    testMsg.setMsgDate = new Date();
    channel1.setChannelIdx = 1;
    channel1.setRoomId = 1;
    this.logger.log('[ 💬 TEST ] Test Chat Object Init!');
    channel1.setMode = 'public';
    channel1.setOwner = null;
    // channel1.setPassword = null;
    channel1.setPassword = '1234';
    channel1.setMessage = testMsg;
    channel1.setMember = ['jaekim'];
    this.chat.setProtectedChannels = channel1;

    console.log(this.chat.getProtectedChannels[0]);
  }
}
