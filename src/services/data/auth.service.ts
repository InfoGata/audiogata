import { Database, IAuth, ISong } from "./database";

export class AuthService {
  private db = new Database();

  public async addAuth(newAuth: IAuth) {
    const auth = await this.getAuthByName(newAuth.name);
    if (auth) {
      auth.accessToken = newAuth.accessToken;
      auth.refreshToken = newAuth.refreshToken;
      await this.db.auth.put(auth);
    } else {
      await this.db.auth.put(newAuth);
    }
  }

  public async getAuthByName(name: string) {
    return await this.db.auth
      .where("name")
      .equals(name)
      .first();
  }
}
