import { Card, CardMedia, Box, CardContent, Typography } from "@mui/material";
import React from "react";
import { ImageInfo } from "../plugintypes";
import { getThumbnailImage, playlistThumbnailSize } from "../utils";
import thumbnail from "../thumbnail.png";
import { Link } from "react-router-dom";
import DOMPurify from "dompurify";

interface PlaylistInfoCardProps {
  name: string;
  subtitle?: string;
  subtitleLink?: string;
  images?: ImageInfo[];
}

const PlaylistInfoCard: React.FC<PlaylistInfoCardProps> = (props) => {
  const { name, subtitle, images, subtitleLink } = props;
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
          {subtitle && (
            <Typography
              component={subtitleLink ? Link : "div"}
              to={subtitleLink ? subtitleLink : undefined}
              variant="subtitle1"
              color="text.secondary"
              dangerouslySetInnerHTML={{
                __html: sanitizer(subtitle || ""),
              }}
            />
          )}
        </CardContent>
      </Box>
    </Card>
  );
};

export default PlaylistInfoCard;
