import { Repository } from 'typeorm'; // EntityRepository 가 deprecated 되어 직접 호출함
import { UserObject } from './entities/users.entity';
import { CreateUsersDto } from './dto/create-users.dto';
import { CustomRepository } from 'src/typeorm-ex.decorator';

@CustomRepository(UserObject)
export class UserObjectRepository extends Repository<UserObject> {
  async createUser(createUsersDto: CreateUsersDto): Promise<UserObject> {
    const { userIdx, intra, nickname, img } = createUsersDto;

    let user = this.create({
      userIdx: userIdx,
      intra: intra,
      nickname: nickname,
      img: img,
      rankpoint: 0,
      isOnline: true,
      available: true,
      win: 0,
      lose: 0,
    });
    user = await this.save(user);

    return user;
  }

  async findUserByIntra(intra: string): Promise<UserObject> {
    const user = await this.findOne({ where: { intra: intra } });
    return user;
  }


  async setIsOnline(user: UserObject, isOnline: boolean): Promise<boolean> {
    user.isOnline = isOnline;
    await this.update(user.userIdx, { isOnline: user.isOnline });
    return user.isOnline;
  }

}

// @CustomRepository(Histories)
// export class HistoriesRepository extends Repository<Histories> {
//   async createHistories(
//     createHistoryDto: CreateHistoryDto,
//     argGameId: number,
//   ): Promise<Histories> {
//     const { userIdx, type, result } = createHistoryDto;
//     let histories;
//     if (type == HistoriesType.NORMAL) {
//       histories = this.create({
//         gameId: argGameId,
//         userIdx,
//         result,
//       });
//     } else {
//       histories = this.create({
//         gameId: argGameId,
//         userIdx,
//         type,
//         result,
//       });
//     }
//     await this.save(histories);
//     return histories;
//   }
// }
