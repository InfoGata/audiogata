import DOMPurify from "dompurify";
import React from "react";
import { useAppSelector } from "../store/hooks";
import Controls from "./Controls";
import PlayerThumbnail from "./PlayerThumbNail";
import Progress from "./Progress";
import TrackMenu from "@/components/TrackMenu";
import Volume from "./Volume";
import PlaybackRate from "./PlaybackRate";

const PlayerBar: React.FC = () => {
  const currentTrack = useAppSelector((state) => state.track.currentTrack);
  const sanitizer = DOMPurify.sanitize;

  return (
    <div className="fixed bottom-0 left-0 w-full bg-background border-t z-40 flex flex-col">
      {/* Progress bar at the very top */}
      <div className="w-full px-2">
        <Progress />
      </div>
      
      {/* Main player controls */}
      <div className="grid grid-cols-12 items-center px-4 h-20">
        {/* Left section - Now playing */}
        <div className="col-span-3 flex items-center gap-x-3 min-w-0">
          <div className="flex-shrink-0">
            <PlayerThumbnail />
          </div>
          <div className="min-w-0 flex-1">
            <p
              className="text-sm font-medium truncate"
              title={currentTrack?.name}
              dangerouslySetInnerHTML={{
                __html: sanitizer(currentTrack?.name || ""),
              }}
            />
            {currentTrack?.artistName && (
              <p
                className="text-xs text-muted-foreground truncate"
                title={currentTrack.artistName}
                dangerouslySetInnerHTML={{
                  __html: sanitizer(currentTrack.artistName),
                }}
              />
            )}
          </div>
          {currentTrack && (
            <div className="flex-shrink-0">
              <TrackMenu track={currentTrack} noQueueItem={true} />
            </div>
          )}
        </div>

        {/* Center section - Controls */}
        <div className="col-span-6 flex flex-col items-center justify-center">
          <Controls />
        </div>

        {/* Right section - Volume & additional controls */}
        <div className="col-span-3 flex items-center justify-end gap-x-2">
          <PlaybackRate />
          <Volume />
        </div>
      </div>
    </div>
  );
};

export default PlayerBar;
