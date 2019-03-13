import { Database, ISong } from "./database";

export class ConfigService {
  private db = new Database();

  public async setCurrentSong(song: ISong) {
    const id = await this.getConfigId();
    if (id) {
      await this.db.config.update(id, {currentSongId: song.id});
    }
  }

  public async getCurrentSongId() {
    const id = await this.getConfigId();
    if (id) {
      const config = await this.db.config.get(id);
      return config && config.currentSongId;
    }
  }

  public async setCurrentSongTime(time: number) {
    const id = await this.getConfigId();
    if (id) {
      this.db.config.update(id, {currentTime: time});
    }
  }

  public async getCurrentSongTime() {
    const id = await this.getConfigId();
    if (id) {
      const config = await this.db.config.get(id);
      return config ? config.currentTime : 0;
    }
    return 0;
  }

  private async getConfigId() {
    const configs = await this.db.config.toArray();
    if (configs.length === 0) {
      const configId = await this.db.config.put({
        currentTime: 0,
      });
      return configId;
    }
    return configs[0].id;
  }
}
