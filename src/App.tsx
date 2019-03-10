import React, { Component } from 'react';
import './App.css';
import { Database, ISong } from './data/database';

interface IAppState {
  src: string;
  playlist: ISong[];
  search: string;
  playListIndex: number;
  doLoop: boolean;
  playOnStartup: boolean;
  storageUsed?: string;
}

class App extends Component<{}, IAppState> {
  private myRef = React.createRef<HTMLAudioElement>()
  private db = new Database();

  constructor(props: any) {
    super(props);
    this.state = {
      src: '',
      playlist: [],
      search: '',
      playListIndex: -1,
      doLoop: true,
      playOnStartup: true
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
          this.onPlaylistClick(0);
        }
    });
  }

  render() {
    let songList = this.state.playlist.map((songInfo, index) =>
      <li key={index}>
        <a href="#" className={index == this.state.playListIndex ? 'Selected-Song' : ''} onClick={() => this.onPlaylistClick(index)}>
          {songInfo.name}
        </a>
      </li>
    );
    return (
      <div className="App">
        <div>
          <span>%{this.state.storageUsed} of Storage is being Used</span>
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

  private async getStorage() {
    var estimate = await navigator.storage.estimate();
    if (estimate.usage && estimate.quota) {
      return (estimate.usage / estimate.quota).toFixed(2);
    }
  }

  private onPreviousClick = () => {
    let newIndex = this.state.playListIndex - 1;
    if (newIndex >= 0) {
      this.onPlaylistClick(newIndex);
    } else if (this.state.doLoop) {
      newIndex = this.state.playlist.length - 1;
      this.onPlaylistClick(newIndex);
    }
  }

  private onNextClick = () => {
    let newIndex = this.state.playListIndex + 1;
    if (this.state.playlist.length > newIndex) {
      this.onPlaylistClick(newIndex);
    } else if (this.state.doLoop) {
      newIndex = 0;
      this.onPlaylistClick(newIndex);
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
          useBlob: true
        });
      }
      await this.db.songs.bulkPut(songs);
      let allSongs = await this.db.songs.toArray();
      this.setState({
        playlist: allSongs,
      });
    }
  }

  private isNotValidIndex(index: number) {
    return this.state.playlist[index] === undefined;
  }

  private onPlaylistClick(index: number) {
    if (this.isNotValidIndex(index)) {
      return;
    }

    let song = this.state.playlist[index];
    let source = song.source;
    if (song.useBlob) {
        source = URL.createObjectURL(song.blob);
    }
    this.setState({
      src: source,
      playListIndex: index
    }, () => {
      this.reloadPlayer();
    });
  }

  private reloadPlayer() {
    if (this.myRef.current) {
      this.myRef.current.load();
      this.myRef.current.play();
    }
  }
}

export default App;
