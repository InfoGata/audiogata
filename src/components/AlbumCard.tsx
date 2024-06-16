import { Album } from "@/plugintypes";
import { getThumbnailImage, playlistThumbnailSize } from "@/utils";
import DOMPurify from "dompurify";
import React from "react";
import ItemMenu from "./ItemMenu";
import ArtistLinks from "./ArtistLinks";
import { Link } from "@tanstack/react-router";

type Props = {
  album: Album;
  noArtist?: boolean;
};

const AlbumCard: React.FC<Props> = (props) => {
  const { album, noArtist } = props;
  const image = getThumbnailImage(album.images, playlistThumbnailSize);
  const sanitizer = DOMPurify.sanitize;

  return (
    <div className="min-w-64">
      <Link
        to="/plugins/$pluginId/albums/$apiId"
        params={{ pluginId: album.pluginId || "", apiId: album.apiId || "" }}
      >
        <img
          src={image}
          className="rounded-md bg-gray-200 w-full h-64 object-cover"
        />
      </Link>
      <div className="mt-3">
        <div>
          <div className="flex justify-between">
            <Link
              to="/plugins/$pluginId/albums/$apiId"
              params={{
                pluginId: album.pluginId || "",
                apiId: album.apiId || "",
              }}
            >
              <h3
                className="font-medium"
                dangerouslySetInnerHTML={{
                  __html: sanitizer(album.name || ""),
                }}
              />
            </Link>
            <ItemMenu
              itemType={{ type: "album", item: album }}
              noArtist={noArtist}
            />
          </div>
          {!noArtist && <ArtistLinks item={album} />}
        </div>
      </div>
    </div>
  );
};

export default AlbumCard;
