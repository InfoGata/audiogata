import React, { Component } from 'react';
import './App.css';
import { ISong, IAlbum, IArtist } from './services/data/database';
import SoundCloud from './services/apis/SoundCloud'
import { SongService } from './services/data/song.service';
import { ConfigService } from './services/data/config.service';

interface IAppState {
  src: string;
  playlist: ISong[];
  search: string;
  playListIndex: number;
  doLoop: boolean;
  playOnStartup: boolean;
  storageUsed?: string;
  songResults: ISong[];
  albumResults: IAlbum[];
  artistResults: IArtist[];
  currentSong?: ISong;
}

class App extends Component<{}, IAppState> {
  private myRef = React.createRef<HTMLAudioElement>()
  private soundCloud = new SoundCloud();
  private songService = new SongService();
  private configService = new ConfigService();

  constructor(props: any) {
    super(props);
    this.state = {
      src: '',
      playlist: [],
      search: '',
      playListIndex: -1,
      doLoop: true,
      playOnStartup: true,
      songResults: [],
      albumResults: [],
      artistResults: []
    };
  }

  async componentDidMount() {
    let songs = await this.songService.getSongs();
    let storage = await this.getStorage();
    let currentSongId = await this.configService.getCurrentSongId()
    this.setState({
      playlist: songs,
      storageUsed: storage
    }, () => {
        if (this.state.playOnStartup && currentSongId) {
          let index = songs.findIndex(s => s.id === currentSongId)
          this.playSong(index);
        }
    });
  }

  render() {
    let songList = this.state.playlist.map((songInfo, index) =>
      <li key={index}>
        <a href="#" className={index == this.state.playListIndex ? 'Selected-Song' : ''} onClick={this.onPlaylistClick.bind(this, index)}>
          {songInfo.name}
        </a>
        <button onClick={this.onDeleteClick.bind(this, songInfo)}>Delete</button>
      </li>
    );
    let songSearchList = this.state.songResults.map((song, index) => 
      <li key={index}>
        <a href="#" onClick={this.onClickSong.bind(this, song)}>{song.name}</a>
      </li>
    );
    let albumSearchList = this.state.albumResults.map((album) =>
      <li key={album.apiId}>
        <a href="#" onClick={this.onClickAlbum.bind(this, album)}>{album.name}</a>
      </li>
    );
    let artistSearchList = this.state.artistResults.map((artist) =>
      <li key={artist.apiId}>
        <a href="#" onClick={this.onClickArtist.bind(this, artist)}>{artist.name}</a>
      </li>
    );
    return (
      <div className="App">
        <div>
          <input type="text" onChange={this.onSearchChange}/>
          <button onClick={this.onSearchClick}>Search</button>
          <button onClick={this.clearSearch}>Clear Search Results</button>
          {songSearchList.length > 0 ? <div>Songs:</div> : null}
          <ul>
            {songSearchList}
          </ul>
          {albumSearchList.length > 0 ? <div>Albums:</div> : null}
          <ul>
            {albumSearchList}
          </ul>
          {artistSearchList.length > 0 ? <div>Artists:</div> : null}
          <ul>
            {artistSearchList}
          </ul>
        </div>
        <div>
          <span>{this.state.storageUsed}% of Storage is being Used</span>
        </div>
        <div>
          <input type="file" onChange={this.onFileChange} multiple/>
        </div>
        <div>
          <button onClick={this.onPreviousClick}>Previous</button>
          <audio controls={true} ref={this.myRef} onEnded={this.onSongEnd}>
            <source src={this.state.src} type="audio/mpeg" />
          </audio>
          <button onClick={this.onNextClick}>Next</button>
        </div>
        <ul>
          {songList}
        </ul>
      </div>
    );
  }

  private onClickSong = async (song: ISong, e: React.MouseEvent) => {
    e.preventDefault();
    let id = await this.songService.addSong(song);
    song.id = id;

    let playlist = this.state.playlist;
    playlist.push(song);
    this.setState({
      playlist: playlist
    });
  }

  private onClickAlbum = async (album: IAlbum, e: React.MouseEvent) => {
    e.preventDefault();
    this.clearSearch();
    if (album.from === 'soundcloud') {
      let songs = await this.soundCloud.getAlbumTracks(album);
      this.setState({
        songResults: songs
      });
    }
  }

  private onClickArtist  = async (artist: IArtist, e: React.MouseEvent) => {
    e.preventDefault();
    this.clearSearch();
    if (artist.from === 'soundcloud') {
      let albums = await this.soundCloud.getArtistAlbums(artist);
      this.setState({
        albumResults: albums
      });
    }
  }

  private onDeleteClick = async (song: ISong) => {
    await this.songService.deleteSong(song);
    if (this.state.currentSong && this.state.currentSong.id === song.id) {
      this.stopPlayer();
    }
    let playlist = this.state.playlist.filter(s => s.id !== song.id);
    let currentIndex = playlist.findIndex(s => s.id === (this.state.currentSong ? this.state.currentSong.id : -1));
    let storage = await this.getStorage();
    this.setState({
      playListIndex: currentIndex,
      playlist: playlist,
      storageUsed: storage
    })
  }


  private onSearchChange = (e: React.FormEvent<HTMLInputElement>) => {
    this.setState({search: e.currentTarget.value});
  }

  private onSearchClick = async () => {
    let songs = await this.soundCloud.searchTracks(this.state.search);
    let albums = await this.soundCloud.searchAlbums(this.state.search);
    let artists = await this.soundCloud.searchArtists(this.state.search);
    this.setState({
      songResults: songs,
      albumResults: albums,
      artistResults: artists
    });
  }

  private async getStorage() {
    var estimate = await navigator.storage.estimate();
    if (estimate.usage && estimate.quota) {
      return (100 * estimate.usage / estimate.quota).toFixed(2);
    }
  }

  private onPreviousClick = () => {
    let newIndex = this.state.playListIndex - 1;
    if (newIndex >= 0) {
      this.playSong(newIndex);
    } else if (this.state.doLoop) {
      newIndex = this.state.playlist.length - 1;
      this.playSong(newIndex);
    }
  }

  private onNextClick = () => {
    let newIndex = this.state.playListIndex + 1;
    if (this.state.playlist.length > newIndex) {
      this.playSong(newIndex);
    } else if (this.state.doLoop) {
      newIndex = 0;
      this.playSong(newIndex);
    }
  }

  private onSongEnd = () => {
    this.onNextClick();
  }

  private onFileChange = async (e: React.FormEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;
    if (files && files.length > 0) {
      let songs: ISong[] = [];
      for (let i = 0; i < files.length; i++) {
        let file = files[i];
        const fileUrl = URL.createObjectURL(file);
        songs.push({
          name: file.name,
          source: fileUrl,
          blob: file,
          useBlob: true,
          from: 'local',
          dateAdded: new Date(),
          sortOrder: 0
        });
      }
      await this.songService.addSongs(songs);
      let allSongs = await this.songService.getSongs();
      let storage = await this.getStorage();
      this.setState({
        playlist: allSongs,
        storageUsed: storage
      });
    }
  }

  private clearSearch = () => {
    this.setState({
      songResults: [],
      albumResults: [],
      artistResults: []
    })
  }

  private isNotValidIndex(index: number) {
    return this.state.playlist[index] === undefined;
  }

  private async playSong(index: number) {
    if (this.isNotValidIndex(index)) {
      return;
    }

    let song = this.state.playlist[index];
    await this.configService.setCurrentSong(song);
    let source = song.source;
    if (song.useBlob) {
      source = URL.createObjectURL(song.blob);
    }
    if (song.from === 'soundcloud') {
      source = this.soundCloud.getTrackUrl(song);
    }
    this.setState({
      src: source,
      currentSong: song,
      playListIndex: index
    }, () => {
      this.reloadPlayer();
    });
  }

  private onPlaylistClick = (index: number, e: React.MouseEvent) => {
    e.preventDefault();
    this.playSong(index)
  }

  private stopPlayer() {
    if (this.myRef.current) {
      this.myRef.current.pause();
    }
  }

  private reloadPlayer() {
    if (this.myRef.current) {
      this.myRef.current.load();
      this.myRef.current.play();
    }
  }
}

export default App;
