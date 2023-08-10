import { UserObject } from "src/users/entity/users.entity";

export interface IntraInfoDto {
    userIdx : number;
    imgUri: string;
  }
export class JwtPayloadDto {
  id: number;
  email: string;
  // accessToken: string; // 임시
};

export class CreateCertificateDto {
  token: string;
  check2Auth: boolean;
  email: string;
  userIdx: number;
};