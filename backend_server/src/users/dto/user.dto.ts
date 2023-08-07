export class UserDto {
    userIdx: number;
    displayName: string;
    imgUri: string;
    rating: number;
    mfaNeed: boolean;
};

export class IntraInfoDto {
    userIdx: number;
    intra: string;
    imgUri: string;
    accessToken: string;
    email: string;
}
  