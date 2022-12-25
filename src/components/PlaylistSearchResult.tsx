import {
  Avatar,
  ListItem,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  Typography,
} from "@mui/material";
import React from "react";
import { PlaylistInfo } from "../plugintypes";
import { getThumbnailImage, searchThumbnailSize } from "../utils";
import DOMPurify from "dompurify";
import { Link } from "react-router-dom";

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
    </ListItem>
  );
};

export default React.memo(PlaylistSearchResult);
