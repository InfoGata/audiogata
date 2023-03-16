import { MoreHoriz } from "@mui/icons-material";
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
import { Link } from "react-router-dom";
import useItemMenu from "../hooks/useItemMenu";
import { Album } from "../plugintypes";
import { getThumbnailImage, searchThumbnailSize } from "../utils";

interface AlbumSearchResultProps {
  album: Album;
  pluginId: string;
}

const AlbumSearchResult: React.FC<AlbumSearchResultProps> = (props) => {
  const { album, pluginId } = props;
  const { openMenu } = useItemMenu();

  const openAlbumMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (openMenu) {
      openMenu(event, { type: "album", item: album });
    }
  };

  const image = getThumbnailImage(album.images, searchThumbnailSize);

  return (
    <ListItem disablePadding>
      <ListItemButton
        component={Link}
        to={`/plugins/${pluginId}/albums/${album.apiId}`}
        state={album}
      >
        <ListItemAvatar>
          <Avatar alt={album.name} src={image} style={{ borderRadius: 0 }} />
        </ListItemAvatar>
        <ListItemText
          primary={album.name}
          secondary={
            <>
              <Typography
                component="span"
                variant="body2"
                color="text.secondary"
              >
                {album.artistName}
              </Typography>
              {album.addtionalArtists?.map((a) => (
                <>
                  {", "}
                  <Typography
                    component="span"
                    variant="body2"
                    color="text.secondary"
                  >
                    {a.name}
                  </Typography>
                </>
              ))}
            </>
          }
        />
      </ListItemButton>
      <ListItemSecondaryAction>
        <IconButton onClick={openAlbumMenu} size="large">
          <MoreHoriz />
        </IconButton>
      </ListItemSecondaryAction>
    </ListItem>
  );
};

export default React.memo(AlbumSearchResult);
