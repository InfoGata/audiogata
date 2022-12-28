import {
  Avatar,
  ListItem,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  Typography,
} from "@mui/material";
import React from "react";
import { Link } from "react-router-dom";
import { Album } from "../plugintypes";
import { getThumbnailImage, searchThumbnailSize } from "../utils";

interface AlbumSearchResultProps {
  album: Album;
  pluginId: string;
}

const AlbumSearchResult: React.FC<AlbumSearchResultProps> = (props) => {
  const { album, pluginId } = props;

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
    </ListItem>
  );
};

export default React.memo(AlbumSearchResult);
