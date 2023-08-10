
import { Socket } from 'socket.io';
import { UserObject } from 'src/users/entity/users.entity';

export class GameOnlineMember {
  userSocket: Socket;
  user: UserObject;

  constructor(user: UserObject, socket: Socket) {
    this.user = user;
    this.userSocket = socket;
  }
}
