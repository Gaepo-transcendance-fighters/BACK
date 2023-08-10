import { Repository } from 'typeorm';
import { CustomRepository } from 'src/typeorm-ex.decorator';
import { GameChannel } from './entity/gameChannel.entity';

@CustomRepository(GameChannel)
export class GameChannelRepository extends Repository<GameChannel> {}
