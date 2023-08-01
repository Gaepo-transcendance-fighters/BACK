import { Repository } from 'typeorm'; // EntityRepository 가 deprecated 되어 직접 호출함
import { CustomRepository } from 'src/typeorm-ex.decorator';
import { UserObject } from './entities/users.entity';
import { CertificateObject } from './entities/certificate.entity';
import { CreateCertificateDto } from './dto/create-certification.dto';

@CustomRepository(CertificateObject)
export class CertificateRepository extends Repository<CertificateObject> {
  async insertCertificate(
    tokenDto: CreateCertificateDto,
    user: UserObject,
    oauth2nd: boolean,
    email: string,
  ){
    const { token } = tokenDto;

    const certificate = this.create({
      token: token,
      userIdx: user.userIdx,
      check2Auth: oauth2nd,
      email: email,
    });

    const auth = await this.save(certificate);

    return auth;
  }
}
