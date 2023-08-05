import { Module, forwardRef } from '@nestjs/common';
import { UsersModule } from 'src/users/users.module';
import { AuthService } from './auth.service';
import { HttpModule } from '@nestjs/axios';
import { FtStrategy } from './auth.strategy';
@Module({
  imports: [
    forwardRef(() => UsersModule),
    HttpModule,
  ],
  providers: [AuthService, FtStrategy],
  exports: [AuthService, FtStrategy],
})
export class AuthModule {}
