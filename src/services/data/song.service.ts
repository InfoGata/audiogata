import { Database, ISong } from "./database";

export class SongService {
  private db = new Database();

  public async getSongs() {
    return await this.db.songs
      .orderBy("sortOrder")
      .toArray();
  }

  public async addSongs(songs: ISong[]) {
    const nextOrder = await this.getNextOrder();
    songs.forEach((song, index) => {
      song.sortOrder = nextOrder + index;
    });
    await this.db.songs.bulkPut(songs);
  }

  public async addSong(song: ISong) {
    const nextOrder = await this.getNextOrder();
    song.sortOrder = nextOrder;
    const id = await this.db.songs.put(song);
    return id;
  }

  public async deleteSong(song: ISong) {
    if (song.id) {
      await this.db.songs.delete(song.id);
    }
  }

  private async getNextOrder() {
    const lastItem = await this.db.songs.orderBy("sortOrder").last();
    const maxOrder = lastItem ? lastItem.sortOrder : 0;
    return maxOrder + 1;
  }
}
