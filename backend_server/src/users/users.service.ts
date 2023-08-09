import { BadRequestException, ForbiddenException, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { UserObjectRepository } from './users.repository';
import { CreateUsersDto } from './dto/create-users.dto';
import { BlockTargetDto } from './dto/block-target.dto';
import { v4 as uuidv4 } from 'uuid';
import { BlockListRepository } from './blockList.repository';
import { FriendListRepository } from './friendList.repository';
import { InsertFriendDto } from './dto/insert-friend.dto';
import { HttpService } from '@nestjs/axios';
import axios from 'axios';
import { firstValueFrom, lastValueFrom } from 'rxjs';
import { response } from 'express';
import { CreateCertificateDto, IntraInfoDto, JwtPayloadDto } from 'src/auth/dto/auth.dto';
import { Socket } from 'socket.io';
import { CertificateRepository } from './certificate.repository';
import { UserObject } from './entity/users.entity';
import { CertificateObject } from './entity/certificate.entity';
import { FriendList } from './entity/friendList.entity';
import { DataSource } from 'typeorm';


const intraApiMyInfoUri = 'https://api.intra.42.fr/v2/me';
@Injectable()
export class UsersService {
  constructor(
    private dataSource: DataSource,
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
  ): Promise<FriendList[]> {
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
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    this.logger.log('validateUser start with token : ', accessToken);
    try {
      const response = await axios.get(intraApiMyInfoUri, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      // this.logger.log(`getIntraInfo: response.data.access_token : ${response.data.access_token}`) // undefined
      // console.log(`getIntraInfo: response.data.access_token : ${response.data.access_token}`); // undefined
      // console.log(`getIntraInfo: response.data.accessToken : ${response.data.accessToken}`); // undefined why? it isn't exist in here
      console.log(`getIntraInfo: response.data.id : ${response.data.id}`);
      const userInfo = response.data;
      
      // console.log(`userInfo : ${userInfo}`); // too many
      
      this.logger.log(`getIntraInfo: userInfo : ${userInfo.id}, ${userInfo.image.versions.small}`);
      if (!userInfo.id) {
        throw this.logger.error('인트라 정보 불러오기 실패했습니다.');
      }
      let existedUser: UserObject = await this.findOneUser(userInfo.id);
        console.log(`existedUser, userIdx :  `,existedUser);
        if (!existedUser) {
          this.logger.log('No user');
          /*
            @PrimaryColumn()
            userIdx: number;

            @Column()
            token: string;

            @Column()
            email: string

            @Column({ default: false })
            check2Auth: boolean;
           */
          const certi = await this.certificateRepository.insertCertificate(
            
            userInfo.id,
            accessToken, // intraInfo에 있지
            userInfo.email,
            false,
            
          );
          
          console.log('certificate insert', certi);

          this.logger.log(`user create start`);
          const user = await this.userObjectRepository.createUser({
            userIdx: response.data.id,
            intra: response.data.login,
            nickname: response.data.login,
            imgUri: response.data.image.link,
            certificate: certi,
            email: response.data.email,
          });
          console.log('user create end', user);

          try{
            await queryRunner.manager.save(certi);
            await queryRunner.manager.save(user);
            
            await queryRunner.commitTransaction();
          } catch (err) {
            await queryRunner.rollbackTransaction();
            console.log(err);
          } finally {
            await queryRunner.release();
          }
          
          return user;
        } else {
          // 유저가 존재하는 경우
          if (existedUser.certificate.token !== accessToken) {
            // 존재하는 유저가 있지만 토큰이 다른 경우 -> 토큰 업데이트
            this.logger.log('user is exist but token is different');

            existedUser.certificate.token = accessToken;
            await this.certificateRepository.update(existedUser.userIdx, existedUser.certificate);
            return existedUser;
          }
          this.logger.log(` 유저가 존재하지 않은 경우 certi insert start`);
          /*
              token: string;
              check2Auth: boolean;
              email: string;
              userIdx: number;
           */
        }

    } catch (error) {
      // 에러 핸들링
      console.error('Error making GET request:', error);
    }
  }


  async createCertificate(
    createCertificateDto: CreateCertificateDto,
    
  ): Promise<CertificateObject> {

    return this.certificateRepository.insertCertificate(
      createCertificateDto.userIdx,
      createCertificateDto.token,
      createCertificateDto.email,
      createCertificateDto.check2Auth,
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
