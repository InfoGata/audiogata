import { Database, ISong } from './database';

export class ConfigService {
  private db = new Database();
  private async getConfigId() {
    let configs = await this.db.config.toArray();
    if (configs.length === 0) {
      let configId = await this.db.config.put({
        currentTime: 0
      })
      return configId;
    }
    return configs[0].id;
  }

  async setCurrentSong(song: ISong) {
    let id = await this.getConfigId();
    if (id) {
      await this.db.config.update(id, {currentSongId: song.id});
    }
  }

  async getCurrentSongId() {
    let id = await this.getConfigId();
    if (id) {
      let config = await this.db.config.get(id);
      return config && config.currentSongId;
    }
  }

  async setCurrentSongTime(time: number) {
    let id = await this.getConfigId();
    if (id) {
      this.db.config.update(id, {currentTime: time});
    }
  }

  async getCurrentSongTime() {
    let id = await this.getConfigId();
    if (id) {
      let config = await this.db.config.get(id);
      return config ? config.currentTime : 0;
    }
    return 0;
  }
}