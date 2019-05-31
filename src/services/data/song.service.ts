import { db, ISong } from "./database";

export class SongService {
  public async getSongs() {
    return await db.songs
      .orderBy("sortOrder")
      .toArray();
  }

  public async addSongs(songs: ISong[]) {
    const nextOrder = await this.getNextOrder();
    songs.forEach((song, index) => {
      song.sortOrder = nextOrder + index;
    });
    await db.songs.bulkPut(songs);
  }

  public async addSong(song: ISong) {
    const nextOrder = await this.getNextOrder();
    song.sortOrder = nextOrder;
    const id = await db.songs.put(song);
    return id;
  }

  public async deleteSong(song: ISong) {
    if (song.id) {
      await db.songs.delete(song.id);
    }
  }

  private async getNextOrder() {
    const lastItem = await db.songs.orderBy("sortOrder").last();
    const maxOrder = lastItem ? lastItem.sortOrder : 0;
    return maxOrder + 1;
  }
}
