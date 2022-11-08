import {
  AppBar,
  Grid,
  Toolbar,
  Typography,
  Box,
  IconButton,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import React from "react";
import { useAppSelector } from "../store/hooks";
import { getThumbnailImage } from "../utils";
import Controls from "./Controls";
import Progress from "./Progress";
import DOMPurify from "dompurify";
import { MoreHoriz } from "@mui/icons-material";
import useTrackMenu from "../hooks/useTrackMenu";

const thumbnailSize = 70;
const PlayerBar: React.FC = () => {
  const theme = useTheme();
  const currentTrack = useAppSelector((state) => state.track.currentTrack);
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
                sx={{ maxWidth: "250px" }}
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
