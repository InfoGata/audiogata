import { DropdownItemProps } from "@/components/DropdownItem";
import ImportDialog from "@/components/ImportDialog";
import PlayButton from "@/components/PlayButton";
import PlaylistMenu from "@/components/PlaylistMenu";
import Spinner from "@/components/Spinner";
import TrackList from "@/components/TrackList";
import { db } from "@/database";
import { Playlist, Track } from "@/plugintypes";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { playQueue, setTrack, setTracks } from "@/store/reducers/trackReducer";
import { createFileRoute } from "@tanstack/react-router";
import { useLiveQuery } from "dexie-react-hooks";
import { FileUpIcon } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";

const FavoriteTracks: React.FC = () => {
  const dispatch = useAppDispatch();
  const playlists = useAppSelector((state) => state.playlist.playlists);
  const { t } = useTranslation();
  const [importDialogOpen, setImportDialogOpen] = React.useState(false);

  const tracks = useLiveQuery(() => db.favoriteTracks.toArray());

  const onTrackClick = (track: Track) => {
    dispatch(setTrack(track));
    dispatch(setTracks(tracks || []));
  };

  const openImportDialog = () => {
    setImportDialogOpen(true);
  };
  const closeImportDialog = () => {
    setImportDialogOpen(false);
  };

  const onImport = async (item: Track[] | Playlist) => {
    if (Array.isArray(item)) {
      await db.favoriteTracks.bulkAdd(item);
      closeImportDialog();
    }
  };

  const onPlay = () => {
    if (!tracks) return;
    dispatch(setTracks(tracks));
    dispatch(playQueue());
  };

  const dropdownItems: DropdownItemProps[] = [
    {
      title: t("importTrackByUrl"),
      icon: <FileUpIcon />,
      action: openImportDialog,
    },
  ];

  if (!tracks) {
    return <Spinner />;
  }

  return (
    <div>
      <PlayButton onClick={onPlay} />
      <PlaylistMenu
        playlists={playlists}
        tracklist={tracks ?? []}
        dropdownItems={dropdownItems}
      />
      <TrackList tracks={tracks || []} onTrackClick={onTrackClick} />
      <ImportDialog
        open={importDialogOpen}
        parseType="track"
        onSuccess={onImport}
        setOpen={setImportDialogOpen}
      />
    </div>
  );
};

export const Route = createFileRoute("/favorites/tracks")({
  component: FavoriteTracks,
});
