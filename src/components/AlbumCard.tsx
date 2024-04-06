import { Album } from "@/plugintypes";
import { getThumbnailImage, playlistThumbnailSize } from "@/utils";
import DOMPurify from "dompurify";
import React from "react";
import { Link } from "react-router-dom";
import ItemMenu from "./ItemMenu";
import ArtistLinks from "./ArtistLinks";

type Props = {
  album: Album;
};

const AlbumCard: React.FC<Props> = (props) => {
  const { album } = props;
  const image = getThumbnailImage(album.images, playlistThumbnailSize);
  const url = `/plugins/${album.pluginId}/albums/${album.apiId}`;
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
                  __html: sanitizer(album.name || ""),
                }}
              />
            </Link>
            <ItemMenu itemType={{ type: "album", item: album }} />
          </div>
          <ArtistLinks item={album} />
        </div>
      </div>
    </div>
  );
};

export default AlbumCard;
