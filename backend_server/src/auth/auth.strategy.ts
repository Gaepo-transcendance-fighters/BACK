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
      callbackURL: 'http://localhost:4000/auth/login' || process.env.CALLBACK_URL,
      profileFields: {
        id: 'id',
        username: 'login',
        email: 'email',
        image: 'image.link',
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
    const { id, username, email, image } = profile;
    const user = {
      id,
      username,
      email,
      image,
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
