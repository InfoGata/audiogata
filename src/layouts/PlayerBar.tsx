import DOMPurify from "dompurify";
import React from "react";
import { useAppSelector } from "../store/hooks";
import Controls from "./Controls";
import PlayerThumbnail from "./PlayerThumbNail";
import Progress from "./Progress";

const PlayerBar: React.FC = () => {
  const currentTrack = useAppSelector((state) => state.track.currentTrack);
  const sanitizer = DOMPurify.sanitize;

  return (
    <div className="bottom-0 left-0 fixed bg-background w-full border-t z-40 grid grid-cols-12 items-center">
      <div className="col-span-3 sm:col-span-2">
        <PlayerThumbnail />
      </div>

      <div className="flex flex-col items-center col-span-9 mr-2 sm:w-4/5 sm:col-span-10">
        <div className="flex flex-row">
          <p
            className="max-w-64 truncate text-sm"
            title={currentTrack && currentTrack.name}
            dangerouslySetInnerHTML={{
              __html: sanitizer(currentTrack?.name || ""),
            }}
          />
          {/* <div>
            {currentTrack && (
              <TrackMenu track={currentTrack} noQueueItem={true} />
            )}
          </div> */}
        </div>
        <Controls />
        <Progress />
      </div>
    </div>
  );
};

export default PlayerBar;
