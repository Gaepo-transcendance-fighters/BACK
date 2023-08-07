export class UserDto {
    userIdx: number;
    displayName: string;
    img: string;
    rating: number;
    mfaNeed: boolean;
};

export class IntraInfoDto {
    constructor(userIdx: number, intra: string, img: string, accessToken: string, email: string,
    ) {
        this.userIdx = userIdx;
        this.intra = intra;
        this.img = img;
        this.accessToken = accessToken;
        this.email = email;
    }
    userIdx: number;
    intra: string;
    img: string;
    accessToken: string;
    email: string;
}
  