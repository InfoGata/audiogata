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
  return (
    <img 
      src={image} 
      className="w-48 h-48 object-cover rounded-lg shadow-xl" 
      alt="Cover"
    />
  );
};

export default PlaylistImage;
