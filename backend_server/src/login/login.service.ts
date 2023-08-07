import { HttpException, HttpStatus, Injectable, 
    Logger, } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import * as jwt from 'jsonwebtoken';
import * as dotenv from 'dotenv';
import { JwtPayloadDto } from 'src/auth/dto/auth.dto';
import { IntraInfoDto } from 'src/users/dto/user.dto';
import { CreateUsersDto } from 'src/users/dto/create-users.dto';

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
export const intraApiTokenUri = 'https://api.intra.42.fr/oauth/token';
const intraApiMyInfoUri = 'https://api.intra.42.fr/v2/me';

@Injectable()
export class LoginService {
  constructor(
    private readonly httpService: HttpService,
    private readonly usersService: UsersService,
  ) {}
  private logger: Logger = new Logger('LoginService');

  async getIntraInfo(code: string): Promise<IntraInfoDto> {

    // 여기에 헤더 bearder 가 존재하는지 확인하는 코드가 필요함
    /* https://api.intra.42.fr/oauth/token?grant_type=authorization_code&client_id=${client_id}&client_secret=${client_secret}&code=${code}&redirect_uri=${redirect_uri} */
    this.logger.log(`getIntraInfo start: code= \n${code}`)
    const params = new URLSearchParams();
    params.set('grant_type', 'authorization_code');
    params.set('client_id', process.env.CLIENT_ID);
    params.set('client_secret', process.env.CLIENT_SECRET);
    params.set('code', code);
    params.set('redirect_uri', process.env.FRONT_CALLBACK_URI);
    
    const tokens = await lastValueFrom(
      this.httpService.post(intraApiTokenUri, params)
    );

    this.logger.log(`getIntraInfo : token.data.headers= ${tokens.data.headers}`);
    const userInfo = await lastValueFrom(
      this.httpService.get(intraApiMyInfoUri, {
        headers: {
          Authorization: `Bearer ${tokens.data.access_token}`,
        },
      }),
    );
    // httpService.get() 메서드 안에서 headers: Authorization 이 존재하는지 확인하는 코드가 필요함
    
    this.logger.log(`getIntraInfo: userInfo : ${userInfo.data.id}, ${userInfo.data.image.versions.small}`);
    
    return {
      userIdx: userInfo.data.id,
      intra: userInfo.data.login,
      img: userInfo.data.image.versions.small,
      accessToken : tokens.data.access_token,
      email: userInfo.data.email,
    };
  }

  
  

  async issueToken(payload: JwtPayloadDto) {
    const paytoken = jwt.sign(payload, jwtSecret);
    
    this.logger.log('paytoken', paytoken);
    return paytoken;
  }
  
  
  


  async getUserInfo(intraInfo: IntraInfoDto): Promise<JwtPayloadDto> {
    this.logger.log('getUserInfo start');
    /* 
    userIdx: number;
    intra: string;
    img: string;
    accessToken: string;
    email: string; 
    */
  //  const dto = new CreateUsersDto(id, username, username, image );
    // const intrainfoDto = new IntraInfoDto( userIdx, intra, img, accessToken, email );
    const { userIdx, intra, img, accessToken, email } = intraInfo;
    this.logger.log(`getUserInfo : ${userIdx}, ${intra}, ${img}, ${accessToken}, ${email}`);
    let user: UserObject | CreateUsersDto = await this.usersService.findOneUser(userIdx);
    if (user === null || user === undefined) {
      const newUser: CreateUsersDto = {
        userIdx : userIdx,
        intra: intra,
        nickname : intra,
        img: img,
        certificate: null,
        email: null,
      };
      const savedtoken = await this.usersService.saveToken({
        token: accessToken,
        check2Auth: false,
        email: email,
        userIdx: userIdx,
      });
      this.logger.log(`saveToken called : ${savedtoken}`);
      newUser.certificate = savedtoken;
      user = await this.usersService.createUser(newUser);
      this.logger.log('createUser called');
      
    }

    return {
      id: user.userIdx,
      check2Auth: false,
      accessToken: accessToken,
    };
  }
}