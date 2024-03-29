import { PlaylistInfo, Track } from "@/plugintypes";
import React from "react";
import DropdownPlaylistMenuItem from "./DropdownPlaylistMenuItem";
import {
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "./ui/dropdown-menu";

type Props = {
  title: string;
  playlists: PlaylistInfo[];
  tracks: Track[];
};

const PlaylistSubMenu: React.FC<Props> = (props) => {
  const { playlists, tracks, title } = props;

  return playlists.length > 0 ? (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger>
        <span>{title}</span>
      </DropdownMenuSubTrigger>
      <DropdownMenuPortal>
        <DropdownMenuSubContent>
          {playlists.map((p) => (
            <DropdownPlaylistMenuItem key={p.id} playlist={p} tracks={tracks} />
          ))}
        </DropdownMenuSubContent>
      </DropdownMenuPortal>
    </DropdownMenuSub>
  ) : null;
};

export default PlaylistSubMenu;
