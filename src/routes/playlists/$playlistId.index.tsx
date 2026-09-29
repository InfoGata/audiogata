import AddPlaylistDialog from "@/components/AddPlaylistDialog";
import ConvertTracksDialog from "@/components/ConvertTracksDialog";
import { DropdownItemProps } from "@/components/DropdownItem";
import EditPlaylistDialog from "@/components/EditPlaylistDialog";
import ImportDialog from "@/components/ImportDialog";
import PlayButton from "@/components/PlayButton";
import PlaylistMenu from "@/components/PlaylistMenu";
import SelectTrackListPlugin from "@/components/SelectTrackListPlugin";
import Title from "@/components/Title";
import TrackList from "@/components/TrackList";
import { Button } from "@/components/ui/button";
import { db } from "@/database";
import useSelected from "@/hooks/useSelected";
import { Playlist, Track } from "@/plugintypes";
import { useAppDispatch } from "@/store/hooks";
import { addPlaylistTracks, setPlaylistTracks } from "@/sync/library";
import { usePlaylist, usePlaylists } from "@/sync/useLibrary";
import { playQueue, setTrack, setTracks } from "@/store/reducers/trackReducer";
import { ItemMenuType } from "@/types";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { InfoIcon, PencilIcon, Trash, TrashIcon } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";
import { MdUploadFile } from "react-icons/md";

const PlaylistTracks: React.FC = () => {
  const { playlistId } = Route.useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [openEditMenu, setOpenEditMenu] = React.useState(false);
  const [openConvertDialog, setOpenConvertDialog] = React.useState(false);
  const [importDialogOpen, setImportDialogOpen] = React.useState(false);

  const { t } = useTranslation();
  const playlist = usePlaylist(playlistId);
  const tracks = React.useMemo(() => playlist?.tracks ?? [], [playlist]);

  const onDelete = async (item?: ItemMenuType) => {
    if (playlist && item?.type === "track") {
      const newTracklist = tracks.filter((t) => t.id !== item.item.id);
      setPlaylistTracks(playlist, newTracklist);
    }
  };

  const trackMenuItems: DropdownItemProps[] = [
    { title: t("delete"), icon: <Trash />, action: onDelete },
    {
      title: t("info"),
      icon: <InfoIcon />,
      action: (item) =>
        navigate({
          to: "/playlists/$playlistId/tracks/$trackId",
          params: { playlistId, trackId: item?.item.id || "" },
        }),
    },
  ];

  const clearSelectedTracks = async () => {
    await db.audioBlobs.bulkDelete(Array.from(selected));
    if (playlist) {
      const newTracklist = tracks.filter((t) => !selected.has(t.id ?? ""));
      setPlaylistTracks(playlist, newTracklist);
    }
  };

  const onConvertTracksOpen = () => {
    setOpenConvertDialog(true);
  };

  const openImportDialog = () => {
    setImportDialogOpen(true);
  };
  const closeImportDialog = () => {
    setImportDialogOpen(false);
  };

  const onImport = (item: Track[] | Playlist) => {
    if (playlist && Array.isArray(item)) {
      addPlaylistTracks(playlist, item);
      closeImportDialog();
    }
  };
  const allPlaylists = usePlaylists();
  const playlists = React.useMemo(
    () => allPlaylists.filter((p) => p.id !== playlistId),
    [allPlaylists, playlistId]
  );

  const { onSelect, onSelectAll, isSelected, selected, setSelected } =
    useSelected(tracks || []);

  const [playlistDialogOpen, setPlaylistDialogOpen] = React.useState(false);

  const selectedTracks = tracks.filter((t) => selected.has(t.id ?? ""));

  const onEditMenuOpen = () => {
    setOpenEditMenu(true);
  };

  const playPlaylist = () => {
    if (!playlist) {
      return;
    }

    dispatch(setTracks(tracks));
    dispatch(playQueue());
  };

  const onTrackClick = (track: Track) => {
    dispatch(setTrack(track));
    dispatch(setTracks(tracks));
  };

  const onDragOver = (trackList: Track[]) => {
    if (playlist) {
      setPlaylistTracks(playlist, trackList);
    }
  };

  const menuItems: DropdownItemProps[] = [
    {
      title: t("importTrackByUrl"),
      icon: <MdUploadFile />,
      action: openImportDialog,
    },
  ];

  const selectedMenuItems: DropdownItemProps[] = [
    {
      title: t("deleteSelectedTracks"),
      icon: <TrashIcon />,
      action: clearSelectedTracks,
    },
    {
      title: t("convertSelectedTracks"),
      icon: <PencilIcon />,
      action: onConvertTracksOpen,
    },
  ];

  return (
    <>
      {playlist ? (
        <>
          <div className="flex">
            <Title title={playlist.name} />
            <Button variant="ghost" size="icon" onClick={onEditMenuOpen}>
              <PencilIcon />
            </Button>
          </div>
          <PlayButton onClick={playPlaylist} />
          <PlaylistMenu
            selected={selected}
            tracklist={tracks}
            playlists={playlists}
            dropdownItems={menuItems}
            selectedDropdownItems={selectedMenuItems}
          />
          <SelectTrackListPlugin trackList={tracks} setSelected={setSelected} />
          <TrackList
            tracks={tracks}
            onTrackClick={onTrackClick}
            onDragOver={onDragOver}
            onSelect={onSelect}
            isSelected={isSelected}
            onSelectAll={onSelectAll}
            selected={selected}
            menuItems={trackMenuItems}
          />
          <EditPlaylistDialog
            open={openEditMenu}
            setOpen={setOpenEditMenu}
            playlist={playlist}
          />
          <AddPlaylistDialog
            tracks={selectedTracks}
            open={playlistDialogOpen}
            setOpen={setPlaylistDialogOpen}
          />
          <ImportDialog
            open={importDialogOpen}
            parseType="track"
            onSuccess={onImport}
            setOpen={setImportDialogOpen}
          />
          {openConvertDialog && (
            <ConvertTracksDialog
              playlist={playlist}
              tracks={selectedTracks}
              open={openConvertDialog}
              setOpen={setOpenConvertDialog}
            />
          )}
        </>
      ) : (
        <h3>{t("notFound")}</h3>
      )}
    </>
  );
};

export const Route = createFileRoute("/playlists/$playlistId/")({
  component: PlaylistTracks,
});
