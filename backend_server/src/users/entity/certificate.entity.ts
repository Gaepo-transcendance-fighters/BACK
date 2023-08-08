import {
  Entity,
  BaseEntity,
  Column,
  PrimaryGeneratedColumn,
  OneToOne,
  PrimaryColumn,
  Unique,
} from 'typeorm';
import { UserObject } from './users.entity';

@Entity('certificate')
export class CertificateObject extends BaseEntity {
  @PrimaryColumn()
  token: string;

  @Column()
  @Unique(['userIdx'])
  userIdx: number;

  @Column({ default: false })
  check2Auth: boolean;

  @OneToOne(() => UserObject, (userIdx) => userIdx.userIdx)
  userObject: UserObject;
}
