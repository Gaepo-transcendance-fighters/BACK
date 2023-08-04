import { HttpService } from "@nestjs/axios";
import { Injectable } from "@nestjs/common";
import { lastValueFrom } from 'rxjs';
import * as dotenv from 'dotenv';
import * as jwt from 'jsonwebtoken';
import { IntraInfoDto, JwtPayloadDto } from "./dto/auth.dto";
import { UserObject } from "src/users/entities/users.entity";
import { UsersService } from "src/users/users.service";
import { CreateUsersDto } from "src/users/dto/create-users.dto";
import { check } from "prettier";

dotenv.config({
    path:
      process.env.NODE_ENV === 'dev' ? '/dev.backend.env' : '/prod.backend.env',
  });
  

//   export const redirectUri = CALLBACK_URL || process.env.CALLBACK_URL;  
  export const clientId = CLIENT_ID || process.env.CLIENT_ID;
  const clientSecret = CLIENT_SECRET || process.env.CLIENT_SECRET;
  const jwtSecret = process.env.JWT_SECRET;
  const apiTokenUri = 'https://api.intra.42.fr/oauth/token';
  const apiMyInfoUri = 'https://api.intra.42.fr/v2/me';

  
@Injectable()
export class AuthService {
  constructor(
    private readonly httpService: HttpService,
    private readonly userService: UsersService,
  ) {}

  async getIntraInfo(code: string): Promise<IntraInfoDto> {
    console.log('getIntraInfo Init', code);
    const params = new URLSearchParams();
    params.set('grant_type', 'authorization_code');
    params.set('client_id', clientId);
    params.set('client_secret', clientSecret);
    params.set('code', code);
    params.set('redirect_uri', redirectUri);

    console.log('parames ready, http POST start');
    const tokens = await lastValueFrom(
      this.httpService.post(apiTokenUri, params),
    );
    console.log('http POST success with token');

    console.log('http GET before check tokens', tokens);
    const userInfo = await lastValueFrom(
      this.httpService.get(apiMyInfoUri, {
        headers: {
          Authorization: `Bearer ${tokens.data.access_token}`,
        },
      }),
    );
    console.log(userInfo.data.login, userInfo.data.image.versions.small);
    return {
      userIdx : userInfo.data.id,
      imgUri: userInfo.data.image.versions.small,
    };
  }
  async getTokenInfo(intraInfo: IntraInfoDto): Promise<JwtPayloadDto> {
    const { userIdx, imgUri } = intraInfo;
    let user: UserObject | CreateUsersDto = await this.userService.findOneUser(userIdx);
    if (user == null) {
      const newUser: CreateUsersDto = {
        userIdx: userIdx,
        intra: 'test',
        nickname: 'test',
        imgUri: imgUri,
      };
      this.userService.createUser(newUser);
    //   await this.downloadProfileImg(intraInfo);
     
    }
    return { id: user.userIdx, check2Auth: false };
  }
  issueToken(payload: JwtPayloadDto) {
    return jwt.sign(payload, jwtSecret);
  }
}