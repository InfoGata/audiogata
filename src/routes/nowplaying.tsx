import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { DropdownItemProps } from "@/components/DropdownItem";
import { ItemMenuType } from "@/types";
import { InfoIcon, TrashIcon } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";
import PlaylistMenu from "../components/PlaylistMenu";
import SelectTrackListPlugin from "../components/SelectTrackListPlugin";
import TrackList from "../components/TrackList";
import { db } from "../database";
import useSelected from "../hooks/useSelected";
import { Track } from "../plugintypes";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  clearTracks,
  deleteTrack,
  deleteTracks,
  setTrack,
  setTracks,
} from "../store/reducers/trackReducer";
import { Button } from "@/components/ui/button";
import Title from "@/components/Title";

const NowPlaying: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const onDelete = async (item?: ItemMenuType) => {
    if (item?.type === "track") {
      const track = item.item;
      if (track?.id) {
        await db.audioBlobs.delete(track.id);
      }
      if (track) {
        dispatch(deleteTrack(track));
      }
    }
  };

  const trackMenuItems: DropdownItemProps[] = [
    { title: t("delete"), icon: <TrashIcon />, action: onDelete },
    {
      title: t("info"),
      icon: <InfoIcon />,
      action: (item) =>
        navigate({
          to: "/tracks/$trackId",
          params: { trackId: item?.item.id || "" },
        }),
    },
  ];

  const trackList = useAppSelector((state) => state.track.tracks);

  const { onSelect, onSelectAll, isSelected, selected, setSelected } =
    useSelected(trackList);

  const clearSelectedTracks = () => {
    dispatch(deleteTracks(selected));
  };

  const playlists = useAppSelector((state) => state.playlist.playlists);

  const onTrackClick = (track: Track) => {
    dispatch(setTrack(track));
  };

  const clearQueue = () => {
    dispatch(clearTracks());
  };

  const onDragOver = (newTrackList: Track[]) => {
    dispatch(setTracks(newTrackList));
  };

  const menuItems: DropdownItemProps[] = [
    {
      title: t("clearAllTracks"),
      icon: <TrashIcon />,
      action: clearQueue,
    },
  ];

  const selectedMenuItems = [
    {
      title: t("deleteSelectedTracks"),
      icon: <TrashIcon />,
      action: clearSelectedTracks,
    },
  ];

  return (
    <>
      <Title title={t("playQueue")} />
      <Button
        variant="ghost"
        size="icon"
        aria-label="clear"
        onClick={clearQueue}
      >
        <TrashIcon />
      </Button>
      <PlaylistMenu
        noQueueItem={true}
        selected={selected}
        tracklist={trackList}
        playlists={playlists}
        dropdownItems={menuItems}
        selectedDropdownItems={selectedMenuItems}
      />
      <SelectTrackListPlugin trackList={trackList} setSelected={setSelected} />
      <TrackList
        tracks={trackList}
        onTrackClick={onTrackClick}
        onDragOver={onDragOver}
        onSelect={onSelect}
        isSelected={isSelected}
        onSelectAll={onSelectAll}
        selected={selected}
        menuItems={trackMenuItems}
        noQueueItem={true}
      />
    </>
  );
};

export const Route = createFileRoute("/nowplaying")({
  component: NowPlaying,
});
