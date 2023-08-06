import { Module, forwardRef } from '@nestjs/common';
import { UsersModule } from 'src/users/users.module';
import { AuthService } from './auth.service';
import { HttpModule } from '@nestjs/axios';
import { FtStrategy } from './auth.strategy';
import { AuthController } from './auth.controller';
@Module({
  imports: [
    forwardRef(() => UsersModule),
    HttpModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, FtStrategy,],
  exports: [AuthService, FtStrategy],
})
export class AuthModule {}
