import { ListMusicIcon, ListPlusIcon, MenuIcon } from "lucide-react";
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
    { title: t("home"), link: { to: "/" }, icon: <FaHouse /> },
    {
      title: t("playQueue"),
      link: { to: "/nowplaying" },
      icon: <ListMusicIcon />,
    },
    { title: t("plugins"), link: { to: "/plugins" }, icon: <FaPuzzlePiece /> },
    { title: t("settings"), link: { to: "/settings" }, icon: <FaGear /> },
    { title: t("about"), link: { to: "/about" }, icon: <FaCircleInfo /> },
    {
      title: t("favorites"),
      link: { to: "/favorites/tracks" },
      icon: <FaStar />,
    },
    { title: t("playlists"), link: { to: "/playlists" }, icon: <MenuIcon /> },
    {
      title: t("addPlaylist"),
      icon: <ListPlusIcon />,
      action: openDialog,
    },
  ];

  return (
    <>
      <div className="flex flex-col gap-1">
        {listItems.map((l) => (
          <NavigationLink key={l.title} item={l} />
        ))}
      </div>
      <AddPlaylistDialog open={dialogOpen} setOpen={setDialogOpen} />
    </>
  );
};

export default React.memo(Navigation);
