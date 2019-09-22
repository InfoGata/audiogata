import { UserSession } from 'blockstack';
import { ISong } from '../models';

class BlockstackSync {
  private readonly filename = "music.json";

  public async init() {
    const userSession = new UserSession();
    if (userSession.isSignInPending()) {
      await userSession.handlePendingSignIn()
    }
  }

  public login() {
    const userSession = new UserSession()
    userSession.redirectToSignIn(window.location.href);
  }

  public isLoggedIn() {
    const userSession = new UserSession();
    return userSession.isUserSignedIn();
  }

  public logout() {
    const userSession = new UserSession();
    userSession.signUserOut();
  }

  public async sync(songs: ISong[]) {
    const userSession = new UserSession();
    const options = {
      encrypt: false
    }
    await userSession.putFile(this.filename, JSON.stringify(songs), options);
  }

  public async getData(): Promise<ISong[]> {
    const userSession = new UserSession();
    const options = {
      decrypt: false
    }
    const contents = await userSession.getFile(this.filename, options);
    const result = JSON.parse((contents as string));
    return result;
  }
}

export default BlockstackSync;