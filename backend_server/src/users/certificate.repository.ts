import { Repository } from 'typeorm'; // EntityRepository 가 deprecated 되어 직접 호출함
import { CustomRepository } from 'src/typeorm-ex.decorator';
import { UserObject } from './entities/users.entity';
import { CertificateObject } from './entities/certificate.entity';
import { CreateCertificateDto } from 'src/auth/dto/auth.dto';

@CustomRepository(CertificateObject)
export class CertificateRepository extends Repository<CertificateObject> {
  async insertCertificate(
    token: string,
    check2Auth: boolean,
    email: string,
    userIdx: number,
  ){

    const certificate = this.create({
      token: token,
      userIdx: userIdx,
      check2Auth: check2Auth,
      email: email,
    });

    const auth = await this.save(certificate);

    return auth;
  }
}
