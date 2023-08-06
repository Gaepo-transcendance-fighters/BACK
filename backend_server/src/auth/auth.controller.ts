import {
    Controller,
    ValidationPipe,
    Post,
    Body,
    Req,
    BadRequestException,
    Redirect,
    Get,
    Res,
    Query,
    Logger,
    UseGuards,
    Headers,
    HttpStatus,
  } from '@nestjs/common';
  import { Response } from 'express';
  import { UsersService } from '../users/users.service';
  import { CreateUsersDto } from '../users/dto/create-users.dto';
  import { AuthService } from 'src/auth/auth.service';
import { FortyTwoAuthGuard } from './auth.guard';
  
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService
    ) {}
    private logger: Logger = new Logger('AuthController');

    @Get('42')
    @UseGuards(FortyTwoAuthGuard)
    loginOauth(@Req() req: any) {
      this.logger.log("42 call : ",req);
    }

    @Get('callback')
    @UseGuards (FortyTwoAuthGuard)
    codeCallback(@Req() req: any): {message: string; user: any} {
      this.logger.log("callback call : ",req);
      this.logger.log("callback call : ",req.user);
      
      return this.authService.authLogin(req.user);
    }
  }