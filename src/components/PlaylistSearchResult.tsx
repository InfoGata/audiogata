import {
  Avatar,
  IconButton,
  ListItem,
  ListItemAvatar,
  ListItemButton,
  ListItemSecondaryAction,
  ListItemText,
  Typography,
} from "@mui/material";
import React from "react";
import { PlaylistInfo } from "../plugintypes";
import { getThumbnailImage, searchThumbnailSize } from "../utils";
import DOMPurify from "dompurify";
import { Link } from "react-router-dom";
import { MoreHoriz } from "@mui/icons-material";
import useItemMenu from "../hooks/useItemMenu";

interface PlaylistSearchResultProps {
  playlist: PlaylistInfo;
  pluginId: string;
}

const PlaylistSearchResult: React.FC<PlaylistSearchResultProps> = (props) => {
  const { playlist, pluginId } = props;
  const sanitizer = DOMPurify.sanitize;

  const { openMenu } = useItemMenu();

  const openPlaylistMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (openMenu) {
      openMenu(event, { type: "playlist", item: playlist });
    }
  };

  const image = getThumbnailImage(playlist.images, searchThumbnailSize);
  return (
    <ListItem disablePadding>
      <ListItemButton
        component={Link}
        to={`/plugins/${pluginId}/playlists/${playlist.apiId}`}
        state={playlist}
      >
        <ListItemAvatar>
          <Avatar alt={playlist.name} src={image} style={{ borderRadius: 0 }} />
        </ListItemAvatar>
        <ListItemText
          primary={
            <Typography
              dangerouslySetInnerHTML={{
                __html: sanitizer(playlist?.name || ""),
              }}
            />
          }
        />
      </ListItemButton>
      <ListItemSecondaryAction>
        <IconButton onClick={openPlaylistMenu} size="large">
          <MoreHoriz />
        </IconButton>
      </ListItemSecondaryAction>
    </ListItem>
  );
};

export default React.memo(PlaylistSearchResult);
