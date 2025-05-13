import React from "react";
import { ImageInfo } from "../plugintypes";
import { getThumbnailImage } from "@infogata/utils";
import { playlistThumbnailSize } from "../utils";

interface PlaylistImageProps {
  images?: ImageInfo[];
}

const PlaylistImage: React.FC<PlaylistImageProps> = (props) => {
  const { images } = props;
  const image = getThumbnailImage(images, playlistThumbnailSize);
  return <img src={image} className="h-48" />;
};

export default PlaylistImage;
