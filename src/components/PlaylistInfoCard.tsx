import { Box, Card, CardContent, CardMedia, Typography } from "@mui/material";
import DOMPurify from "dompurify";
import React from "react";
import { Link } from "react-router-dom";
import { ImageInfo } from "../plugintypes";
import thumbnail from "../thumbnail.png";
import { getThumbnailImage, playlistThumbnailSize } from "../utils";

interface SubtitleLink {
  name?: string;
  link?: string;
}

interface PlaylistInfoCardProps {
  name: string;
  subtitleLinks?: SubtitleLink[];
  images?: ImageInfo[];
}

const PlaylistInfoCard: React.FC<PlaylistInfoCardProps> = (props) => {
  const { name, images, subtitleLinks } = props;
  const sanitizer = DOMPurify.sanitize;

  const onImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = thumbnail;
  };

  return (
    <Card sx={{ display: "flex" }}>
      <CardMedia
        component="img"
        alt={name}
        image={getThumbnailImage(images, playlistThumbnailSize)}
        onError={onImageError}
        sx={{ height: "200px", width: "200px" }}
      />
      <Box sx={{ display: "flex", flexDirection: "column" }}>
        <CardContent sx={{ flex: "1 0 auto" }}>
          <Typography
            component="div"
            variant="h5"
            dangerouslySetInnerHTML={{
              __html: sanitizer(name),
            }}
          />
          {subtitleLinks &&
            subtitleLinks.map((s, i) => (
              <>
                {i !== 0 && ", "}
                <Typography
                  component={s.link ? Link : "div"}
                  to={s.link}
                  variant="subtitle1"
                  color="text.secondary"
                  dangerouslySetInnerHTML={{
                    __html: sanitizer(s.name || ""),
                  }}
                />
              </>
            ))}
        </CardContent>
      </Box>
    </Card>
  );
};

export default PlaylistInfoCard;
