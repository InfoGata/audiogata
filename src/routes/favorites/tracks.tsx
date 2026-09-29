import { useFavorites, usePlaylists } from "@/sync/useLibrary";
import { DropdownItemProps } from "@/components/DropdownItem";
import ImportDialog from "@/components/ImportDialog";
import PlayButton from "@/components/PlayButton";
import PlaylistMenu from "@/components/PlaylistMenu";
import TrackList from "@/components/TrackList";
import { addFavorites } from "@/sync/library";
import { Playlist, Track } from "@/plugintypes";
import { useAppDispatch } from "@/store/hooks";
import { playQueue, setTrack, setTracks } from "@/store/reducers/trackReducer";
import { createFileRoute, Link } from "@tanstack/react-router";
import { FileUpIcon, LibraryIcon } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";
import usePlugins from "@/hooks/usePlugins";
import { Button } from "@/components/ui/button";

const FavoriteTracks: React.FC = () => {
  const dispatch = useAppDispatch();
  const playlists = usePlaylists();
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

  const tracks = useFavorites("tracks");

  const onTrackClick = (track: Track) => {
    dispatch(setTrack(track));
    dispatch(setTracks(tracks));
  };

  const openImportDialog = () => {
    setImportDialogOpen(true);
  };
  const closeImportDialog = () => {
    setImportDialogOpen(false);
  };

  const onImport = async (item: Track[] | Playlist) => {
    if (Array.isArray(item)) {
      await addFavorites("tracks", item);
      closeImportDialog();
    }
  };

  const onPlay = () => {
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

  return (
    <div>
      <PlayButton onClick={onPlay} />
      <PlaylistMenu
        playlists={playlists}
        tracklist={tracks}
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
                <Link to="/s/$pluginId/library" params={{ pluginId: plugin.id }}>
                  {plugin.name} {t("library")}
                </Link>
              </Button>
            ))}
          </div>
        </div>
      )}
      
      <TrackList tracks={tracks} onTrackClick={onTrackClick} />
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
