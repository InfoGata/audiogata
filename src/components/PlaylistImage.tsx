import React from "react";
import { ImageInfo } from "../plugintypes";
import thumbnail from "../thumbnail.png";
import { getThumbnailImage, playlistThumbnailSize } from "../utils";

interface PlaylistImageProps {
  images?: ImageInfo[];
}

const PlaylistImage: React.FC<PlaylistImageProps> = (props) => {
  const { images } = props;
  const image = getThumbnailImage(images, playlistThumbnailSize);
  return <img src={image || thumbnail} className="h-48" />;
};

export default PlaylistImage;
