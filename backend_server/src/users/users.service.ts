import { BadRequestException, Injectable } from '@nestjs/common';
import { UserObjectRepository } from './users.repository';
import { CreateUsersDto } from './dto/create-users.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { BlockTargetDto } from './dto/block-target.dto';
import { BlockListRepository } from './blockList.repository';
import { FriendListRepository } from './friendList.repository';
import { UserObject } from './entity/users.entity';
import { InsertFriendDto } from './dto/insert-friend.dto';

@Injectable()
export class UsersService {
  constructor(
    private userObjectRepository: UserObjectRepository,
    private blockedRepository: BlockListRepository,
    private friendListRepository: FriendListRepository,
  ) {}

  async signUp(createUsersDto: CreateUsersDto): Promise<string> {
    const { intra } = createUsersDto;
    const check = await this.userObjectRepository.findOne({ where: { intra } });

    if (check != null && check != undefined)
      throw new BadRequestException('This is not unique id');
    else return await this.userObjectRepository.createUser(createUsersDto);
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
}