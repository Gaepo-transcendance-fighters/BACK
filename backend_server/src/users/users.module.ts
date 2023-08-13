import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { TypeOrmExModule } from '../typeorm-ex.module';
import { UserObjectRepository } from './users.repository';
import { BlockListRepository } from './blockList.repository';
import { FriendListRepository } from './friendList.repository';
import { CertificateRepository } from './certificate.repository';
import { DMChannelRepository } from 'src/chat/DM.repository';

// @Global()
@Module({
  imports: [
    TypeOrmExModule.forCustomRepository([
      UserObjectRepository,
      BlockListRepository,
      FriendListRepository,
      CertificateRepository,
      DMChannelRepository,
    ]),
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService, TypeOrmExModule],
})
export class UsersModule {}
