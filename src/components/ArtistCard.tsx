import ItemMenu from "@/components/ItemMenu";
import { Artist } from "@/plugintypes";
import { getThumbnailImage, playlistThumbnailSize } from "@/utils";
import { Link } from "@tanstack/react-router";
import DOMPurify from "dompurify";
import React from "react";

type Props = {
  artist: Artist;
};

const ArtistCard: React.FC<Props> = (props) => {
  const { artist } = props;
  const image = getThumbnailImage(artist.images, playlistThumbnailSize);
  const sanitizer = DOMPurify.sanitize;

  return (
    <div className="min-w-64">
      <Link
        to="/plugins/$pluginId/artists/$apiId"
        params={{ pluginId: artist.pluginId || "", apiId: artist.apiId || "" }}
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
              to="/plugins/$pluginId/artists/$apiId"
              params={{
                pluginId: artist.pluginId || "",
                apiId: artist.apiId || "",
              }}
            >
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
