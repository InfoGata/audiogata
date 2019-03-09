import React, { Component } from 'react';
import './App.css';

interface IAppState {
  src: string;
  playlist: SongInfo[];
  search: string;
  playListIndex: number;
  doLoop: boolean;
}

interface SongInfo {
  name: string;
  source: string;
}

class App extends Component<{}, IAppState> {
  private myRef = React.createRef<HTMLAudioElement>()

  constructor(props: any) {
    super(props);
    this.state = {
      src: '',
      playlist: [],
      search: '',
      playListIndex: 0,
      doLoop: true
    };
  }

  render() {
    //let soundCloud = new SoundCloud();
    //soundCloud.searchTracks('katamari');
    let songList = this.state.playlist.map((songInfo, index) =>
      <li>
        <a href="#" className={index == this.state.playListIndex ? 'Selected-Song' : ''} onClick={() => this.onPlaylistClick(index)}>
          {songInfo.name}
        </a>
      </li>
    );
    return (
      <div className="App">
        <div>
          <input type="text" value={this.state.search} onChange={this.onSearchChange} />
          <button onClick={this.search}>
            Search
          </button>
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

  private search = (e: React.FormEvent<HTMLButtonElement>) => {
    alert(this.state.search);
  }

  private onSearchChange = (e: React.FormEvent<HTMLInputElement>) => {
    this.setState({search: e.currentTarget.value})
  }

  private onFileChange = (e: React.FormEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;
    if (files && files.length > 0) {
      let fileNames: SongInfo[] = [];
      for (let i = 0; i < files.length; i++) {
        let file = files[i];
        const fileUrl = URL.createObjectURL(file);
        fileNames.push({
          name: file.name,
          source: fileUrl
        });
      }
      const file = files[0];
      const fileUrl = URL.createObjectURL(file);
      this.setState(() => ({
        src: fileUrl,
        playlist: fileNames,
        playListIndex: 0
      }), () => {
        this.reloadPlayer();
      });
    }
  }

  private onPlaylistClick(index: number) {
    let song = this.state.playlist[index];
    this.setState({
      src: song.source,
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
