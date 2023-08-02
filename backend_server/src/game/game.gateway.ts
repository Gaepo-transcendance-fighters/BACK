import { SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';

@WebSocketGateway({cors: {
  origin: ['http://localhost:3000'],
},})
export class GameGateway { 
  @SubscribeMessage('message')
  handleMessage(client: any, payload: any): string {
    return 'Hello world!';
  }
}
