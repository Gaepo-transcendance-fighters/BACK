import {
  Controller,
  Post,
  Get,
  Headers,
  Res,
  Req,
  Query,
  Redirect,
  Body,
  UseGuards,
  Logger,
  Header,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { AuthGuard } from 'src/auth/auth.guard';
import { apiUid, LoginService, redirectUri } from './login.service';
import { IntraInfoDto } from 'src/users/dto/user.dto';
import { UsersService } from 'src/users/users.service';
import { CreateCertificateDto } from 'src/auth/dto/auth.dto';
import { plainToClass } from 'class-transformer';
import { CertificateObject } from 'src/users/entity/certificate.entity';
import { UserObject } from 'src/users/entity/users.entity';


@Controller()
export class LoginController {
  constructor(
    private readonly loginService: LoginService,
    private readonly usersService: UsersService,
    ) { }

  private logger: Logger = new Logger('LoginController');
  @Get('login/42')
  @Redirect(
    `${process.env.REDIRECT_URI}`,
    301,
  )
  loginOauth() {
    this.logger.log('loginOauth');
    
    return;
  }

  @Get('login/test')
  async test(@Body() body: any) {

    const date = body.date;
    console.log(`test : ${date}`);
    return date;

  }
  @Post('login/auth')
  async codeCallback(@Headers('authorization') authHeader: any, @Req() req:Request, @Res() res: Response, @Body() query: any) {
    console.log('codeCallback start : authHeader', authHeader);
    // if (!req.cookies.Authentication) {
      // console.log('codeCallback start : req.cookies', req.cookies);
    // }
    if (authHeader === undefined  || authHeader === null) {
      authHeader = req.cookies.Authentication;
      //

      // doesn't work res:any in case
    // this.logger.log(`authHeader Authorization : ${authHeader.Authorization}`);
    // this.logger.log(`authHeader Bearer : ${authHeader.token}, ${req.cookies.Authentication}`);
    // this.logger.log(`codeCallback req.cookies : ${req.cookies.token}`);
    // this.logger.log(`codeCallback req : ${req}`);
    // this.logger.log('res.cookie', res.cookie);
    // res.headers.authorization = `Authentication=${userData.token.token}; Path=/; HttpOnly; Max-Age=86400`;
    // this.logger.log(`check res.headers.cookie : ${res.headers.cookie}`);
    }

    this.logger.log('req.headers.authorization',req.headers.authorization);
    console.log("req.headers.authorization",req.headers.authorization);

    const userData: {token: string; user: any;} = {
      token: null,
      user: null,
    }
    let intraInfo: IntraInfoDto;
    let userDto: UserObject;
    this.logger.log('codeCallback start');
    this.logger.log(`codeCallback query : ${query.code}`);
    this.logger.log(`codeCallback res.headersSent : ${res.headersSent}`);
    // async (res:Response): Promise<void> => {
    //   const log = res.getHeaderNames().toString();
    //   this.logger.log(`codeCallback res.getHeaderNames : ${log}`)
    // };

    this.logger.log(`codeCallback req.headers.cookie : ${req.headers.cookie}`);
    this.logger.log(`codeCallback req.headers.authorization : ${req.headers.authorization}`); // find it out !
    this.logger.log(`codeCallback req.headers.Authorization_true, false : ${req.headers.Authorization !== undefined? true: false}`);
    this.logger.log(`codeCallback req.headers.cookie : ${req.headers.cookie}`);
    // this.logger.log(`codeCallback req.body.token : ${req.body.token}`);
    // this.logger.log(`codeCallback req.cookies.token : ${req.cookies.token}`);
    authHeader = req.headers.authorization.startsWith('Bearer') ? req.headers.authorization.split(' ')[1] : req.headers.authorization;
    if (authHeader === "null" || authHeader === "undefined" ) {
      this.logger.log('codeCallback authHeader null');
      intraInfo = await this.loginService.getIntraInfo(query.code);
    } else {
    this.logger.log(`codeCallback authHeader : ${authHeader}`);
    userDto = await this.usersService.validateUser(authHeader);
    this.logger.log(`codeCallback userDto :`);
    console.log(userDto);            

    // { userIdx, intra, imgUri, accessToken, email }
    intraInfo.imgUri = userDto.imgUri;
    intraInfo.accessToken = userDto.certificate.token;
    intraInfo.email = intraInfo.email;
    this.logger.log(`1 codeCallback intraInfo : `);
    
    console.log("1 codeCallback intraInfo",intraInfo);
    }
    const userInfo = await this.loginService.getUserInfo(intraInfo);
    console.log("2 codeCallback userInfo",userInfo.accessToken);
    // const token = await this.loginService.issueToken(userInfo.id, userInfo.check2Auth);
    userData.user = await this.usersService.findOneUser(userInfo.id);
    
    userData.token = userInfo.accessToken;
    if (userData.token === authHeader) {
      console.log('codeCallback userData.token === authHeader : true');
    }
    // const createdCertificateDto: CreateCertificateDto = {token:userInfo.accessToken, check2Auth: false, email: intraInfo.email, userIdx: userInfo.id};
    // userData.token = await this.usersService.saveToken(createdCertificateDto);
    this.logger.log(`check userData.token.token isExist : ${authHeader}`); 
    this.logger.log('codeCallback end accessToken', userInfo.accessToken);
    
    // this.logger.log(`res.header : \n${res.header}`); // just function
    // this.logger.log(`res.headers : ${res.headers}`); // [res.headers : undefined]
    // this.logger.log('res.headers.cookie', res.headers.cookie);
    // this.logger.log(`res.headers.authorization :  ${res.headers.authorization}`);
    // this.logger.log(`res.body : ${res.body}`); // [res.body : undefined]
    res.cookie('Authentication', userData.token, { httpOnly: true, path: '*'});
    res.setHeader('Authorization', `Bearer ${userData.token}`);
    
    // resp.cookie('token', userData.token.token, { httpOnly: true, path: '/' });
    // resp.set({'code': userInfo.accessToken});

    // res.set('code', userInfo.accessToken);
    
    console.log("success");
    
    return res.status(200).json(userData);
  }

  @Post('logout')
  @Header('Set-Cookie', 'Authentication=; Path=/; HttpOnly; Max-Age=0')
  logout() {
    this.logger.log('logout');
    return { message: '로그아웃 되었습니다.' };
  }

}
