import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-42';
import { AuthService, CLIENT_SECRET, clientId, redirectUri } from './auth.service';

@Injectable()
export class FtStrategy extends PassportStrategy(Strategy, 'ft') {
  constructor(private authService: AuthService) {
    super({
      clientID: clientId || process.env.CLIENT_ID,
      clientSecret: CLIENT_SECRET || process.env.CLIENT_SECRET,
      callbackURL: 'http://localhost:4000/auth/callback' || process.env.CALLBACK_URL, // 'http://localhost:4000/auth/login'
      failureRedirect: 'http://localhost:3000/login' ,
      profileFields: {
        userIdx: 'id',
        intra: 'login',
        email: 'email',
        imgUri: 'image.link',
      },
      scope: ['public'],
    });
  }
  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: any,
  ): Promise<any> {
    const { userIdx, intra, email, imgUri } = profile;
    const user = {
      userIdx,
      intra,
      email,
      imgUri,
      accessToken,
      refreshToken,
    };
    return done(null, user);
  }
//   async validate(accessToken: string, refreshToken: string) {
//     const result = await this.authService.validateUser(accessToken);
//     if (!result) throw new UnauthorizedException('Unauthorized');
//     return result;
//   }
}
