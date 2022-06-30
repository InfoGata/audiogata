import { MoreHoriz, PlaylistAdd } from "@mui/icons-material";
import {
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Fade,
  Grid,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Typography,
} from "@mui/material";
import React from "react";
import { useQuery } from "react-query";
import { usePlugins } from "../PluginsContext";
import { Track } from "../plugintypes";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { addTrack, setTrack } from "../store/reducers/trackReducer";
import { getThumbnailImage, playlistThumbnailSize } from "../utils";
import AddPlaylistDialog from "./AddPlaylistDialog";
import PlaylistMenuItem from "./PlaylistMenuItem";
import SelectPlugin from "./SelectPlugin";

const TopItemCards: React.FC = () => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [menuTrack, setMenuTrack] = React.useState<Track>({} as Track);
  const [pluginId, setPluginId] = React.useState("");
  const { plugins } = usePlugins();
  const dispatch = useAppDispatch();
  const closeMenu = () => setAnchorEl(null);
  const playlists = useAppSelector((state) => state.playlist.playlists);
  const [playlistDialogOpen, setPlaylistDialogOpen] = React.useState(false);
  const closePlaylistDialog = () => setPlaylistDialogOpen(false);

  const openMenu = async (
    event: React.MouseEvent<HTMLButtonElement>,
    track: Track
  ) => {
    const currentTarget = event.currentTarget;
    event.stopPropagation();
    event.preventDefault();
    setMenuTrack(track);
    setAnchorEl(currentTarget);
  };

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
          "& .optionsButton": { display: "none" },
          "&:hover": {
            ".optionsButton": {
              display: "block",
            },
          },
        }}
      >
        <IconButton
          sx={{ position: "absolute", zIndex: 1 }}
          className="optionsButton"
          size="large"
          onClick={openTrackMenu}
        >
          <MoreHoriz />
        </IconButton>
        <CardActionArea onClick={onClickTrack}>
          <CardMedia component="img" src={image} sx={{ height: 200 }} />
          <CardContent>
            <Typography
              title={t.name}
              gutterBottom
              variant="body2"
              component="p"
              noWrap
            >
              {t.name}
            </Typography>
          </CardContent>
        </CardActionArea>
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
            tracks={[menuTrack]}
            closeMenu={closeMenu}
          />
        ))}
      </Menu>
      <AddPlaylistDialog
        tracks={[menuTrack]}
        open={playlistDialogOpen}
        handleClose={closePlaylistDialog}
      />
    </>
  );
};

export default TopItemCards;
