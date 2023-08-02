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
  
  @Get('auth')
  @Redirect(
    `https://api.intra.42.fr/oauth/authorize?client_id=${CLIENT_ID}&redirect_uri=${redirectUri}&response_type=code`,
    302,
  )
  loginOauth() {
    this.logger.log('loginOauth');
    
  }

  // description: '42 login 후 전달 받은 code'
  
  @Get('auth/login')
  async codeCallback(@Res() res: Response, @Query('code') query): Promise<void> {
    this.logger.log('codeCallback');
    const intraInfo = await this.authService.getIntraInfo(query);
    const payload = await this.authService.getTokenInfo(intraInfo);
    res.cookie('token', this.authService.issueToken(payload));
    res.header('Cache-Control', 'no-store');

    return res.redirect(302, `localhost:3000/login`);
  }
}