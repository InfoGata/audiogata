import React from "react";
import { getThumbnailImage, playlistThumbnailSize } from "../utils";
import { ImageInfo } from "../plugintypes";
import { Image } from "mui-image";

interface PlaylistImageProps {
  images?: ImageInfo[];
}

const PlaylistImage: React.FC<PlaylistImageProps> = (props) => {
  const { images } = props;
  const image = getThumbnailImage(images, playlistThumbnailSize);
  return <Image src={image} height={playlistThumbnailSize} />;
};

export default PlaylistImage;
