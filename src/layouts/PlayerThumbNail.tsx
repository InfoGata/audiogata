import { useAppSelector } from "@/store/hooks";
import { getThumbnailImage } from "@infogata/utils";
import { playerThumbnailSize } from "@/utils";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const PlayerThumbnail: React.FC = () => {
  const trackLoading = useAppSelector((state) => state.ui.trackLoading);
  const currentTrack = useAppSelector((state) => state.track.currentTrack);

  const image = getThumbnailImage(
    currentTrack?.images,
    playerThumbnailSize
  );

  return (
    <div className="relative w-14 h-14 flex-shrink-0">
      {trackLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 z-10">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      )}
      <img
        alt={currentTrack?.name || ""}
        src={image}
        className={cn(
          "w-full h-full object-cover",
          !currentTrack && "opacity-50"
        )}
      />
    </div>
  );
};

export default PlayerThumbnail;
