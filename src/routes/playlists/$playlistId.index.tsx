import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { DropdownItemProps } from "@/components/DropdownItem";
import { Button } from "@/components/ui/button";
import { ItemMenuType } from "@/types";
import { useLiveQuery } from "dexie-react-hooks";
import {
  CirclePlayIcon,
  InfoIcon,
  PencilIcon,
  Trash,
  TrashIcon,
} from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";
import { MdUploadFile } from "react-icons/md";
import AddPlaylistDialog from "@/components/AddPlaylistDialog";
import ConvertTracksDialog from "@/components/ConvertTracksDialog";
import EditPlaylistDialog from "@/components/EditPlaylistDialog";
import ImportDialog from "@/components/ImportDialog";
import PlaylistMenu from "@/components/PlaylistMenu";
import SelectTrackListPlugin from "@/components/SelectTrackListPlugin";
import Spinner from "@/components/Spinner";
import TrackList from "@/components/TrackList";
import { db } from "@/database";
import useSelected from "@/hooks/useSelected";
import { Playlist, Track } from "@/plugintypes";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  addPlaylistTracks,
  setPlaylistTracks,
} from "@/store/reducers/playlistReducer";
import { playQueue, setTrack, setTracks } from "@/store/reducers/trackReducer";

const PlaylistTracks: React.FC = () => {
  const { playlistId } = Route.useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [openEditMenu, setOpenEditMenu] = React.useState(false);
  const [openConvertDialog, setOpenConvertDialog] = React.useState(false);
  const [importDialogOpen, setImportDialogOpen] = React.useState(false);

  const { t } = useTranslation();
  const playlist = useLiveQuery(
    () => db.playlists.get(playlistId || ""),
    [playlistId],
    false
  );
  const tracks = (playlist && playlist?.tracks) || [];

  const onDelete = async (item?: ItemMenuType) => {
    if (playlist && item?.type === "track") {
      const newTracklist = tracks.filter((t) => t.id !== item.item.id);
      dispatch(setPlaylistTracks(playlist, newTracklist));
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
      dispatch(setPlaylistTracks(playlist, newTracklist));
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
      dispatch(addPlaylistTracks(playlist, item));
      closeImportDialog();
    }
  };

  const playlists = useAppSelector((state) =>
    state.playlist.playlists.filter((p) => p.id !== playlistId)
  );

  const { onSelect, onSelectAll, isSelected, selected, setSelected } =
    useSelected(tracks || []);
  const playlistInfo = useAppSelector((state) =>
    state.playlist.playlists.find((p) => p.id === playlistId)
  );

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
      dispatch(setPlaylistTracks(playlist, trackList));
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
      <Spinner open={playlist === false} />
      {playlist ? (
        <>
          <div className="flex">
            <h3 className="text-4xl font-bold">{playlistInfo?.name}</h3>
            <Button variant="ghost" size="icon" onClick={onEditMenuOpen}>
              <PencilIcon />
            </Button>
          </div>
          <Button variant="ghost" size="icon" onClick={playPlaylist}>
            <CirclePlayIcon />
          </Button>
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
        <>{playlist !== false && <h3>{t("notFound")}</h3>}</>
      )}
    </>
  );
};

export const Route = createFileRoute("/playlists/$playlistId/")({
  component: PlaylistTracks,
});
