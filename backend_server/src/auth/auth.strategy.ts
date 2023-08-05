import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-42';
import { AuthService } from './auth.service';

@Injectable()
export class FtStrategy extends PassportStrategy(Strategy, 'ft') {
  constructor(private authService: AuthService) {
    super({

      clientID: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      callbackURL: process.env.REDIRECT_URL,
      failureRedirect: 'http://localhost:3000/login',
      profileFields: {
        userIdx: 'id',
        intra: 'login',
        email: 'email',
        imgUri: 'image.link',
      },
      scope: ['public'],
    });
  }

  async validate( accessToken: string, refreshToken: string, profile: any, ){
    const { userIdx, intra, email, imgUri: {link : imgUri} } = profile;
    const user = {
      userIdx,
      intra,
      email,
      imgUri,
      accessToken,
      refreshToken,
    };
    return user;
  }
  // async validate(accessToken: string, refreshToken: string) {
  //   const result = await this.authService.validateUser(accessToken);
  //   if (!result) throw new UnauthorizedException('Unauthorized');
  //   return result;
  // }
};


