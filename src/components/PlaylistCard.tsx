import ItemMenu from "@/components/ItemMenu";
import { PlaylistInfo } from "@/plugintypes";
import { getThumbnailImage, playlistThumbnailSize } from "@/utils";
import { Link } from "@tanstack/react-router";
import DOMPurify from "dompurify";
import React from "react";

type Props = {
  playlist: PlaylistInfo;
};

const PlaylistCard: React.FC<Props> = (props) => {
  const { playlist } = props;
  const image = getThumbnailImage(playlist.images, playlistThumbnailSize);
  const sanitizer = DOMPurify.sanitize;

  return (
    <div className="min-w-64">
      <Link
        to="/plugins/$pluginId/playlists/$apiId"
        params={{ pluginId: playlist.pluginId || "", apiId: playlist.apiId || "" }}
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
              to="/plugins/$pluginId/playlists/$apiId"
              params={{
                pluginId: playlist.pluginId || "",
                apiId: playlist.apiId || "",
              }}
            >
              <h3
                className="font-medium"
                dangerouslySetInnerHTML={{
                  __html: sanitizer(playlist.name || ""),
                }}
              />
            </Link>
            <ItemMenu itemType={{ type: "playlist", item: playlist }} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlaylistCard;