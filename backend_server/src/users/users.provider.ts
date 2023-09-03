import { Injectable } from '@nestjs/common';
import { BlockList } from 'src/entity/blockList.entity';
import { UserObject } from 'src/entity/users.entity';
import { UserObjectRepository } from './users.repository';
import { BlockListRepository } from './blockList.repository';
import { QueryFailedError } from 'typeorm';

@Injectable()
export class InMemoryUsers {
  private inMemoryUsers: UserObject[] = [];
  private inMemoryBlockList: BlockList[] = [];

  constructor(
    private readonly userObjectRepository: UserObjectRepository,
    private readonly blockListRepository: BlockListRepository,
  ) {
    this.initInMemoryUsers();
  }

  private initInMemoryUsers(): void {
    this.userObjectRepository.find().then((users) => {
      this.inMemoryUsers = users;
    });
    this.blockListRepository.find().then((blocks) => {
      this.inMemoryBlockList = blocks;
    });
  }

  getUserByIntraFromIM(intra: string): UserObject {
    return this.inMemoryUsers.find((user) => user.intra === intra);
  }

  getUserByIdFromIM(userId: number): UserObject {
    return this.inMemoryUsers.find((user) => user.userIdx === userId);
  }

  setUserByIdFromIM(updatedUser: UserObject): void {
    const userIndex = this.inMemoryUsers.findIndex(
      (user) => user.userIdx === updatedUser.userIdx,
    );
    this.inMemoryUsers[userIndex] = updatedUser;
    if (userIndex === -1) {
      this.inMemoryUsers.push(updatedUser);
    }
  }

  async saveUserByIdFromIm(updatedUserL: UserObject): Promise<boolean> {
    try {
      const indexForList = this.inMemoryUsers.findIndex(
        (user) => user.userIdx === updatedUserL.userIdx,
      );
      await this.userObjectRepository
        .save(this.inMemoryUsers[indexForList])
        .then(() => {
          return true;
        });
    } catch (error) {
      return false;
    }
  }

  getBlockListByIdFromIM(userId: number): BlockList[] {
    return this.inMemoryBlockList.filter((user) => user.userIdx === userId);
  }

  setBlockListByIdFromIM(blockList: BlockList): void {
    this.inMemoryBlockList.push(blockList);
  }

  removeBlockListByNicknameFromIM(nickname: string): void {
    this.inMemoryBlockList = this.inMemoryBlockList.filter(
      (user) => user.blockedNickname !== nickname,
    );
  }
}
