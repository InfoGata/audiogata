import {
  Card,
  CardActionArea,
  CardActions,
  Fade,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import DOMPurify from "dompurify";
import React from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "react-query";
import usePlugins from "../hooks/usePlugins";
import { useAppDispatch } from "../store/hooks";
import { addTrack, setTrack } from "../store/reducers/trackReducer";
import PlaylistImage from "./PlaylistImage";
import SelectPlugin from "./SelectPlugin";
import TrackMenu from "./TrackMenu";

const TopItemCards: React.FC = () => {
  const [pluginId, setPluginId] = React.useState("");
  const { plugins } = usePlugins();
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const sanitizer = DOMPurify.sanitize;

  const getTopItems = async () => {
    const plugin = plugins.find((p) => p.id === pluginId);
    if (plugin) {
      const results = await plugin.remote.onGetTopItems();
      return results;
    }
  };

  const query = useQuery(["topitems", pluginId], getTopItems, {
    // Keep query for 5 minutes
    staleTime: 1000 * 60 * 5,
  });

  const topTrackComponents = query.data?.tracks?.items.map((t) => {
    const onClickTrack = () => {
      dispatch(addTrack(t));
      dispatch(setTrack(t));
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
          <PlaylistImage images={t.images} />
        </CardActionArea>
        <CardActions>
          <Stack direction="row" alignItems="center" gap={1}>
            <TrackMenu track={t} />
            <Typography
              title={t.name}
              gutterBottom
              variant="body2"
              component="span"
              width={230}
              noWrap
              dangerouslySetInnerHTML={{
                __html: sanitizer(t.name || ""),
              }}
            />
          </Stack>
        </CardActions>
      </Card>
    );
  });

  return (
    <>
      <Grid sx={{ display: pluginId ? "block" : "none" }}>
        <SelectPlugin
          pluginId={pluginId}
          setPluginId={setPluginId}
          methodName="onGetTopItems"
          useCurrentPlugin={true}
        />
      </Grid>
      <Fade in={!!topTrackComponents}>
        <Grid>
          <Typography variant="h5" style={{ marginLeft: "15px" }}>
            {t("topTracks")}
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
    </>
  );
};

export default TopItemCards;
