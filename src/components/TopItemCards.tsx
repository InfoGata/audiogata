import { MoreHoriz, PlaylistAdd } from "@mui/icons-material";
import {
  Card,
  CardActionArea,
  CardActions,
  CardMedia,
  Fade,
  Grid,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Stack,
  Typography,
} from "@mui/material";
import React from "react";
import { useQuery } from "react-query";
import useTrackMenu from "../hooks/useTrackMenu";
import { usePlugins } from "../PluginsContext";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { addTrack, setTrack } from "../store/reducers/trackReducer";
import { getThumbnailImage, playlistThumbnailSize } from "../utils";
import AddPlaylistDialog from "./AddPlaylistDialog";
import PlaylistMenuItem from "./PlaylistMenuItem";
import SelectPlugin from "./SelectPlugin";

const TopItemCards: React.FC = () => {
  const [pluginId, setPluginId] = React.useState("");
  const { plugins } = usePlugins();
  const dispatch = useAppDispatch();
  const playlists = useAppSelector((state) => state.playlist.playlists);
  const [playlistDialogOpen, setPlaylistDialogOpen] = React.useState(false);
  const closePlaylistDialog = () => setPlaylistDialogOpen(false);
  const { closeMenu, openMenu, anchorEl, menuTrack } = useTrackMenu();

  const getTopItems = async () => {
    const plugin = plugins.find((p) => p.id === pluginId);
    if (plugin) {
      return await plugin.remote.onGetTopItems();
    }
  };

  const query = useQuery(["topitems", pluginId], getTopItems, {
    // Keep query for 5 minutes
    staleTime: 1000 * 60 * 5,
  });

  const topTrackComponents = query.data?.tracks?.items.map((t) => {
    const image = getThumbnailImage(t.images, playlistThumbnailSize);

    const onClickTrack = () => {
      dispatch(addTrack(t));
      dispatch(setTrack(t));
    };

    const openTrackMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
      openMenu(event, t);
    };

    return (
      <Card
        key={t.apiId}
        sx={{
          width: 280,
          height: 250,
          display: "inline-block",
          margin: "10px",
          whiteSpace: "pre-wrap",
        }}
      >
        <CardActionArea onClick={onClickTrack}>
          <CardMedia component="img" src={image} sx={{ height: 200 }} />
        </CardActionArea>
        <CardActions>
          <Stack direction="row" alignItems="center" gap={1}>
            <IconButton size="small" onClick={openTrackMenu}>
              <MoreHoriz />
            </IconButton>
            <Typography
              title={t.name}
              gutterBottom
              variant="body2"
              component="span"
              width={230}
              noWrap
            >
              {t.name}
            </Typography>
          </Stack>
        </CardActions>
      </Card>
    );
  });

  const openPlaylistDialog = () => setPlaylistDialogOpen(true);
  const addToNewPlaylist = () => {
    openPlaylistDialog();
    closeMenu();
  };

  return (
    <>
      <Grid sx={{ display: pluginId ? "block" : "none" }}>
        <SelectPlugin
          pluginId={pluginId}
          setPluginId={setPluginId}
          methodName="onGetTopItems"
        />
      </Grid>
      <Fade in={!!topTrackComponents}>
        <Grid>
          <Typography variant="h5" style={{ marginLeft: "15px" }}>
            Top Tracks
          </Typography>
          <Grid
            sx={{
              whiteSpace: "nowrap",
              overflowX: "scroll",
              "&::-webkit-scrollbar": { display: "none" },
            }}
          >
            {topTrackComponents}
          </Grid>
        </Grid>
      </Fade>
      <Menu open={Boolean(anchorEl)} onClose={closeMenu} anchorEl={anchorEl}>
        <MenuItem onClick={addToNewPlaylist}>
          <ListItemIcon>
            <PlaylistAdd />
          </ListItemIcon>
          <ListItemText primary="Add To New Playlist" />
        </MenuItem>
        {playlists.map((p) => (
          <PlaylistMenuItem
            key={p.id}
            playlist={p}
            tracks={menuTrack ? [menuTrack] : []}
            closeMenu={closeMenu}
          />
        ))}
      </Menu>
      <AddPlaylistDialog
        tracks={menuTrack ? [menuTrack] : []}
        open={playlistDialogOpen}
        handleClose={closePlaylistDialog}
      />
    </>
  );
};

export default TopItemCards;
