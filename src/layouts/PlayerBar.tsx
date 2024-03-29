import { MoreHoriz } from "@mui/icons-material";
import {
  AppBar,
  Box,
  CircularProgress,
  Grid,
  IconButton,
  Toolbar,
  Typography,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import DOMPurify from "dompurify";
import React from "react";
import useTrackMenu from "../hooks/useTrackMenu";
import { useAppSelector } from "../store/hooks";
import { getThumbnailImage } from "../utils";
import Controls from "./Controls";
import Progress from "./Progress";

const thumbnailSize = 70;
const PlayerBar: React.FC = () => {
  const theme = useTheme();
  const currentTrack = useAppSelector((state) => state.track.currentTrack);
  const trackLoading = useAppSelector((state) => state.ui.trackLoading);
  const sanitizer = DOMPurify.sanitize;

  const { openMenu } = useTrackMenu({
    noQueueItem: true,
  });

  const onMenuClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (currentTrack) {
      openMenu(event, currentTrack);
    }
  };

  const image = getThumbnailImage(
    currentTrack && currentTrack.images,
    thumbnailSize
  );

  return (
    <AppBar
      position="fixed"
      sx={{ bottom: 0, top: "auto", zIndex: theme.zIndex.drawer + 1 }}
    >
      <Toolbar
        sx={{ alignItems: "center", justifyContent: "space-between" }}
        disableGutters={true}
      >
        <Grid
          container={true}
          justifyContent="flext-start"
          alignItems="flex-end"
        >
          <Grid item={true} sm={2} xs={3}>
            {trackLoading && (
              <CircularProgress
                sx={{ position: "absolute", top: 40, left: 25 }}
              />
            )}
            <Box
              component="img"
              sx={{ height: thumbnailSize, width: "auto" }}
              alt="thumbnail"
              src={image}
            />
          </Grid>
          <Grid
            xs={8}
            item={true}
            container={true}
            direction="column"
            alignItems="center"
          >
            <Grid
              item={true}
              container
              direction="row"
              justifyContent="center"
              alignItems="center"
            >
              <Typography
                noWrap={true}
                variant="body2"
                sx={{ maxWidth: "240px" }}
                title={currentTrack && currentTrack.name}
                dangerouslySetInnerHTML={{
                  __html: sanitizer(currentTrack?.name || ""),
                }}
              />
              {currentTrack && (
                <IconButton size="small" onClick={onMenuClick}>
                  <MoreHoriz fontSize="small" />
                </IconButton>
              )}
            </Grid>
            <Grid item={true}>
              <Controls />
            </Grid>
            <Progress />
          </Grid>
        </Grid>
      </Toolbar>
    </AppBar>
  );
};

export default PlayerBar;
