import React from "react";
import { connect } from "react-redux";
import { bindActionCreators, Dispatch } from "redux";
import { PlayerComponent, PlayerComponentType } from "../types";
import LocalPlayer from "../LocalPlayer";
import {
  nextTrack,
  prevTrack,
  seek,
  setElapsed,
  toggleIsPlaying,
} from "../store/reducers/trackReducer";
import { AppState } from "../store/store";
import { withSnackbar, ProviderContext } from "notistack";
import PluginsContext from "../PluginsContext";
import { db } from "../database";
import { filterAsync } from "../utils";
import { Track } from "../plugintypes";

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
  private trackLoaded = false;
  private lastPlayer: PlayerComponent | undefined;
  constructor(props: AudioComponentProps) {
    super(props);

    LocalPlayer.onTrackEnd = this.onTrackEnd;
    LocalPlayer.setTime = this.setTrackTimes;
    this.state = {
      errorCount: 0,
    };
  }

  public async componentDidMount() {
    this.setMediaSessionActions();
    let player = await this.getPlayerFromName(
      this.props.currentTrack?.pluginId || "",
      PlayerComponentType.onSetVolume
    );
    await player?.onSetVolume(this.props.volume);
    player = await this.getPlayerFromName(
      this.props.currentTrack?.pluginId || "",
      PlayerComponentType.onSetPlaybackRate
    );
    await player?.onSetPlaybackRate(this.props.playbackRate || 1.0);
    if (this.props.playOnStartup && this.props.isPlaying) {
      await this.playCurrentTrack();
    } else if (this.props.isPlaying) {
      this.props.toggleIsPlaying();
    }
  }

  public async componentDidUpdate(prevProps: AudioComponentProps) {
    const currentProps = this.props;
    await this.onCurrentTrackUpdate(prevProps, currentProps);
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
    method: PlayerComponentType = PlayerComponentType.onPlay
  ): Promise<PlayerComponent | undefined> {
    // PlayerComponent must have play
    const playerPlugins = await filterAsync(this.context.plugins, (p) =>
      p.hasDefined.onPlay()
    );
    const plugin = playerPlugins.find((p) => p.id === name);
    if (plugin) {
      const hasMethod = await plugin.methodDefined(method);
      const result = hasMethod ? plugin.remote : undefined;
      return result;
    }

    return LocalPlayer;
  }

  private async onCurrentTrackUpdate(
    prevProps: AudioComponentProps,
    newProps: AudioComponentProps
  ) {
    if (
      prevProps.currentTrack &&
      newProps.currentTrack &&
      prevProps.currentTrack.id !== newProps.currentTrack.id
    ) {
      await this.playTrack(newProps.currentTrack);
    }
  }

  private async onIsPlayingUpdate(
    prevProps: AudioComponentProps,
    newProps: AudioComponentProps
  ) {
    const player = await this.getPlayerFromName(
      newProps.currentTrack?.pluginId || ""
    );
    if (prevProps.isPlaying !== newProps.isPlaying) {
      if (newProps.isPlaying) {
        player?.onResume();
        if (!this.trackLoaded && newProps.currentTrack) {
          await this.playTrack(newProps.currentTrack, newProps.elapsed);
        }
      } else {
        await player?.onPause();
      }
    }
  }

  private async onVolumeUpdate(
    prevProps: AudioComponentProps,
    newProps: AudioComponentProps
  ) {
    if (prevProps.volume !== newProps.volume) {
      const player = await this.getPlayerFromName(
        newProps.currentTrack?.pluginId || "",
        PlayerComponentType.onSetVolume
      );
      await player?.onSetVolume(newProps.volume);
    }
  }

  private async onRateUpdate(
    prevProps: AudioComponentProps,
    newProps: AudioComponentProps
  ) {
    if (prevProps.playbackRate !== newProps.playbackRate) {
      const player = await this.getPlayerFromName(
        this.props.currentTrack?.pluginId || "",
        PlayerComponentType.onSetPlaybackRate
      );
      await player?.onSetPlaybackRate(newProps.playbackRate || 1.0);
    }
  }

  private async onMuteUpdate(
    prevProps: AudioComponentProps,
    newProps: AudioComponentProps
  ) {
    if (prevProps.mute !== newProps.mute) {
      const player = await this.getPlayerFromName(
        this.props.currentTrack?.pluginId || "",
        PlayerComponentType.onSetVolume
      );
      if (newProps.mute) {
        await player?.onSetVolume(0);
      } else {
        await player?.onSetVolume(newProps.volume);
      }
    }
  }

  private async onSeek(
    prevProps: AudioComponentProps,
    newProps: AudioComponentProps
  ) {
    if (newProps.seekTime != null && prevProps.seekTime !== newProps.seekTime) {
      const player = await this.getPlayerFromName(
        newProps.currentTrack?.pluginId || "",
        PlayerComponentType.onSeek
      );
      await player?.onSeek(newProps.seekTime);
      this.props.seek(undefined);
    }
  }

  private async playCurrentTrack() {
    const currentTrack = this.props.currentTrack;
    if (currentTrack) {
      await this.playTrack(currentTrack, this.props.elapsed);
      this.setMediaSessionMetaData();
    }
  }
  private setTrackTimes = (currentTime: number, _: number) => {
    this.props.setElapsed(currentTime);
  };

  private onTrackEnd = () => {
    this.props.nextTrack();
  };

  private async playTrack(track: Track, time?: number) {
    const newTrack: Track = { ...track };
    if (newTrack.pluginId && newTrack.id) {
      const audioBlob = await db.audioBlobs
        .where(":id")
        .equals(newTrack.id)
        .first();
      const pluginFrame = this.context.plugins.find(
        (p) => p.id === newTrack.pluginId
      );
      const hasPluginApi =
        (await pluginFrame?.hasDefined.getTrackUrl()) || false;
      const player = await this.getPlayerFromName(newTrack.pluginId || "");
      this.lastPlayer?.onPause();
      try {
        if (audioBlob) {
          newTrack.source = URL.createObjectURL(audioBlob.blob);
        } else if (hasPluginApi && pluginFrame) {
          newTrack.source = await pluginFrame.remote.getTrackUrl(newTrack);
        }

        await player?.onPlay(newTrack);
        this.lastPlayer = player;
        this.trackLoaded = true;
        this.setState({
          errorCount: 0,
        });
      } catch (err) {
        this.onError(err);
        return;
      }
      if (time) {
        await player?.onSeek(time);
      }
    }
  }

  private onError = (err: any) => {
    // NotAllowedError occurs when autoplay is denied.
    if (err.name === "NotAllowedError") {
      setElapsed(0);
      return;
    }

    if (this.props.currentTrack) {
      const message = `${this.props.currentTrack.name}: ${err.message}`;
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
      if (this.props.currentTrack) {
        navigator.mediaSession.metadata = new MediaMetadata({
          title: this.props.currentTrack.name,
          artwork: this.props.currentTrack.images?.map((i) => ({
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
  currentTrack: state.track.currentTrack,
  elapsed: state.track.elapsed,
  isPlaying: state.track.isPlaying,
  mute: state.track.mute,
  playOnStartup: state.settings.playOnStartup,
  seekTime: state.track.seekTime,
  volume: state.track.volume,
  playbackRate: state.track.playbackRate,
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
