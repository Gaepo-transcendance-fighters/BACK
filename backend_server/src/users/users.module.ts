import { Module, forwardRef } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { TypeOrmExModule } from '../typeorm-ex.module';
import { UserObjectRepository } from './users.repository';
import { BlockListRepository } from './blockList.repository';
import { FriendListRepository } from './friendList.repository';
import { CertificateRepository } from './certificate.repository';
import { HttpModule } from '@nestjs/axios';
import { JwtModule } from '@nestjs/jwt';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    TypeOrmExModule.forCustomRepository([
      UserObjectRepository,
      BlockListRepository,
      FriendListRepository,
      CertificateRepository,
    ]),
    HttpModule,
    JwtModule,
    forwardRef(() => AuthModule),
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
