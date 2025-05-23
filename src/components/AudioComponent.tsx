import { Capacitor } from "@capacitor/core";
import canAutoPlay from "can-autoplay";
import React from "react";
import { withTranslation, WithTranslation } from "react-i18next";
import { connect } from "react-redux";
import { bindActionCreators, Dispatch } from "redux";
import { db } from "../database";
import { localPlayer } from "../LocalPlayer";
import { PluginContextInterface } from "../PluginsContext";
import { Track } from "../plugintypes";
import {
  nextTrack,
  pause,
  play,
  prevTrack,
  seek,
  setElapsed,
  toggleIsPlaying,
} from "../store/reducers/trackReducer";
import { setTrackLoading } from "../store/reducers/uiReducer";
import { AppState } from "../store/store";
import { PlayerComponent, PlayerComponentType } from "../types";
import { filterAsync } from "@infogata/utils";
import { defaultSkipTime } from "../utils";
import { withPlugins } from "../withPlugins";
import * as Sentry from "@sentry/browser";
import { toast } from "sonner";
import { CapacitorMusicControls } from "capacitor-music-controls-plugin";

export interface AudioComponentProps
  extends StateProps,
    DispatchProps,
    PluginContextInterface,
    WithTranslation {}
interface AudioComponentState {
  errorCount: number;
}

class AudioComponent extends React.Component<
  AudioComponentProps,
  AudioComponentState
> {
  private trackLoaded = false;
  private isStartup = true;
  private lastPlayer: PlayerComponent | undefined;
  constructor(props: AudioComponentProps) {
    super(props);

    localPlayer.onTrackEnd = this.onTrackEnd;
    localPlayer.setTime = this.setTrackTimes;

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
  }

  public async componentDidUpdate(prevProps: AudioComponentProps) {
    const currentProps = this.props;
    await this.onCurrentTrackUpdate(prevProps, currentProps);
    await this.onIsPlayingUpdate(prevProps, currentProps);
    await this.onVolumeUpdate(prevProps, currentProps);
    await this.onMuteUpdate(prevProps, currentProps);
    await this.onRateUpdate(prevProps, currentProps);
    await this.onSeek(prevProps, currentProps);
    await this.playStartupTrack(currentProps);
  }

  public render() {
    return null;
  }

  private async playStartupTrack(currentProps: AudioComponentProps) {
    if (this.isStartup && currentProps.pluginsLoaded) {
      this.isStartup = false;
      if (
        currentProps.playOnStartup &&
        currentProps.isPlaying &&
        currentProps.currentTrack
      ) {
        const canAutoPlayResponse = await canAutoPlay.audio();
        if (canAutoPlayResponse.result) {
          await this.playTrack(currentProps.currentTrack, currentProps.elapsed);
        } else {
          toast.error(this.props.t("cantAutoplay"));
          this.props.toggleIsPlaying();
        }
      } else if (currentProps.isPlaying) {
        this.props.toggleIsPlaying();
      }
    }
  }

  private async getPlayerFromName(
    name: string,
    method: PlayerComponentType = PlayerComponentType.onPlay
  ): Promise<PlayerComponent | undefined> {
    // PlayerComponent must have play
    const playerPlugins = await filterAsync(this.props.plugins, (p) =>
      p.hasDefined.onPlay()
    );
    const plugin = playerPlugins.find((p) => p.id === name);
    if (plugin) {
      const hasMethod = await plugin.methodDefined(method);
      const result = hasMethod ? plugin.remote : undefined;
      return result;
    }

    return localPlayer;
  }

  private async onCurrentTrackUpdate(
    prevProps: AudioComponentProps,
    newProps: AudioComponentProps
  ) {
    if (
      newProps.currentTrack &&
      prevProps.currentTrack?.id !== newProps.currentTrack.id
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
        if (!this.trackLoaded && newProps.currentTrack) {
          await this.playTrack(newProps.currentTrack, newProps.elapsed);
        } else {
          player?.onResume();
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

      // Repeat currentTrack if repeatOne is on
      if (
        newProps.seekTime === 0 &&
        newProps.currentTrack &&
        newProps.repeatOne
      ) {
        await this.playTrack(newProps.currentTrack);
      } else {
        await player?.onSeek(newProps.seekTime);
      }
      this.props.seek(undefined);
    }
  }

  private setTrackTimes = (currentTime: number) => {
    this.props.setElapsed(currentTime);
  };

  private onTrackEnd = () => {
    this.props.nextTrack();
  };

  private async playTrack(track: Track, time?: number) {
    const newTrack: Track = { ...track };
    if (newTrack.pluginId && newTrack.id) {
      this.props.setTrackLoading(true);
      const audioBlob = await db.audioBlobs
        .where(":id")
        .equals(newTrack.id)
        .first();
      const pluginFrame = this.props.plugins.find(
        (p) => p.id === newTrack.pluginId
      );
      const hasPluginApi =
        (await pluginFrame?.hasDefined.onGetTrackUrl()) || false;
      const player = await this.getPlayerFromName(newTrack.pluginId || "");
      this.lastPlayer?.onPause();
      try {
        if (audioBlob) {
          newTrack.source = URL.createObjectURL(audioBlob.blob);
        } else if (hasPluginApi && pluginFrame) {
          newTrack.source = await pluginFrame.remote.onGetTrackUrl({
            apiId: newTrack.apiId,
          });
        }

        await player?.onPlay({
          apiId: newTrack.apiId,
          source: newTrack.source,
          seekTime: time,
        });
        this.setMediaSessionMetaData();
        this.lastPlayer = player;
        this.trackLoaded = true;
        this.setState({
          errorCount: 0,
        });
      } catch (err) {
        this.onError(err);
        return;
      }
      this.props.setTrackLoading(false);
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
      toast.error(message);
      console.log(err);
      // Only capture first error message
      if (this.state.errorCount === 0) {
        Sentry.captureException(err);
      }
    }
    this.setState({
      errorCount: this.state.errorCount + 1,
    });
    if (this.state.errorCount < 3) {
      this.props.nextTrack();
    }
  };

  private setMediaSessionMetaData() {
    if (!this.props.currentTrack) return;

    if (navigator && navigator.mediaSession) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: this.props.currentTrack.name,
        artwork: this.props.currentTrack.images?.map((i) => ({
          src: i.url,
          sizes: `${i.height}x${i.width}`,
          type: this.getImageType(i.url),
        })),
      });
    }

    if (Capacitor.isNativePlatform()) {
      CapacitorMusicControls.create({
        track: this.props.currentTrack.name,
        artist: this.props.currentTrack.artistName,
        cover:
          this.props.currentTrack.images &&
          this.props.currentTrack.images[0].url,
      });
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
      const handlers: [MediaSessionAction, MediaSessionActionHandler][] = [
        [
          "previoustrack",
          () => {
            this.props.prevTrack();
          },
        ],
        [
          "nexttrack",
          () => {
            this.props.nextTrack();
          },
        ],
        [
          "play",
          () => {
            this.props.play();
          },
        ],
        [
          "pause",
          () => {
            this.props.pause();
          },
        ],
        [
          "seekbackward",
          (details) => {
            const skipTime =
              details.seekOffset ||
              this.props.customForwardAndRewindTime ||
              defaultSkipTime;
            const elapsed = this.props.elapsed || 0;
            const currentTime = Math.max(elapsed - skipTime, 0);
            this.props.seek(currentTime);
          },
        ],
        [
          "seekforward",
          (details) => {
            const skipTime =
              details.seekOffset ||
              this.props.customForwardAndRewindTime ||
              defaultSkipTime;
            const elapsed = this.props.elapsed || 0;
            const newTime = elapsed + skipTime;
            const currentTime = this.props.currentTrack?.duration
              ? Math.min(newTime, this.props.currentTrack.duration)
              : newTime;
            this.props.seek(currentTime);
          },
        ],
        [
          "seekto",
          (details) => {
            this.props.seek(details.seekTime || undefined);
          },
        ],
      ];

      for (const [action, handler] of handlers) {
        try {
          navigator.mediaSession.setActionHandler(action, handler);
        } catch {
          /* empty */
        }
      }
    }

    if (Capacitor.isNativePlatform()) {
      const handleControlsEvent = (action: { message: string; position: number }) => {
        const message = action.message;
        switch (message) {
          case "music-controls-next":
            this.props.nextTrack();
            break;
          case "music-controls-previous":
            this.props.prevTrack();
            break;
          case "music-controls-pause":
            this.props.toggleIsPlaying();
            break;
          case "music-controls-play":
            this.props.toggleIsPlaying();
            break;
        }
      };
      document.addEventListener("controlsNotification", (event: any) => {
        const info = { message: event.message, position: 0 };
        handleControlsEvent(info);
      });
    }
  }
}
const mapStateToProps = (state: AppState) => ({
  currentTrack: state.track.currentTrack,
  elapsed: state.track.elapsed,
  isPlaying: state.track.isPlaying,
  mute: state.track.mute,
  seekTime: state.track.seekTime,
  volume: state.track.volume,
  playbackRate: state.track.playbackRate,
  repeatOne: state.track.repeatOne,
  playOnStartup: state.settings.playOnStartup,
  customForwardAndRewindTime: state.settings.customFowardAndRewindTime,
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
      setTrackLoading,
      play,
      pause,
    },
    dispatch
  );
type DispatchProps = ReturnType<typeof mapDispatchToProps>;
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withPlugins(withTranslation()(AudioComponent)));
