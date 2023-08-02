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
} from '@nestjs/common';
import { Response } from 'express';
import { UsersService } from './users.service';
import { CreateUsersDto } from './dto/create-users.dto';
import { AuthService, CLIENT_ID, redirectUri } from 'src/auth/auth.service';


@Controller()
export class UsersController {
  constructor(
    private usersService: UsersService,
    private authService: AuthService
    ) {}
    private logger: Logger = new Logger('UserController');
  // @Post('/auth')
  // signUp(
  //   @Body(ValidationPipe) createUsersDto: CreateUsersDto,
  // ): Promise<string> {
  //   const data = this.usersService.signUp(createUsersDto);

  //   if (data === null) {
  //     throw new BadRequestException('this is not unique intra');
  //   } 

  //   return data;
  // }

  // @Post('/auth/login')
  // signIn(
  //   @Body(ValidationPipe) createUsersDto: CreateUsersDto,
  // ): Promise<string> {
  //   return this.usersService.signIn(createUsersDto);
  // }
  
  
  @Post('auth')
  loginOauth(@Res() res: Response, ) {
    this.logger.log('loginOauth');
    return res.redirect(301, `http://localhost:4000/login/auth`); 
  }

  description: '42 login 후 전달 받은 code'
  
  @Get('login/auth')
  async codeCallback(@Res() res: Response, @Query('code') query: string): Promise<void> {
    this.logger.log('codeCallback');
    this.logger.log('query check: ',query);
    const intraInfo = await this.authService.getIntraInfo(query);
    const payload = await this.authService.getTokenInfo(intraInfo);
    res.cookie('token', this.authService.issueToken(payload));
    res.header('Cache-Control', 'no-store');

    return res.redirect(302, `localhost:3000/login`);
  }
}