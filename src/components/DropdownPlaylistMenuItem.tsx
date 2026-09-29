import React from "react";
import { DropdownMenuItem } from "./ui/dropdown-menu";
import { PlaylistInfo, Track } from "@/plugintypes";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { addPlaylistTracks } from "@/sync/library";

type Props = {
  playlist: PlaylistInfo;
  tracks: Track[];
};

const DropdownPlaylistMenuItem: React.FC<Props> = (props) => {
  const { playlist, tracks } = props;
  const { t } = useTranslation();

  const addToPlaylist = () => {
    if (playlist.id) {
      addPlaylistTracks(playlist, tracks);
      toast(
        t("addedTracksToPlaylist", {
          playlistName: playlist.name,
          count: tracks.length,
        })
      );
    }
  };
  return (
    <DropdownMenuItem className="cursor-pointer" onSelect={addToPlaylist}>
      <span>{playlist.name}</span>
    </DropdownMenuItem>
  );
};

export default DropdownPlaylistMenuItem;
