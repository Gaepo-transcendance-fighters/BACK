import { Repository } from 'typeorm';
import { CustomRepository } from 'src/typeorm-ex.decorator';
import { GameRecord } from './entity/gameRecord.entity';

@CustomRepository(GameRecord)
export class GameRecordRepository extends Repository<GameRecord> {}
