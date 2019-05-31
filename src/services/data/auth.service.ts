import { db, IAuth, ISong } from "./database";

export class AuthService {
  public async addAuth(newAuth: IAuth) {
    const auth = await this.getAuthByName(newAuth.name);
    if (auth) {
      auth.accessToken = newAuth.accessToken;
      auth.refreshToken = newAuth.refreshToken;
      await db.auth.put(auth);
    } else {
      await db.auth.put(newAuth);
    }
  }

  public async getAuthByName(name: string) {
    return await db.auth
      .where("name")
      .equals(name)
      .first();
  }
}
