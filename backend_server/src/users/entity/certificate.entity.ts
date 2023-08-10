import {
  Entity,
  BaseEntity,
  Column,
  OneToOne,
  PrimaryColumn,
  Unique,
} from 'typeorm';

@Entity('certificate')
export class CertificateObject extends BaseEntity {
  @PrimaryColumn()
  userIdx: number;

  @Column()
  token: string;

  @Column()
  email: string;

  @Column({ default: false })
  check2Auth: boolean;

}
