import { BadRequestException, ForbiddenException, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { UserObjectRepository } from './users.repository';
import { CreateUsersDto } from './dto/create-users.dto';
import { BlockTargetDto } from './dto/block-target.dto';
import { v4 as uuidv4 } from 'uuid';
import { BlockListRepository } from './blockList.repository';
import { FriendListRepository } from './friendList.repository';
import { CertificateRepository } from './certificate.repository';
import { UserObject } from './entities/users.entity';
import { InsertFriendDto } from './dto/insert-friend.dto';
import { HttpService } from '@nestjs/axios';
import axios from 'axios';
import { firstValueFrom, lastValueFrom } from 'rxjs';
import { response } from 'express';
import { CertificateObject } from './entities/certificate.entity';
import { CreateCertificateDto, IntraInfoDto, JwtPayloadDto } from 'src/auth/dto/auth.dto';
import { Socket } from 'socket.io';

const intraApiMyInfoUri = 'https://api.intra.42.fr/v2/me';
@Injectable()
export class UsersService {
  constructor(
    private httpService: HttpService,
    private userObjectRepository: UserObjectRepository,
    private blockedListRepository: BlockListRepository,
    private friendListRepository: FriendListRepository,
    private certificateRepository: CertificateRepository,
  ) { }


  private logger: Logger = new Logger('UsersService');

  async signUp(createUsersDto: CreateUsersDto): Promise<string> {
    const { intra } = createUsersDto;
    const check = await this.userObjectRepository.findOne({ where: { intra } });

    if (check != null && check != undefined)
      throw new BadRequestException('This is not unique id');
    else return (await this.userObjectRepository.createUser(createUsersDto)).intra;
  }

  async signIn(createUsersDto: CreateUsersDto): Promise<string> {
    const { intra } = createUsersDto;
    const user = await this.userObjectRepository.findOne({
      where: { intra: intra },
    });
    if (user === null || user === undefined) {
      throw new BadRequestException('You need to sign up, first');
    }
    return (await user).intra;
  }
  async findOneUser(userIdx: number): Promise<UserObject> {
    return this.userObjectRepository.findOneBy({ userIdx });
  }

  async getTokenInfo(accessToken: string) {
    return await this.certificateRepository.findOneBy({ token: accessToken });
  }
  async saveToken(createCertificateDto: CreateCertificateDto): Promise<CertificateObject> {
    return await this.certificateRepository.save(createCertificateDto);
  };



  async blockTarget(
    blockTarget: BlockTargetDto,
    user: UserObject,
  ): Promise<string> {
    return this.blockedListRepository.blockTarget(
      blockTarget,
      user,
      this.userObjectRepository,
    );
  }

  async findUserByIntra(intra: string): Promise<UserObject> {
    return this.userObjectRepository.findOne({ where: { intra: intra } });
  }

  async addFriend(
    insertFriendDto: InsertFriendDto,
    user: UserObject,
  ): Promise<string> {
    return this.friendListRepository.insertFriend(
      insertFriendDto,
      user,
      this.userObjectRepository,
    );
  }

  async createUser(createUsersDto: CreateUsersDto): Promise<UserObject> {
    const { userIdx, intra, nickname, imgUri } = createUsersDto;

    let user = this.userObjectRepository.create({
      userIdx: userIdx,
      intra: intra,
      nickname: intra,
      imgUri: imgUri,
      rankpoint: 0,
      isOnline: true,
      available: true,
      win: 0,
      lose: 0,
    });
    user = await this.userObjectRepository.save(user);
    return user;
  }
  /*
  async validateUser(accessToken: string) : Promise<UserObject> {
    this.logger.log('validateUser function');
    this.logger.log(accessToken);
    const response = await lastValueFrom(
      this.httpService.get(intraApiMyInfoUri, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }),
    );
    // httpService.get() 메서드 안에서 headers: Authorization 이 존재하는지 확인하는 코드가 필요함
    
    this.logger.log(`getIntraInfo: userInfo : ${response.data.id}, ${response.data.image.versions.small}`);
    
    if (response.data.id !== undefined || response.data.id !== null) {
      this.logger.log(`response.data.id : ${response.data.id}`);

      let existedUser:UserObject = await this.findOneUser(response.data.id);
      this.logger.log(`user : ${existedUser}`)
      if (existedUser) {
        this.logger.log('user exist');
        return existedUser;
      } else {
        this.logger.log(`user create start`);
        const user = await this.userObjectRepository.createUser({
          userIdx : response.data.id,
          intra: response.data.login,
          nickname: response.data.login,
          imgUri: response.data.image.link,
          certificate: response.data.accessToken,
          email: response.data.email,
        });
        this.logger.log(`user create end ${user}, certi insert start`);
        const certi = await this.certificateRepository.insertCertificate(
          response.data.accessToken,
          false,
          response.data.email,
          response.data.Id,
        )
        if (certi == null) {
          this.logger.log('서버에 문제가 발생했습니다.');
        }
        console.log('certificate insert', certi);
        return user;
      }
    }
    return null;
  }
  */
  async validateUser(accessToken: string): Promise<UserObject> {
    this.logger.log('validateUser function');
    this.logger.log(accessToken);
    try {
      const response = await axios.get(intraApiMyInfoUri, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      this.logger.log(`getIntraInfo: response.data.access_token : ${response.data.access_token}`)

      const userInfo = response;
      console.log(userInfo);
      // 이제 userInfo를 사용하여 원하는 작업을 수행할 수 있습니다.
      this.logger.log(`getIntraInfo: userInfo : ${userInfo.data.id}, ${userInfo.data.image.versions.small}`);
      if (userInfo) {
        this.logger.log(`response.data.id : ${response.data.id}`);

        let existedUser: UserObject = await this.findOneUser(response.data.id);
        this.logger.log(`user : ${existedUser}`)
        if (existedUser) {
          this.logger.log('user exist');
          return existedUser;
        } else {
          this.logger.log(`user create start`);
          const user = await this.userObjectRepository.createUser({
            userIdx: response.data.id,
            intra: response.data.login,
            nickname: response.data.login,
            imgUri: response.data.image.link,
            certificate: response.data.accessToken,
            email: response.data.email,
          });
          this.logger.log(`user create end ${user}, certi insert start`);
          const certi = await this.certificateRepository.insertCertificate(
            response.data.accessToken,
            false,
            response.data.email,
            response.data.Id,
          )
          if (certi == null) {
            this.logger.log('서버에 문제가 발생했습니다.');
          }
          console.log('certificate insert', certi);
          return user;
        }
      }
      return null;

    } catch (error) {
      // 에러 핸들링
      console.error('Error making GET request:', error);
    }
  }


  async createCertificate(
    createCertificateDto: CreateCertificateDto,
    user: UserObject,
    email: string,
  ): Promise<CertificateObject> {

    return this.certificateRepository.insertCertificate(
      createCertificateDto.token,
      true,
      email,
      user.userIdx,
    );
  }

  async getAllUsersFromDB(): Promise<UserObject[]> {
    return this.userObjectRepository.find();
  }

  async getUserInfoFromDB(intra: string): Promise<UserObject> {
    return this.userObjectRepository.findOne({ where: { intra: intra } });
  }

  async getFriendList(
    intra: string,
  ): Promise<{ friendNicname: string; isOnline: boolean }[]> {
    const user: UserObject = await this.userObjectRepository.findOne({
      where: { intra: intra },
    });
    return this.friendListRepository.getFriendList(
      user.userIdx,
      this.userObjectRepository,
    );
  }

  async getBlockedList(intra: string) {
    const user: UserObject = await this.userObjectRepository.findOne({
      where: { intra: intra },
    });
    return this.blockedListRepository.getBlockedList(user);
  }

  async setIsOnline(user: UserObject, isOnline: boolean) {
    // user.isOnline = isOnline;
    return this.userObjectRepository.setIsOnline(user, isOnline);
  }

  // async getUserId(client: Socket): Promise<number> {
  //   return parseInt(client.handshake.query.userId as string, 10);
  // }
}
