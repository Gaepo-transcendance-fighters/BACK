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
} from '@nestjs/common';
import { Response, Request } from 'express';
import { AuthGuard } from 'src/auth/auth.guard';
import { apiUid, LoginService, redirectUri } from './login.service';


@Controller()
export class LoginController {
  constructor(private readonly loginService: LoginService) { }

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

  @Post('login/auth')
  async codeCallback(@Req() req:Request, @Res() res: Response, @Body() query: any) {
    this.logger.log('codeCallback start');
    this.logger.log('codeCallback query', query.code);
    this.logger.log('codeCallback req', req);
    const intraInfo = await this.loginService.getIntraInfo(query.code);
    // const payload = await this.loginService.getTokenInfo(intraInfo);
    res.cookie('token', 
    { sameSite: 'none' }
    // this.loginService.issueToken(payload)
    );

    return res.redirect(301, `localhost:3000/login?token=${intraInfo.userIdx}`);
  }
}
