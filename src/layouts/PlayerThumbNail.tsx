import { useAppSelector } from "@/store/hooks";
import { getThumbnailImage, playerThumbnailSize } from "@/utils";
import { Loader2 } from "lucide-react";

const PlayerThumbnail: React.FC = () => {
  const trackLoading = useAppSelector((state) => state.ui.trackLoading);
  const currentTrack = useAppSelector((state) => state.track.currentTrack);

  const image = getThumbnailImage(
    currentTrack && currentTrack.images,
    playerThumbnailSize
  );

  return (
    <div className="h-24 w-24">
      {trackLoading && (
        <Loader2 className="w-8 h-8 animate-spin top-12 left-6 absolute" />
      )}
      <img alt="thumbnail" src={image} />
    </div>
  );
};

export default PlayerThumbnail;
