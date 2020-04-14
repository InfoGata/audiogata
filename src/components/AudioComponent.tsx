import React from "react";
import { connect } from "react-redux";
import { toast } from "react-toastify";
import { bindActionCreators, Dispatch } from "redux";
import { ISong } from "../models";
import Local from "../players/local";
import {
  nextTrack,
  prevTrack,
  seek,
  setElapsed,
  toggleIsPlaying,
} from "../store/reducers/songReducer";
import { AppState } from "../store/store";

interface IProps extends StateProps, DispatchProps {}
interface IState {
  errorCount: number;
}

class AudioComponent extends React.Component<IProps, IState> {
  private readonly local: Local;
  constructor(props: IProps) {
    super(props);
    this.local = new Local(this.setTrackTimes, this.onSongEnd);
    this.state = {
      errorCount: 0
    }
  }

  public componentDidMount() {
    this.setMediaSessionActions();
    this.local.setVolume(this.props.volume);
    if (this.props.playOnStartup && this.props.isPlaying) {
      this.playCurrentSong();
    } else if (this.props.isPlaying) {
      this.props.toggleIsPlaying();
    }
  }

  public async componentDidUpdate(prevProps: IProps) {
    const currentProps = this.props;
    await this.onCurrentSongUpdate(prevProps, currentProps);
    await this.onIsPlayingUpdate(prevProps, currentProps);
    this.onVolumeUpdate(prevProps, currentProps);
    this.onMuteUpdate(prevProps, currentProps);
    this.onSeek(prevProps, currentProps);
  }

  public render() {
    return null;
  }

  private async onCurrentSongUpdate(prevProps: IProps, newProps: IProps) {
    if (
      prevProps.currentSong &&
      newProps.currentSong &&
      prevProps.currentSong.id !== newProps.currentSong.id
    ) {
      await this.playSong(newProps.currentSong);
    }
  }

  private async onIsPlayingUpdate(prevProps: IProps, newProps: IProps) {
    if (prevProps.isPlaying !== newProps.isPlaying) {
      if (newProps.isPlaying) {
        this.local.resume();
        if (!this.local.ready() && newProps.currentSong) {
          await this.playSong(newProps.currentSong, newProps.elapsed);
        }
      } else {
        this.local.pause();
      }
    }
  }

  private onVolumeUpdate(prevProps: IProps, newProps: IProps) {
    if (prevProps.volume !== newProps.volume) {
      this.local.setVolume(newProps.volume);
    }
  }

  private onMuteUpdate(prevProps: IProps, newProps: IProps) {
    if (prevProps.mute !== newProps.mute) {
      if (newProps.mute) {
        this.local.setVolume(0);
      } else {
        this.local.setVolume(newProps.volume);
      }
    }
  }

  private onSeek(prevProps: IProps, newProps: IProps) {
    if (newProps.seekTime != null && prevProps.seekTime !== newProps.seekTime) {
      this.local.seek(newProps.seekTime);
      this.props.seek(undefined);
    }
  }

  private async playCurrentSong() {
    const currentSong = this.props.currentSong;
    if (currentSong) {
      await this.playSong(currentSong, this.props.elapsed);
      this.setMediaSessionMetaData();
    }
  }
  private setTrackTimes = (currentTime: number, _: number) => {
    this.props.setElapsed(currentTime);
  };

  private onSongEnd = () => {
    this.props.nextTrack();
  };

  private async playSong(song: ISong, time?: number) {
    if (song.from) {
      this.local.pause();
      try {
        await this.local.play(song);
        this.setState({
          errorCount: 0
        });
      } catch (err) {
        this.onError(err);
        return;
      }
      if (time) {
        this.local.seek(time);
      }
    }
  }

  private onError = (err: any) => {
    // NotAllowedError occurs when autoplay is denied.
    if (err.name === "NotAllowedError") {
      setElapsed(0);
      return;
    }

    if (this.props.currentSong) {
      const message = `${this.props.currentSong.name}: ${err.message}`;
      toast.error(message);
      console.log(err);
    }
    this.setState({
      errorCount: this.state.errorCount + 1
    });
    if (this.state.errorCount < 3) {
      this.props.nextTrack();
    }
  };

  private setMediaSessionMetaData() {
    if (navigator && navigator.mediaSession) {
      if (this.props.currentSong) {
        navigator.mediaSession.metadata = new MediaMetadata({
          title: this.props.currentSong.name,
          artwork: this.props.currentSong.images.map(i => ({ src: i.url, sizes: `${i.height}x${i.width}`, type: this.getImageType(i.url) }))
        });
      }
    }
  }

  private getImageType(url: string) : string
  {
    if (url.endsWith(".png"))
    {
      return "image/png";
    }
    if (url.endsWith(".jpg"))
    {
      return "image/jpg";
    }
    return "";
  }

  private setMediaSessionActions() {
    if (navigator && navigator.mediaSession) {
      navigator.mediaSession.setActionHandler("previoustrack", () => {
        this.props.prevTrack();
      });
      navigator.mediaSession.setActionHandler("nexttrack", () => {
        this.props.nextTrack();
      });
    }
  }
}
const mapStateToProps = (state: AppState) => ({
  currentSong: state.song.currentSong,
  elapsed: state.song.elapsed,
  isPlaying: state.song.isPlaying,
  mute: state.song.mute,
  playOnStartup: state.settings.playOnStartup,
  seekTime: state.song.seekTime,
  volume: state.song.volume,
});
type StateProps = ReturnType<typeof mapStateToProps>;

const mapDispatchToProps = (dispatch: Dispatch) =>
  bindActionCreators(
    {
      nextTrack,
      prevTrack,
      seek,
      setElapsed,
      toggleIsPlaying,
    },
    dispatch,
  );
type DispatchProps = ReturnType<typeof mapDispatchToProps>;
export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(AudioComponent);
