import { usePlaylists } from "@/sync/useLibrary";
import { Link, createFileRoute } from "@tanstack/react-router";
import PlaylistListItem from "@/components/PlaylistListItem";
import { Button, buttonVariants } from "@/components/ui/button";
import { Trash } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";
import { PluginFrameContainer } from "../contexts/PluginsContext";
import ImportDialog from "../components/ImportDialog";
import usePlugins from "../hooks/usePlugins";
import { Playlist, Track } from "../plugintypes";
import { addPlaylist, deletePlaylist } from "@/sync/library";
import { filterAsync } from "@infogata/utils";
import { ItemMenuType } from "@/types";
import { toast } from "sonner";
import Title from "@/components/Title";

const Playlists: React.FC = () => {
  const { plugins } = usePlugins();
  const [playlistPlugins, setPlaylistPlugins] = React.useState<
    PluginFrameContainer[]
  >([]);
  const playlists = usePlaylists();
  const { t } = useTranslation();
  const [openImportDialog, setOpenImportDialog] = React.useState(false);
  const onOpenImportDialog = () => setOpenImportDialog(true);

  const pluginPlaylists = playlistPlugins.map((p) => (
    <Link
      className={buttonVariants({ variant: "outline" })}
      key={p.id}
      to="/s/$pluginId/playlists"
      params={{ pluginId: p.id || "" }}
      search={{ isUserPlaylist: true }}
    >
      {p.name}
    </Link>
  ));

  React.useEffect(() => {
    const setPlugins = async () => {
      const filteredPlugins = await filterAsync(
        plugins,
        async (p: any) =>
          (await p.hasDefined.onGetUserPlaylists()) &&
          (await p.hasDefined.onGetPlaylistTracks())
      );
      setPlaylistPlugins(filteredPlugins);
    };
    setPlugins();
  }, [plugins]);

  const onDelete = (item?: ItemMenuType) => {
    if (item?.type === "playlist") {
      deletePlaylist(item.item);
    }
  };

  const onImport = (item: Playlist | Track[]) => {
    if ("tracks" in item) {
      addPlaylist(item);
      toast(t("playlistImported", { playlistName: item.name }));
    }
  };

  return (
    <>
      <div className="mb-2">
        <Title title={t("playlists")} />
      </div>
      <div className="flex flex-col gap-2">
        <div>
          <Button variant="outline" onClick={onOpenImportDialog}>
            {t("importPlaylistByUrl")}
          </Button>
        </div>
        <div>{pluginPlaylists}</div>
      </div>
      <div>
        {playlists.map((p) => (
          <PlaylistListItem
            key={p.id}
            playlist={p}
            noFavorite={true}
            dropdownItems={[
              {
                icon: <Trash />,
                title: t("delete"),
                action: onDelete,
              },
            ]}
          />
        ))}
      </div>
      <ImportDialog
        setOpen={setOpenImportDialog}
        open={openImportDialog}
        parseType="playlist"
        onSuccess={onImport}
      />
    </>
  );
};

export const Route = createFileRoute("/playlists/")({
  component: Playlists,
});
