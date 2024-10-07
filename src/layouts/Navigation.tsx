import { ListMusicIcon, ListPlusIcon, MenuIcon } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";
import {
  FaCircleInfo,
  FaComments,
  FaGear,
  FaHouse,
  FaPuzzlePiece,
  FaStar,
} from "react-icons/fa6";
import AddPlaylistDialog from "../components/AddPlaylistDialog";
import { NavigationLinkItem } from "../types";
import NavigationLink from "./NavigationLink";
import { useChatWindow } from "react-chatbotify";
import { useAppSelector } from "@/store/hooks";

const Navigation: React.FC = () => {
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const enableChatBot = useAppSelector((state) => state.settings.enableChatBot);
  const { t } = useTranslation();
  const { toggleChatWindow } = useChatWindow();

  const openDialog = () => {
    setDialogOpen(true);
  };

  const listItems: (NavigationLinkItem | undefined)[] = [
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
    enableChatBot ? {
      title: t("chatbot"),
      icon: <FaComments />,
      action: toggleChatWindow,
    } : undefined,
  ];
  const definedListItems = listItems.filter(
    (li): li is NavigationLinkItem => !!li
  );

  return (
    <>
      <div className="flex flex-col gap-1">
        {definedListItems.map((l) => (
          <NavigationLink key={l.title} item={l} />
        ))}
      </div>
      <AddPlaylistDialog open={dialogOpen} setOpen={setDialogOpen} />
    </>
  );
};

export default React.memo(Navigation);
