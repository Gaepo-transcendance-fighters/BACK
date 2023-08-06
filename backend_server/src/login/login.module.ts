import { Module } from '@nestjs/common';
import { LoginService } from './login.service';
import { LoginController } from './login.controller';
import { HttpModule } from '@nestjs/axios';
import { AuthModule } from 'src/auth/auth.module';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [HttpModule, AuthModule, UsersModule],
  controllers: [LoginController],
  providers: [LoginService],
})
export class LoginModule {}
