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
import { UserObject } from './entities/users.entity';


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


  
  
  // @Post('auth')
  // loginOauth(@Res() res: Response, ) {
  //   this.logger.log('loginOauth');
  //   return res.redirect(302, `${redirectUri}`); 
  // }

  // description: '42 login 후 전달 받은 code'
  /* 

      this.logger.log('codeCallback');
    this.logger.log('query check: ',query);
    res.header('Cache-Control', 'no-store');
    // const { userIdx, intra, email, imgUri, accessToken, refreshToken } = req.user;
    // const intraInfo = await this.authService.getIntraInfo(query);

    // user.userIdx = req.user.userIdx;
    // const payload = await this.authService.getTokenInfo({userIdx, imgUri});
    // res.cookie('token', this.authService.issueToken(payload));
    

    // return res.redirect(302, `localhost:3000/login`);
    // const { userIdx, username, email, image} = user;
    // const dto = new CreateUsersDto(id, username, username, image );
    
    const sendResponse = (res: Response, statusCode: number, data: any) => {
      res.status(statusCode).json(data);
    };
    console.log('getUser', req.user);
    const user = req.user;
    user.userIdx = req.user.userIdx;
    user.nickname = req.user.intra;
    // const { userIdx, username, email, image} = user;
    // const dto = new CreateUsersDto(id, username, username, image );
    const userDto = plainToClass(CreateUsersDto, user);
    console.log('userDto', userDto);
    const createdUser = await this.usersService.createUser(userDto)
    res.cookie('token', req.user.accessToken, {httpOnly: true, sameSite: 'none'});
    
    sendResponse(res, 200, createdUser)
    console.log('createdUser', createdUser);
    return res.redirect(302, `http://localhost:3000`, );
  }
  */
/*

  @Get('auth/42')
  @UseGuards(AuthGuard('ft'))
  ftLogin(res: Response) {
    
    res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.header('Access-Control-Allow-Headers', '*');
    res.header('Access-Control-Allow-Credentials', 'true');
     // cors 때문에 넣은거긴 해
  }

  @Get('auth/login')
  @UseGuards(AuthGuard('ft'))
  async getUser(@Req() req, @Res() res): Promise<UserObject> {
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
  */
}