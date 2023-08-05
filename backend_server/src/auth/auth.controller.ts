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
  import { AuthService, CLIENT_ID, redirectUri } from 'src/auth/auth.service';
  import { AuthGuard } from '@nestjs/passport';
  import { plainToClass } from 'class-transformer';
  import { UserObject } from '../users/entities/users.entity';
  
@Controller()
export class AuthController {
  constructor(
    private usersService: UsersService,
    private authService: AuthService
    ) {}
    private logger: Logger = new Logger('UserController');

    @Get('login/42')
    loginOauth(@Res() res) {
      this.logger.log('loginOauth');
      console.log("res: ",res);
      return res.redirect(302, `${redirectUri}`);
    }

    @Get('auth/callback')
    @UseGuards (AuthGuard('ft'))
    async codeCallback(@Req() req, @Res() res, @Query('code') query: string) {
    //   this.logger.log('codeCallback');
    //   this.logger.log('query check: ',query);
  
      const sendResponse = (res: Response, statusCode: number, data: any) => {
        res.status(statusCode).json(data);
      };
      res.header('Cache-Control', 'no-store');
    //   console.log('getUser', req.user);
      const user = req.user;
    //   console.log('User info from 42 API:', user);
      user.nickname = req.user.intra;
      const userDto = plainToClass(CreateUsersDto, user);
    //   console.log('userDto', userDto);
    const createdUser = await this.usersService.createUser(userDto);
    const jwtToken = await this.authService.createJwtToken(createdUser);
    await this.authService.saveToken(createdUser, jwtToken);
    //   console.log('createdUser', createdUser);
    //   console.log('redirect to localhost:3000/login');
    //   sendResponse(res, 200, createdUser)
    const accessToken = await this.authService.getAccessToken(query); // Access Token을 이용하여 사용자 정보를 가져오는 로직 추가
    
    try {
        
        const user = await this.authService.getUserInfo(accessToken);
        const jwtToken = await this.authService.createJwtToken(req.user);
        res.cookie('token', jwtToken, { httpOnly: true, secure: true, sameSite: 'none' });
        return res.redirect(302, `http://localhost:3000?id=${req.user.id}`);
      } catch (err) {
        // Handle errors
      }    
      return res.json({ createdUser, token: accessToken });
    }
  }