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
import { UsersService } from './users.service';
import { CreateUsersDto } from './dto/create-users.dto';
import { AuthService,} from 'src/auth/auth.service';
import { AuthGuard } from '@nestjs/passport';
import { plainToClass } from 'class-transformer';


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
  
  
  // @Post('auth')
  // loginOauth(@Res() res: Response, ) {
  //   this.logger.log('loginOauth');
  //   return res.redirect(302, `${redirectUri}`); 
  // }

  // description: '42 login 후 전달 받은 code'
  
  // @Get('auth/login/42/callback')
  // async codeCallback(@Res() res: Response, @Query('code') query: string): Promise<void> {
  //   this.logger.log('codeCallback');
  //   this.logger.log('query check: ',query);
  //   const intraInfo = await this.authService.getIntraInfo(query);
  //   const payload = await this.authService.getTokenInfo(intraInfo);
  //   res.cookie('token', this.authService.issueToken(payload));
  //   res.header('Cache-Control', 'no-store');
  //   console.log('redirect to localhost:3000/login');

  //   return res.redirect(302, `localhost:3000/login`);
  // }

  @Get('auth/42')
  @UseGuards(AuthGuard('ft'))
  ftLogin() {
    /*
    res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.header('Access-Control-Allow-Headers', '*');
    res.header('Access-Control-Allow-Credentials', 'true');
    */ // cors 때문에 넣은거긴 해
  }

  @Get('auth/login')
  @UseGuards(AuthGuard('ft'))
  async getUser(@Req() req, @Res() res: Response) {
    console.log('getUser', req.user);
    const user = req.user;
    user.userIdx = req.user.userIdx;
    user.nickname = req.user.intra;
    // const { userIdx, username, email, image} = user;
    // const dto = new CreateUsersDto(id, username, username, image );
    const userDto = plainToClass(CreateUsersDto, user);
    console.log('userDto', userDto);

    
    const createdUser = await this.usersService.createUser(userDto)
    
    // const credential  = await this.authService.issueToken(createdUser);
    console.log('createdUser', createdUser);
    console.log(req.user);
    return res.redirect(302, `http://localhost:3000/jwt/?token=${req.user.userIdx}`, );
  }
}