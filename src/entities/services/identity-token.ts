import decode, { JwtPayload } from 'jwt-decode'
import * as dayjs from 'dayjs'


export class IdentityToken {

  public readonly value: string;
  private readonly decoded: JwtPayload | null;

  constructor(token: string | null) {
    if (token === null) {
      this.value = "";
      this.decoded = null;
      return;
    }

    this.value = token;
    try {
      this.decoded = decode<JwtPayload>(token)
    } catch (_) {
      this.decoded = null
    }
  }

  valid(): boolean {
    return this.decoded !== null
  }

  get expiry() {
    return dayjs.unix(this.decoded?.exp || 0)
  }
}