import React, { Component } from 'react';
import './App.css';

interface IAppState {
  src: string;
  playlist: SongInfo[];
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
      playlist: []
    };
  }

  render() {
    let songList = this.state.playlist.map((songInfo) =>
      <li><a href="#" onClick={() => this.onPlaylistClick(songInfo.source)}>{songInfo.name}</a></li>
    );
    return (
      <div className="App">
        <input type="file" onChange={this.onFileChange} multiple/>
        <audio controls={true} ref={this.myRef}>
          <source src={this.state.src} type="audio/mpeg"/>
        </audio>
        <ul>
          {songList}
        </ul>
      </div>
    );
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
        playlist: fileNames
      }), () => {
        this.reloadPlayer();
      });
    }
  }

  private onPlaylistClick(source: string) {
    this.setState({
      src: source
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
