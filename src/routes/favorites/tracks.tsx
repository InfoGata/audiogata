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
import { createFileRoute, Link } from "@tanstack/react-router";
import { useLiveQuery } from "dexie-react-hooks";
import { FileUpIcon, LibraryIcon } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";
import usePlugins from "@/hooks/usePlugins";
import { Button } from "@/components/ui/button";

const FavoriteTracks: React.FC = () => {
  const dispatch = useAppDispatch();
  const playlists = useAppSelector((state) => state.playlist.playlists);
  const { t } = useTranslation();
  const [importDialogOpen, setImportDialogOpen] = React.useState(false);
  const { plugins } = usePlugins();
  const [libraryPlugins, setLibraryPlugins] = React.useState<Array<{id: string, name: string}>>([]);

  React.useEffect(() => {
    const checkPlugins = async () => {
      const availablePlugins = [];
      for (const plugin of plugins) {
        if (plugin.id && plugin.name && await plugin.hasDefined.onGetLibraryTracks()) {
          availablePlugins.push({ id: plugin.id, name: plugin.name });
        }
      }
      setLibraryPlugins(availablePlugins);
    };
    checkPlugins();
  }, [plugins]);

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
      
      {libraryPlugins.length > 0 && (
        <div className="mb-4 p-4 border rounded-lg">
          <h3 className="text-lg font-semibold mb-2 flex items-center">
            <LibraryIcon className="mr-2" size={20} />
            {t("pluginLibraries")}
          </h3>
          <div className="flex gap-2 flex-wrap">
            {libraryPlugins.map((plugin) => (
              <Button key={plugin.id} variant="outline" asChild>
                <Link to="/plugins/$pluginId/library" params={{ pluginId: plugin.id }}>
                  {plugin.name} {t("library")}
                </Link>
              </Button>
            ))}
          </div>
        </div>
      )}
      
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
