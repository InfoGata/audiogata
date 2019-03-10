import React, { Component } from 'react';
import './App.css';
import { Database, ISong } from './data/database';
import SoundCloud from './apis/SoundCloud'

interface IAppState {
  src: string;
  playlist: ISong[];
  search: string;
  playListIndex: number;
  doLoop: boolean;
  playOnStartup: boolean;
  storageUsed?: string;
  searchResults: ISong[];
  currentSong?: ISong;
}

class App extends Component<{}, IAppState> {
  private myRef = React.createRef<HTMLAudioElement>()
  private db = new Database();
  private soundCloud = new SoundCloud();

  constructor(props: any) {
    super(props);
    this.state = {
      src: '',
      playlist: [],
      search: '',
      playListIndex: -1,
      doLoop: true,
      playOnStartup: true,
      searchResults: []
    };
  }

  async componentDidMount() {
    let songs = await this.db.songs.toArray();
    let storage = await this.getStorage();
    this.setState({
      playlist: songs,
      storageUsed: storage
    }, () => {
        if (this.state.playOnStartup) {
          this.playSong(0);
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
    let searchList = this.state.searchResults.map((songInfo, index) => 
      <li key={index}>
        <a href="#" onClick={this.onAddSong.bind(this, songInfo)}>{songInfo.name}</a>
      </li>
    );
    return (
      <div className="App">
        <div>
          <input type="text" onChange={this.onSearchChange}/>
          <button onClick={this.onSearchClick}>Search</button>
          {searchList}
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

  private onAddSong = async (song: ISong, e: React.MouseEvent) => {
    e.preventDefault();
    let id = await this.db.songs.put(song);
    song.id = id;

    let playlist = this.state.playlist;
    playlist.push(song);
    this.setState({
      playlist: playlist
    });
  }

  private onDeleteClick = async (song: ISong) => {
    if (song.id) {
      await this.db.songs.delete(song.id);
      if (this.state.currentSong && this.state.currentSong.id === song.id) {
        this.stopPlayer();
      }
      let playlist = this.state.playlist.filter(s => s.id !== song.id);
      let currentIndex = playlist.findIndex(s => s.id === (this.state.currentSong ? this.state.currentSong.id : -1));
      this.setState({
        playListIndex: currentIndex,
        playlist: playlist
      })
    }
  }


  private onSearchChange = (e: React.FormEvent<HTMLInputElement>) => {
    this.setState({search: e.currentTarget.value});
  }

  private onSearchClick = async () => {
    let songs = await this.soundCloud.searchTracks(this.state.search);
    this.setState({ searchResults: songs });
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
          from: 'local'
        });
      }
      await this.db.songs.bulkPut(songs);
      let allSongs = await this.db.songs.toArray();
      let storage = await this.getStorage();
      this.setState({
        playlist: allSongs,
        storageUsed: storage
      });
    }
  }

  private isNotValidIndex(index: number) {
    return this.state.playlist[index] === undefined;
  }

  private playSong(index: number) {
    if (this.isNotValidIndex(index)) {
      return;
    }

    let song = this.state.playlist[index];
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
