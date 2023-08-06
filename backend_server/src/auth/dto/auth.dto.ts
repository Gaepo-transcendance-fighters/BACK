import { UserObject } from "src/users/entities/users.entity";

export interface IntraInfoDto {
    userIdx : number;
    imgUri: string;
  }
export interface JwtPayloadDto {
  id: number;
  check2Auth: boolean;
};

export class CreateCertificateDto {
  token: string;
  check2Auth: boolean;
  email: string;
  user: UserObject
};