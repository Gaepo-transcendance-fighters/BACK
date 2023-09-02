import { Module, forwardRef } from '@nestjs/common';
import { AuthGuard } from 'src/auth/auth.guard';
import { AuthModule } from 'src/auth/auth.module';
import { UsersModule } from 'src/users/users.module';
import { UsersService } from 'src/users/users.service';
import { InMemoryUsers } from 'src/users/users.provider';

@Module({
  imports: [forwardRef(() => AuthModule), UsersModule],
  providers: [AuthGuard, UsersService, InMemoryUsers],
  exports: [AuthGuard, UsersModule, InMemoryUsers],
})
export class SharedModule {}
