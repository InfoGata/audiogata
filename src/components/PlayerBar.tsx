import {
  AppBar,
  Grid,
  Toolbar,
  Typography,
  Box,
  useTheme,
} from "@mui/material";
import React from "react";
import { useSelector } from "react-redux";
import { AppState } from "../store/store";
import { getThumbnailImage } from "../utils";
import Controls from "./Controls";
import Progress from "./Progress";

const thumbnailSize = 75;
const PlayerBar: React.FC = () => {
  const theme = useTheme();
  const currentSong = useSelector((state: AppState) => state.song.currentSong);

  const image = getThumbnailImage(
    currentSong && currentSong.images,
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
        <Grid container={true} spacing={1}>
          <Grid item={true} sm={2} xs={3}>
            <Box
              component="img"
              sx={{ height: thumbnailSize, width: thumbnailSize }}
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
            <Grid item={true}>
              <Typography
                noWrap={true}
                variant="body2"
                sx={{ maxWidth: "250px" }}
                dangerouslySetInnerHTML={{
                  __html: (currentSong && currentSong.name) || "",
                }}
              />
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
