import { HttpService } from "@nestjs/axios";
import { ConflictException, ForbiddenException, Injectable } from "@nestjs/common";
import { firstValueFrom, lastValueFrom } from 'rxjs';
import * as dotenv from 'dotenv';
import { CreateCertificateDto, IntraInfoDto, JwtPayloadDto } from "./dto/auth.dto";
import { UserObject } from "src/users/entities/users.entity";
import { UsersService } from "src/users/users.service";
import { CreateUsersDto } from "src/users/dto/create-users.dto";
import { CertificateRepository } from "src/users/certificate.repository";
import { CertificateObject } from "src/users/entities/certificate.entity";


dotenv.config({
    path:
      process.env.NODE_ENV === 'dev' ? '/dev.backend.env' : '/prod.backend.env',
  });
  
  export const JWT_SECRET = process.env.JWT_SECRET;
  const apiTokenUri = 'https://api.intra.42.fr/oauth/token';
  const apiMyInfoUri = 'https://api.intra.42.fr/v2/me';

  
@Injectable()
export class AuthService {
  constructor(
    private readonly httpService: HttpService,
    private readonly userService: UsersService,          
  ) {}

  authLogin(req: any): {message: string; user: any} {
    const userData: {message: string; user: any;} = {
      message: "",
      user: null,
    }

    if (!req) {
      userData.message = 'No user from ft';
    }
    else {
      userData.message = 'User information from ft';
      userData.user = req.user;
    }
    return userData;
  }

  async getIntraInfo(code: string): Promise<IntraInfoDto> {
    console.log('getIntraInfo Init', code);
    const params = new URLSearchParams();
    params.set('grant_type', 'authorization_code');
    params.set('client_id', process.env.CLIENT_ID);
    params.set('client_secret', process.env.CLIENT_SECRET);
    params.set('code', code);
    params.set('redirect_uri', process.env.redirectUri);

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
  // issueToken(payload: JwtPayloadDto) {
  //   return jwt.sign(payload, jwtSecret);
  // }
  /*
  async createJwtToken(user: any, res: any): Promise<string> {
    const payload = { userIdx: user.userIdx, username: user.nickname }; // Customize the payload as per your needs
    const options = { expiresIn: '1d' }; // Token expiration time (1 day in this example)
    return jwt.sign(payload, this.JWT_SECRET, options);
  }
  */
  // async createJwtToken(user: any, res: any) {
  //   const payload = { username: user.nickname, sub: user.id };
  //   const access_token = this.jwtService.sign(payload);
  //   res.cookie('Authentication', access_token, {
  //     domain: `${process.env.DOMAIN_URL}`, // 현재 쿠키가 어떤 서버로 전송되어져야 하는지를 지정할 수 있는 속성
  //     path: '/', // 모든 경로에 대해 쿠키전달
  //     httpOnly: true, // XSS와 같은 공격이 차단
  //   });
  //   res.redirect(`${process.env.FRONT_URL}/nickname`);
  // }

  async getAccessToken(code: string): Promise<string> {
    const tokenUrl = `https://api.intra.42.fr/oauth/token?grant_type=authorization_code&client_id=${process.env.UID_42}&client_secret=${process.env.SECRET_42}&code=${code}&redirect_uri=${process.env.REDIRECT_42}`;
    let response;
    const body = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: process.env.CLIENT_ID,
      client_secret: process.env.CLIENT_SECRET,
      code,
      redirect_uri: 'http://localhost:4000/auth/callback',
    });

    try {
      response = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body,
      });
    } catch (err) {
      throw new ConflictException(err, 'fetch 작업 중 에러가 발생했습니다.');
    }
    if (response.status >= 400) {
      throw new ConflictException('Access Token을 받아올 수 없습니다.');
    }

    try {

      const data:any = await response.json();
      return data.access_token;
    } catch (err) {
      throw new ConflictException(err, 'fetch 작업 중 에러가 발생했습니다.');
    }
  }
    async validateUser(accessToken: string) {
    console.log('validateUser function');
    const response = await firstValueFrom(
      this.httpService.get('https://api.intra.42.fr/v2/me', {
        headers: { Authorization: `Bearer ${accessToken}` },
      }),
    ).catch(function (error) {
      if (error.response) {
        // 요청이 이루어졌으며 서버가 2xx의 범위를 벗어나는 상태 코드로 응답했습니다.
        throw new ForbiddenException(
          '사용자의 토큰이 만료되었거나 유효하지 않습니다.',
        );
      }
    });
    if (response) {
      console.log(response.data.id);
      let user = await this.userService.findOneUser(response.data.id);
      if (user) {
        return user;
      } else {
        user = await this.userService.createUser({
          userIdx: response.data.id,
          intra: response.data.login,
          nickname: response.data.login,
          imgUri: response.data.image.link,
        });
        return user;
      }
    }
    return null;
  }
}