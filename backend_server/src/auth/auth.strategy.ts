import { PassportStrategy } from '@nestjs/passport';
import { Strategy, verify } from 'passport-42';
import { ConfigService } from '@nestjs/config';
import { Injectable, UnauthorizedException, 
  Logger, } from '@nestjs/common';

@Injectable()
export class FtStrategy extends PassportStrategy(Strategy, 'ft') {
  
  constructor(private configService: ConfigService) {
      
    super({

      clientID: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      callbackURL: process.env.CALLBACK_URL,
      profileFields: {
        userIdx: 'id',
        intra: 'login',
        email: 'email',
        imgUri: 'image.link',
      },
      scope: ['public'],

      
    });
  }
    private logger: Logger = new Logger('AuthStrategy');


    validate( accessToken: string, refreshToken: string, profile: any, cb: verify ){
      this.logger.log('validate function');
      const { userIdx, intra, email, imgUri: {link : imgUri} } = profile;
      const user = {
        userIdx,
        intra,
        email,
        imgUri,
        accessToken,
        refreshToken,
      };
      cb(null, user);
    }
};


