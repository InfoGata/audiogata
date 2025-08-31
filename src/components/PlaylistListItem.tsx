import { getThumbnailImage } from "@infogata/utils";
import { searchThumbnailSize } from "@/utils";
import React from "react";
import { AvatarImage, Avatar } from "./ui/avatar";
import ItemMenu from "./ItemMenu";
import { ItemMenuType } from "@/types";
import { PlaylistInfo } from "@/plugintypes";
import { DropdownItemProps } from "./DropdownItem";
import { Link } from "@tanstack/react-router";

type Props = {
  playlist: PlaylistInfo;
  dropdownItems?: DropdownItemProps[];
  noFavorite?: boolean;
  isUserPlaylist?: boolean;
  selected?: boolean;
};

const PlaylistListItem: React.FC<Props> = (props) => {
  const { playlist, dropdownItems, noFavorite, isUserPlaylist } = props;
  const image = getThumbnailImage(playlist.images, searchThumbnailSize);
  const itemType: ItemMenuType = { type: "playlist", item: playlist };
  let playlistPath = playlist.pluginId
    ? `/plugins/${playlist.pluginId}/playlists/${playlist.apiId}`
    : `/playlists/${playlist.id}`;

  if (isUserPlaylist) {
    playlistPath = `${playlistPath}?isuserplaylist`;
  }

  return (
    <Link
      to={playlistPath}
      className="flex items-center transition-all hover:bg-accent hover:text-accent-foreground p-2"
    >
      <Avatar className="size-10 rounded-none">
        <AvatarImage src={image} />
      </Avatar>
      <div className="ml-4 space-y-1">
        <p className="text-sm font-medium leading-none">{playlist.name}</p>
      </div>
      <div className="ml-auto font-medium">
        <ItemMenu
          itemType={itemType}
          dropdownItems={dropdownItems}
          noFavorite={noFavorite}
        />
      </div>
    </Link>
  );
};

export default PlaylistListItem;
