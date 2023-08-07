import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
// import { UserObject } from './users.entity';

@Entity('BlockList')
export class BlockList extends BaseEntity {
  @PrimaryGeneratedColumn()
  idx: number;

  @Column()
  userIdx: number;

  @Column()
  blockedUserIdx: number;

  @Column()
  blockedNickname: string;

  @CreateDateColumn() // 해당 컬럼은 자동으로 입력됨.
  blockedTime: Date;

  //   @ManyToOne(() => UserObject, (userIdx) => userIdx)
  //   @JoinColumn([{ name: 'userIdx', referencedColumnName: 'userIdx' }])
  //   user: UserObject;
}
