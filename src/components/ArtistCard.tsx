import ItemMenu from "@/components/ItemMenu";
import { Artist } from "@/plugintypes";
import { getThumbnailImage, playlistThumbnailSize } from "@/utils";
import DOMPurify from "dompurify";
import React from "react";
import { Link } from "react-router-dom";

type Props = {
  artist: Artist;
};

const ArtistCard: React.FC<Props> = (props) => {
  const { artist } = props;
  const image = getThumbnailImage(artist.images, playlistThumbnailSize);
  const url = `/plugins/${artist.pluginId}/artists/${artist.apiId}`;
  const sanitizer = DOMPurify.sanitize;

  return (
    <div>
      <Link to={url}>
        <img
          src={image}
          className="rounded-md bg-gray-200 w-full h-64 object-cover"
        />
      </Link>
      <div className="mt-3">
        <div>
          <div className="flex justify-between">
            <Link to={url}>
              <h3
                className="font-medium"
                dangerouslySetInnerHTML={{
                  __html: sanitizer(artist.name || ""),
                }}
              />
            </Link>
            <ItemMenu itemType={{ type: "artist", item: artist }} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArtistCard;
