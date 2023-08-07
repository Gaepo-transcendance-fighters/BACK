import { BadRequestException, ForbiddenException, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { UserObjectRepository } from './users.repository';
import { CreateUsersDto } from './dto/create-users.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { BlockTargetDto } from './dto/block-target.dto';
import { v4 as uuidv4 } from 'uuid';
import { BlockListRepository } from './blockList.repository';
import { FriendListRepository } from './friendList.repository';
import { CertificateRepository } from './certificate.repository';
import { UserObject } from './entities/users.entity';
import { InsertFriendDto } from './dto/insert-friend.dto';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { response } from 'express';
import { CertificateObject } from './entities/certificate.entity';
import { CreateCertificateDto, IntraInfoDto, JwtPayloadDto } from 'src/auth/dto/auth.dto';

@Injectable()
export class UsersService {
  constructor(
    private httpService: HttpService,
    private userObjectRepository: UserObjectRepository,
    private blockedRepository: BlockListRepository,
    private friendListRepository: FriendListRepository,
    private certificateRepository: CertificateRepository,
  ) {}

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
    return await this.certificateRepository.findOneBy( {token : accessToken});
  }
  async saveToken(createCertificateDto: CreateCertificateDto): Promise<CertificateObject> {
    return await this.certificateRepository.save(createCertificateDto);
  };

  

  async blockTarget(
    blockTarget: BlockTargetDto,
    user: UserObject,
  ): Promise<string> {
    return this.blockedRepository.blockTarget(
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
      img: imgUri,
      rankpoint: 0,
      isOnline: true,
      available: true,
      win: 0,
      lose: 0,
    });
    user = await this.userObjectRepository.save(user);
    return user;
  }

  async validateUser(accessToken: string) : Promise<UserObject> {
    this.logger.log('validateUser function');
    this.logger.log(accessToken);
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
      this.logger.log(`response.data.id : ${response.data.id}`);

      let user:UserObject = await this.userObjectRepository.findOne({
        where: { userIdx: response.data.id },
      });
      if (user) {
        this.logger.log('user exist');
        return user;
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
          user,
          false,
          response.data.email,
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

  async createCertificate(
    createCertificateDto: CreateCertificateDto,
    user: UserObject,
    email: string,
  ): Promise<CertificateObject> {
    
    return this.certificateRepository.insertCertificate(
      createCertificateDto,
      user,
      true,
      email
    );
  }
}