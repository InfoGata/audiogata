import { Track } from "@/plugintypes";
import { getThumbnailImage } from "@infogata/utils";
import { playlistThumbnailSize } from "@/utils";
import DOMPurify from "dompurify";
import ArtistLinks from "./ArtistLinks";
import TrackMenu from "./TrackMenu";
import { useAppDispatch } from "@/store/hooks";
import { addTrack, setTrack } from "@/store/reducers/trackReducer";

type Props = {
  track: Track;
};

const TrackCard: React.FC<Props> = (props) => {
  const { track } = props;
  const image = getThumbnailImage(track.images, playlistThumbnailSize);
  const sanitizer = DOMPurify.sanitize;
  const dispatch = useAppDispatch();

  const onClickTrack = () => {
    dispatch(addTrack(track));
    dispatch(setTrack(track));
  };

  return (
    <div className="min-w-64">
      <button onClick={onClickTrack}>
        <img
          src={image}
          className="rounded-md bg-gray-200 w-full h-64 object-cover"
        />
      </button>
      <div>
        <div className="flex justify-between">
          <button onClick={onClickTrack}>
            <h3
              className="font-medium"
              dangerouslySetInnerHTML={{
                __html: sanitizer(track.name || ""),
              }}
            />
          </button>
          <TrackMenu track={track} />
        </div>
        <ArtistLinks item={track} />
      </div>
    </div>
  );
};

export default TrackCard;
