import { Module, forwardRef } from '@nestjs/common';
import { UsersModule } from 'src/users/users.module';
import { AuthService } from './auth.service';
import { HttpModule } from '@nestjs/axios';
import { AuthGuard } from './auth.guard';
@Module({
  imports: [
    forwardRef(() => UsersModule),
    HttpModule,
  ],
  providers: [AuthService, AuthGuard],
  exports: [AuthService, AuthGuard],
})
export class AuthModule {}
