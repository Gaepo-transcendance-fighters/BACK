import { Repository } from 'typeorm'; // EntityRepository 가 deprecated 되어 직접 호출함
import { CustomRepository } from 'src/typeorm-ex.decorator';
import { InsertFriendDto } from './dto/insert-friend.dto';
import { FriendList } from './entity/friendList.entity';
import { UserObject } from './entity/users.entity';
import { UserObjectRepository } from './users.repository';

@CustomRepository(FriendList)
export class FriendListRepository extends Repository<FriendList> {
  async insertFriend(
    insertFriendDto: InsertFriendDto,
    user: UserObject,
    userList: UserObjectRepository,
  ): Promise<string> {
    const { targetNickname } = insertFriendDto;
    const friend = await userList.findOne({
      where: { nickname: targetNickname },
    });
    if (!friend) {
      throw new Error(`There is no name, ${targetNickname}`);
    }

    const target = this.create({
      userIdx: user.userIdx,
      friendIdx: friend.userIdx,
      friendNickname: targetNickname,
    });

    await this.save(target);

    return friend.nickname;
  }
}
