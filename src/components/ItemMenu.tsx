import { addFavorite, removeFavorite } from "@/sync/library";
import type { FavoriteType } from "@/sync/library-doc";
import { useIsFavorite } from "@/sync/useLibrary";
import { ItemMenuType } from "@/types";
import {
  ExternalLink,
  MoreHorizontal,
  StarIcon,
  StarOffIcon,
} from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import DropdownItem, { DropdownItemProps } from "./DropdownItem";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { MdPerson } from "react-icons/md";
import { pluginContentPath } from "@/lib/plugin-route";

interface Props {
  itemType: ItemMenuType;
  dropdownItems?: DropdownItemProps[];
  noFavorite?: boolean;
  noArtist?: boolean;
}

const favoriteTypes: Record<ItemMenuType["type"], FavoriteType> = {
  track: "tracks",
  playlist: "playlists",
  album: "albums",
  artist: "artists",
};

const ItemMenu: React.FC<Props> = (props) => {
  const { itemType, dropdownItems, noFavorite, noArtist } = props;
  const [, setOpen] = React.useState(false);
  const { t } = useTranslation();
  const favoriteType = favoriteTypes[itemType.type];
  const isFavorited = useIsFavorite(favoriteType, itemType.item);

  const onFavorite = async () => {
    await addFavorite(favoriteType, itemType.item);
    toast(t("addedToFavorites"));
  };

  const onRemoveFavorite = async () => {
    await removeFavorite(favoriteType, itemType.item);
    toast(t("removedFromFavorites"));
  };

  const items: (DropdownItemProps | undefined)[] = [
    !noFavorite
      ? {
          title: isFavorited ? t("removeFromFavorites") : t("addToFavorites"),
          icon: isFavorited ? <StarOffIcon /> : <StarIcon />,
          action: isFavorited ? onRemoveFavorite : onFavorite,
        }
      : undefined,
    itemType.type === "album" && !noArtist
      ? {
          title: t("goToArtist"),
          icon: <MdPerson />,
          internalPath: pluginContentPath(
            itemType.item.pluginId || "",
            "artists",
            itemType.item.artistApiId || ""
          ),
        }
      : undefined,
    itemType.item.originalUrl
      ? {
          title: t("originalUrl"),
          icon: <ExternalLink />,
          url: itemType.item.originalUrl,
        }
      : undefined,
    ...(dropdownItems || []),
  ];

  const definedItems = items.filter((i): i is DropdownItemProps => !!i);
  return (
    <DropdownMenu onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <MoreHorizontal className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {definedItems.map((i) => (
          <DropdownItem
            key={i.title}
            {...i}
            item={itemType}
            setOpen={setOpen}
          />
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ItemMenu;
