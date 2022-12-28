import {
  Avatar,
  Box,
  Checkbox,
  IconButton,
  LinearProgress,
  Link,
  TableCell,
  Typography,
} from "@mui/material";
import React from "react";
import { Track } from "../plugintypes";
import { formatSeconds } from "../utils";
import { MoreHoriz } from "@mui/icons-material";
import { useAppSelector } from "../store/hooks";
import { getThumbnailImage, searchThumbnailSize } from "../utils";
import DOMPurify from "dompurify";
import { Link as RouterLink } from "react-router-dom";

interface PlaylistItemsProps {
  track: Track;
  showTrackLength: boolean;
  isSelected?: (id: string) => boolean;
  onSelectClick?: (
    event: React.ChangeEvent<HTMLInputElement>,
    id: string
  ) => void;
  openMenu?: (event: React.MouseEvent<HTMLButtonElement>, track: Track) => void;
  index?: number;
}

interface ArtistLinkProps {
  pluginId?: string;
  name?: string;
  apiId?: string;
}

const ArtistLink: React.FC<ArtistLinkProps> = (props) => {
  const { pluginId, name, apiId } = props;
  const stopPropagation = (e: React.MouseEvent) => {
    e.stopPropagation();
  };
  return (
    <Link
      component={RouterLink}
      to={`/plugins/${pluginId}/artists/${apiId}`}
      onClick={stopPropagation}
    >
      {name}
    </Link>
  );
};

const PlaylistItem: React.FC<PlaylistItemsProps> = (props) => {
  const { track, showTrackLength, openMenu, onSelectClick, isSelected, index } =
    props;
  const sanitizer = DOMPurify.sanitize;
  const currentTrack = useAppSelector((state) => state.track.currentTrack);
  const progress = useAppSelector(
    (state) => state.download.progress[track.id || ""]
  );

  const openTrackMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (openMenu) {
      openMenu(event, track);
    }
  };

  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (onSelectClick) {
      onSelectClick(event, track.id || "");
    }
  };

  const stopPropagation = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const image = getThumbnailImage(track.images, searchThumbnailSize);
  return (
    <>
      <TableCell padding="none">
        {isSelected && (
          <Checkbox
            color="primary"
            checked={isSelected(track.id || "")}
            onChange={onChange}
            onClick={stopPropagation}
            size="small"
            inputProps={
              {
                "data-index": index,
              } as any
            }
          />
        )}
      </TableCell>
      <TableCell>
        <Box
          sx={{
            display: "flex",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          <Avatar alt={track.name} src={image} style={{ borderRadius: 0 }} />
          <Box sx={{ minWidth: 0 }}>
            <Typography
              color={
                currentTrack && currentTrack?.id === track.id
                  ? "primary.main"
                  : undefined
              }
              noWrap={true}
              dangerouslySetInnerHTML={{ __html: sanitizer(track.name) }}
              title={track.name}
              sx={{ overflow: "hidden", textOverflow: "ellipsis" }}
            />
            {track.artistApiId ? (
              <>
                <ArtistLink
                  pluginId={track.pluginId}
                  name={track.artistName}
                  apiId={track.artistApiId}
                />
                {track.addtionalArtists &&
                  track.addtionalArtists.map((a) => (
                    <>
                      {", "}
                      <ArtistLink
                        pluginId={track.pluginId}
                        name={a.name}
                        apiId={a.apiId}
                      />
                    </>
                  ))}
              </>
            ) : (
              <Typography
                variant="body2"
                color={
                  currentTrack && currentTrack?.id === track.id
                    ? "primary.main"
                    : undefined
                }
                noWrap={true}
                dangerouslySetInnerHTML={{
                  __html: sanitizer(track.artistName || ""),
                }}
                sx={{ overflow: "hidden", textOverflow: "ellipsis" }}
              />
            )}
            <LinearProgress
              variant="determinate"
              value={progress?.progress || 0}
              sx={{ visibility: progress ? "visible" : "hidden" }}
            />
          </Box>
        </Box>
      </TableCell>
      {showTrackLength && (
        <TableCell>{formatSeconds(track.duration)}</TableCell>
      )}
      <TableCell align="right" padding="checkbox">
        {openMenu && (
          <IconButton aria-label="options" size="small" onClick={openTrackMenu}>
            <MoreHoriz />
          </IconButton>
        )}
      </TableCell>
    </>
  );
};

export default React.memo(PlaylistItem);
