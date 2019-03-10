import { Database, ISong } from "./database";

export class SongService {
  private db = new Database();

  async getSongs() {
    return await this.db.songs
      .orderBy('sortOrder')
      .toArray();
  }

  async addSongs(songs: ISong[]) {
    let nextOrder = await this.getNextOrder();
    songs.forEach((song, index) => {
      song.sortOrder = nextOrder + index;
    });
    await this.db.songs.bulkPut(songs);
  }

  async addSong(song: ISong) {
    let nextOrder = await this.getNextOrder();
    song.sortOrder = nextOrder;
    let id = await this.db.songs.put(song);
    return id;
  }

  async deleteSong(song: ISong) {
    if (song.id) {
      await this.db.songs.delete(song.id);
    }
  }

  private async getNextOrder() {
    let lastItem = await this.db.songs.orderBy('sortOrder').last();
    let maxOrder = lastItem ? lastItem.sortOrder : 0;
    return maxOrder + 1;
  }
}