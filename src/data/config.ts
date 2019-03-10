import { Database } from './database';

export class Config {
  private db = new Database();
  async getConfigId() {
    let configs = await this.db.config.toArray();
    if (configs.length === 0) {
      let configId = await this.db.config.put({
        currentTime: 0
      })
      return configId;
    }
    return configs[0].id;
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