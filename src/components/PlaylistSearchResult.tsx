import {
  Avatar,
  ListItem,
  ListItemAvatar,
  ListItemButton,
  ListItemSecondaryAction,
  ListItemText,
  Typography,
} from "@mui/material";
import DOMPurify from "dompurify";
import React from "react";
import { Link } from "react-router-dom";
import { PlaylistInfo } from "../plugintypes";
import { getThumbnailImage, searchThumbnailSize } from "../utils";
import ItemMenu from "./ItemMenu";

interface PlaylistSearchResultProps {
  playlist: PlaylistInfo;
  pluginId: string;
}

const PlaylistSearchResult: React.FC<PlaylistSearchResultProps> = (props) => {
  const { playlist, pluginId } = props;
  const sanitizer = DOMPurify.sanitize;

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
        <ItemMenu itemType={{ type: "playlist", item: playlist }} />
      </ListItemSecondaryAction>
    </ListItem>
  );
};

export default React.memo(PlaylistSearchResult);
