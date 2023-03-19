import React from "react";
import { db } from "./database";
import { ListItemIcon, ListItemText, Menu, MenuItem } from "@mui/material";
import { useSnackbar } from "notistack";
import { useTranslation } from "react-i18next";
import {
  Person,
  Star,
  StarBorder,
  Link as LinkIcon,
} from "@mui/icons-material";
import { ItemMenuType } from "./types";
import Dexie from "dexie";
import { Link } from "react-router-dom";

export interface ItemMenuInterface {
  openItemMenu: (
    event: React.MouseEvent<HTMLButtonElement>,
    item: ItemMenuType
  ) => Promise<void>;
}

const ItemMenuContext = React.createContext<ItemMenuInterface>(undefined!);

const getTable = (item: ItemMenuType): Dexie.Table => {
  switch (item.type) {
    case "album":
      return db.favoriteAlbums;
    case "artist":
      return db.favoriteArtists;
    case "playlist":
      return db.favoritePlaylists;
    case "track":
      return db.favoriteTracks;
  }
};

export const ItemMenuProvider: React.FC<React.PropsWithChildren> = (props) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [menuItem, setMenuItem] = React.useState<ItemMenuType>();
  const [isFavorited, setIsFavorited] = React.useState(false);
  const closeMenu = () => setAnchorEl(null);
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();

  const openItemMenu = async (
    event: React.MouseEvent<HTMLButtonElement>,
    itemType: ItemMenuType
  ) => {
    event.stopPropagation();
    event.preventDefault();
    setAnchorEl(event.currentTarget);
    setMenuItem(itemType);
    const table = getTable(itemType);
    if (itemType.item.pluginId && itemType.item.apiId) {
      const hasFavorite = await table.get({
        pluginId: itemType.item.pluginId,
        apiId: itemType.item.apiId,
      });
      setIsFavorited(!!hasFavorite);
    } else if (itemType.item.id) {
      const hasFavorite = await table.get(itemType.item.id);
      setIsFavorited(!!hasFavorite);
    } else {
      setIsFavorited(false);
    }
  };

  const onFavorite = async () => {
    if (menuItem) {
      const table = getTable(menuItem);
      await table.add(menuItem.item);
      enqueueSnackbar(t("addedToFavorites"));
    }
  };

  const removeFavorite = async () => {
    if (menuItem?.item?.id) {
      const table = getTable(menuItem);
      await table.delete(menuItem.item.id);
      enqueueSnackbar(t("removedFromFavorites"));
    }
  };

  const defaultContext: ItemMenuInterface = {
    openItemMenu,
  };

  return (
    <ItemMenuContext.Provider value={defaultContext}>
      {props.children}
      <Menu
        open={Boolean(anchorEl)}
        onClick={closeMenu}
        onClose={closeMenu}
        anchorEl={anchorEl}
      >
        <MenuItem onClick={isFavorited ? removeFavorite : onFavorite}>
          <ListItemIcon>{isFavorited ? <StarBorder /> : <Star />}</ListItemIcon>
          <ListItemText
            primary={
              isFavorited ? t("removeFromFavorites") : t("addToFavorites")
            }
          />
        </MenuItem>
        {menuItem?.type === "album" && menuItem.item.artistApiId && (
          <MenuItem
            component={Link}
            to={`/plugins/${menuItem.item.pluginId}/artists/${menuItem.item.artistApiId}`}
          >
            <ListItemIcon>
              <Person />
            </ListItemIcon>
            <ListItemText primary={t("goToArtist")} />
          </MenuItem>
        )}
        {menuItem?.item.originalUrl && (
          <MenuItem
            component="a"
            href={menuItem.item.originalUrl}
            target="_blank"
          >
            <ListItemIcon>
              <LinkIcon />
            </ListItemIcon>
            <ListItemText primary={t("originalUrl")} />
          </MenuItem>
        )}
      </Menu>
    </ItemMenuContext.Provider>
  );
};

export default ItemMenuContext;
