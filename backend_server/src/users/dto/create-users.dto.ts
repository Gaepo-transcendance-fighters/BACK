import {
  IsString,
  MaxLength,
  MinLength,
  Matches,
  IsNotEmpty,
} from 'class-validator';

export class CreateUsersDto {
  constructor(userIdx: number, intra: string, nickname: string, imgUri: string) {
    this.userIdx = userIdx;
    this.intra = intra;
    this.nickname = nickname;
    this.imgUri = imgUri;
  } 

  @IsNotEmpty()
  userIdx: number;
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  @MinLength(1)
  @Matches(/^[a-zA-Z0-9]*$/, { message: 'intra is unique' })
  intra: string;
  nickname: string;
  imgUri: string;
}
