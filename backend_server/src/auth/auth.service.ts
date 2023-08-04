import { HttpService } from "@nestjs/axios";
import { ConflictException, Injectable } from "@nestjs/common";
import { lastValueFrom } from 'rxjs';
import * as dotenv from 'dotenv';
import * as jwt from 'jsonwebtoken';
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
  
  // const jwtSecret = process.env.JWT_SECRET;
  const apiTokenUri = 'https://api.intra.42.fr/oauth/token';
  const apiMyInfoUri = 'https://api.intra.42.fr/v2/me';

  
@Injectable()
export class AuthService {
  constructor(
    private readonly httpService: HttpService,
    private readonly userService: UsersService,
    private readonly certificateRepository: CertificateRepository,              
  ) {}

  private readonly JWT_SECRET = 'Secret1234';

  async getIntraInfo(code: string): Promise<IntraInfoDto> {
    console.log('getIntraInfo Init', code);
    const params = new URLSearchParams();
    params.set('grant_type', 'authorization_code');
    params.set('client_id', CLIENT_ID);
    params.set('client_secret', CLIENT_SECRET);
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
  async getUserInfo(accessToken: string) {
    return await this.certificateRepository.findOneBy( {token : accessToken});
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
  async createJwtToken(user: any): Promise<string> {
    const payload = { userId: user.id, username: user.nickname }; // Customize the payload as per your needs
    const options = { expiresIn: '1d' }; // Token expiration time (1 day in this example)
    return jwt.sign(payload, this.JWT_SECRET, options);
  }
  async saveToken(createCertificateDto: UserObject, token: string): Promise<CertificateObject> {
    return await this.certificateRepository.save(
      {
        ...createCertificateDto
      }
      );
  }
  async getAccessToken(code: string): Promise<string> {
    const tokenUrl = `https://api.intra.42.fr/oauth/token`;
    const body = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: process.env.UID_42,
      client_secret: process.env.SECRET_42,
      code,
      redirect_uri: process.env.REDIRECT_42,
    });

    try {
      const response = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body,
      });

      if (!response.ok) {
        throw new ConflictException('Access Token을 받아올 수 없습니다.');
      }

      const data = await response.json();
      return data.access_token;
    } catch (err) {
      throw new ConflictException('fetch 작업 중 에러가 발생했습니다.');
    }
  }
  
}