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
import { IntraInfoDto } from 'src/users/dto/user.dto';
import { UsersService } from 'src/users/users.service';


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

  @Post('login/auth')
  async codeCallback(@Req() req:Request, @Res() res: Response, @Body() query: any){
    const userData: {message: string; user: any;} = {
      message: "",
      user: null,
    }
    this.logger.log('codeCallback start');
    this.logger.log('codeCallback query', query.code);
    this.logger.log('codeCallback req', req);
    const intraInfo = await this.loginService.getIntraInfo(query.code);
    const payload = await this.loginService.getTokenInfo(intraInfo);
    res.cookie('token', this.loginService.issueToken(payload));
    res.header('Cache-Control', 'no-store');
    this.logger.log('codeCallback end');
    return res.redirect(301, `${process.env.FRONTEND_URI}/login`);
  }
}
