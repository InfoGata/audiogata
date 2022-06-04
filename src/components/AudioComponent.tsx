import React from "react";
import { connect } from "react-redux";
import { bindActionCreators, Dispatch } from "redux";
import { PlayerComponent, Song, PlayerComponentType } from "../types";
import LocalPlayer from "../LocalPlayer";
import {
  nextTrack,
  prevTrack,
  seek,
  setElapsed,
  toggleIsPlaying,
} from "../store/reducers/songReducer";
import { AppState } from "../store/store";
import { withSnackbar, ProviderContext } from "notistack";
import PluginsContext from "../PluginsContext";
import { db } from "../database";
import { filterAsync } from "../utils";

interface AudioComponentProps
  extends StateProps,
    DispatchProps,
    ProviderContext {}
interface AudioComponentState {
  errorCount: number;
}

class AudioComponent extends React.Component<
  AudioComponentProps,
  AudioComponentState
> {
  static contextType = PluginsContext;
  context!: React.ContextType<typeof PluginsContext>;
  private songLoaded = false;
  private lastPlayer: PlayerComponent | undefined;
  constructor(props: AudioComponentProps) {
    super(props);

    LocalPlayer.onSongEnd = this.onSongEnd;
    LocalPlayer.setTime = this.setTrackTimes;
    this.state = {
      errorCount: 0,
    };
  }

  public async componentDidMount() {
    this.setMediaSessionActions();
    let player = await this.getPlayerFromName(
      this.props.currentSong?.from || "",
      "setVolume"
    );
    await player?.setVolume(this.props.volume);
    player = await this.getPlayerFromName(
      this.props.currentSong?.from || "",
      "setPlaybackRate"
    );
    await player?.setPlaybackRate(this.props.playbackRate || 1.0);
    if (this.props.playOnStartup && this.props.isPlaying) {
      await this.playCurrentSong();
    } else if (this.props.isPlaying) {
      this.props.toggleIsPlaying();
    }
  }

  public async componentDidUpdate(prevProps: AudioComponentProps) {
    const currentProps = this.props;
    await this.onCurrentSongUpdate(prevProps, currentProps);
    await this.onIsPlayingUpdate(prevProps, currentProps);
    await this.onVolumeUpdate(prevProps, currentProps);
    await this.onMuteUpdate(prevProps, currentProps);
    this.onRateUpdate(prevProps, currentProps);
    await this.onSeek(prevProps, currentProps);
  }

  public render() {
    return null;
  }

  private async getPlayerFromName(
    name: string,
    method: PlayerComponentType = "play"
  ): Promise<PlayerComponent | undefined> {
    // PlayerComponent must have play
    const playerPlugins = await filterAsync(this.context.plugins, (p) =>
      p.hasDefined.play()
    );
    const plugin = playerPlugins.find((p) => p.id === name);
    if (plugin) {
      const hasMethod = await plugin.methodDefined(method);
      const result = hasMethod ? plugin.remote : undefined;
      return result;
    }

    return LocalPlayer;
  }

  private async onCurrentSongUpdate(
    prevProps: AudioComponentProps,
    newProps: AudioComponentProps
  ) {
    if (
      prevProps.currentSong &&
      newProps.currentSong &&
      prevProps.currentSong.id !== newProps.currentSong.id
    ) {
      await this.playSong(newProps.currentSong);
    }
  }

  private async onIsPlayingUpdate(
    prevProps: AudioComponentProps,
    newProps: AudioComponentProps
  ) {
    const player = await this.getPlayerFromName(
      newProps.currentSong?.from || ""
    );
    if (prevProps.isPlaying !== newProps.isPlaying) {
      if (newProps.isPlaying) {
        player?.resume();
        if (!this.songLoaded && newProps.currentSong) {
          await this.playSong(newProps.currentSong, newProps.elapsed);
        }
      } else {
        await player?.pause();
      }
    }
  }

  private async onVolumeUpdate(
    prevProps: AudioComponentProps,
    newProps: AudioComponentProps
  ) {
    if (prevProps.volume !== newProps.volume) {
      const player = await this.getPlayerFromName(
        newProps.currentSong?.from || "",
        "setVolume"
      );
      await player?.setVolume(newProps.volume);
    }
  }

  private async onRateUpdate(
    prevProps: AudioComponentProps,
    newProps: AudioComponentProps
  ) {
    if (prevProps.playbackRate !== newProps.playbackRate) {
      const player = await this.getPlayerFromName(
        this.props.currentSong?.from || "",
        "setPlaybackRate"
      );
      await player?.setPlaybackRate(newProps.playbackRate || 1.0);
    }
  }

  private async onMuteUpdate(
    prevProps: AudioComponentProps,
    newProps: AudioComponentProps
  ) {
    if (prevProps.mute !== newProps.mute) {
      const player = await this.getPlayerFromName(
        this.props.currentSong?.from || "",
        "setVolume"
      );
      if (newProps.mute) {
        await player?.setVolume(0);
      } else {
        await player?.setVolume(newProps.volume);
      }
    }
  }

  private async onSeek(
    prevProps: AudioComponentProps,
    newProps: AudioComponentProps
  ) {
    if (newProps.seekTime != null && prevProps.seekTime !== newProps.seekTime) {
      const player = await this.getPlayerFromName(
        newProps.currentSong?.from || "",
        "seek"
      );
      await player?.seek(newProps.seekTime);
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

  private async playSong(song: Song, time?: number) {
    const newSong: Song = { ...song };
    if (newSong.from && newSong.id) {
      const audioBlob = await db.audioBlobs
        .where(":id")
        .equals(newSong.id)
        .first();
      const pluginFrame = this.context.plugins.find(
        (p) => p.id === newSong.from
      );
      const hasPluginApi =
        (await pluginFrame?.hasDefined.getTrackUrl()) || false;
      const player = await this.getPlayerFromName(newSong.from || "");
      this.lastPlayer?.pause();
      try {
        if (audioBlob) {
          newSong.source = URL.createObjectURL(audioBlob.blob);
        } else if (hasPluginApi && pluginFrame) {
          newSong.source = await pluginFrame.remote.getTrackUrl(newSong);
        }

        await player?.play(newSong);
        this.lastPlayer = player;
        this.songLoaded = true;
        this.setState({
          errorCount: 0,
        });
      } catch (err) {
        this.onError(err);
        return;
      }
      if (time) {
        await player?.seek(time);
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
      this.props.enqueueSnackbar(message, { variant: "error" });
      console.log(message);
      console.log(err);
    }
    this.setState({
      errorCount: this.state.errorCount + 1,
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
          artwork: this.props.currentSong.images.map((i) => ({
            src: i.url,
            sizes: `${i.height}x${i.width}`,
            type: this.getImageType(i.url),
          })),
        });
      }
    }
  }

  private getImageType(url: string): string {
    if (url.endsWith(".png")) {
      return "image/png";
    }
    if (url.endsWith(".jpg")) {
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
  playbackRate: state.song.playbackRate,
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
    dispatch
  );
type DispatchProps = ReturnType<typeof mapDispatchToProps>;
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withSnackbar(AudioComponent));
