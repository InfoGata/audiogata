import { ListMusicIcon, ListPlusIcon } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";
import {
  FaCircleInfo,
  FaGear,
  FaHouse,
  FaPuzzlePiece,
  FaStar,
} from "react-icons/fa6";
import AddPlaylistDialog from "../components/AddPlaylistDialog";
import { NavigationLinkItem } from "../types";
import NavigationLink from "./NavigationLink";

const Navigation: React.FC = () => {
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const { t } = useTranslation();

  const openDialog = () => {
    setDialogOpen(true);
  };

  const listItems: NavigationLinkItem[] = [
    { title: t("home"), link: "/", icon: <FaHouse /> },
    { title: t("playQueue"), link: "/nowplaying", icon: <ListMusicIcon /> },
    { title: t("plugins"), link: "/plugins", icon: <FaPuzzlePiece /> },
    { title: t("settings"), link: "/settings", icon: <FaGear /> },
    { title: t("about"), link: "/about", icon: <FaCircleInfo /> },
    { title: t("favorites"), link: "/favorites/tracks", icon: <FaStar /> },
    {
      title: t("playlists"),
      link: "/playlists",
      icon: <ListPlusIcon />,
      action: openDialog,
    },
  ];

  return (
    <>
      <div className="flex flex-col">
        {listItems.map((l) => (
          <NavigationLink key={l.title} item={l} />
        ))}
      </div>
      <AddPlaylistDialog open={dialogOpen} setOpen={setDialogOpen} />
    </>
  );
};

export default React.memo(Navigation);
