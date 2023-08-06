import { Module, forwardRef } from '@nestjs/common';
import { UsersModule } from 'src/users/users.module';
import { AuthService } from './auth.service';
import { HttpModule } from '@nestjs/axios';
@Module({
  imports: [
    forwardRef(() => UsersModule),
    HttpModule,
  ],
  providers: [AuthService, ],
  exports: [AuthService, ],
})
export class AuthModule {}
