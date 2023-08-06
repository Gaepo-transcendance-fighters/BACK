import { HttpException, HttpStatus, Injectable, 
    Logger, } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import * as jwt from 'jsonwebtoken';
import * as dotenv from 'dotenv';
import { JwtPayloadDto } from 'src/auth/dto/auth.dto';

import { CreateUsersDto } from 'src/users/dto/create-users.dto';
import { IntraInfoDto } from 'src/users/dto/user.dto';
import { UserObject } from 'src/users/entities/users.entity';
import { UsersService } from 'src/users/users.service';

dotenv.config({
  path:
    process.env.NODE_ENV === 'dev' ? '/dev.backend.env' : '/prod.backend.env',
});

export const redirectUri = process.env.REDIRECT_URI;
export const apiUid = process.env.CLIENT_ID;
const apiSecret = process.env.CLIENT_SECRET;
const jwtSecret = process.env.JWT_SECRET;
const intraApiTokenUri = 'https://api.intra.42.fr/oauth/token';
const intraApiMyInfoUri = 'https://api.intra.42.fr/v2/me';

@Injectable()
export class LoginService {
  constructor(
    private readonly httpService: HttpService,
    private readonly usersService: UsersService,
  ) {}
  private logger: Logger = new Logger('LoginService');

  async getIntraInfo(code: string): Promise<IntraInfoDto> {
    this.logger.log(`getIntraInfo: code=${code}`)
    const params = new URLSearchParams();
    params.set('grant_type', 'authorization_code');
    params.set('client_id', process.env.CLIENT_ID);
    params.set('client_secret', process.env.CLIENT_SECRET);
    params.set('code', code);
    params.set('redirect_uri', process.env.FRONT_CALLBACK_URI);

    const tokens = await lastValueFrom(
      this.httpService.post(intraApiTokenUri, params),
    );

    this.logger.log('getIntraInfo: tokens', tokens.data);
    const userInfo = await lastValueFrom(
      this.httpService.get(intraApiMyInfoUri, {
        headers: {
          Authorization: `Bearer ${tokens.data.access_token}`,
        },
      }),
    );

    this.logger.log('getIntraInfo: userInfo', userInfo.data.id, userInfo.data.image.versions.small);

    return {
      userIdx: userInfo.data.id,
      imgUri: userInfo.data.image.versions.small,
    };
  }

  

  issueToken(payload: JwtPayloadDto) {
    return jwt.sign(payload, jwtSecret);
  }



  async getTokenInfo(intraInfo: IntraInfoDto): Promise<JwtPayloadDto> {
    const { userIdx, imgUri } = intraInfo;
    let user: UserObject | CreateUsersDto = await this.usersService.findOneUser(userIdx);
    if (user == null) {
      const displayName =
      userIdx === 98324
          ? 'unknown'
          : Math.random().toString(36).substring(2, 11);
      const newUser: CreateUsersDto = {
        userIdx,
        intra: user.intra,
        nickname : user.nickname,
        imgUri: imgUri,
        
      };
      user = newUser;
    }

    return {
      id: user.userIdx,
      check2Auth: true,
    };
  }
}