import { HashProvider } from '@/shared/application/providers/hash-provider';
import {compare, hash} from 'bcryptjs'

export class BcryptHashProvider implements HashProvider {
  generateHash(payload: string): Promise<string> {
    return hash(payload, 6)
  }
  compareHash(payload: string, hash: string): Promise<boolean> {
    return compare(payload, hash)
  }

}
