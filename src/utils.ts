import { IImage } from "./models";
import { ISearchApi } from "./services/apis/ISearchApi";
import SoundCloud from "./services/apis/SoundCloud";
import Napster from "./services/apis/Napster";
import Spotify from "./services/apis/Spotify";
import Youtube from "./services/apis/Youtube";
import thumbnail from "./thumbnail.png";

export function formatSeconds(seconds?: number) {
  if (!seconds) {
    return "00:00";
  }
  const hours = Math.floor(seconds / 3600);
  seconds = seconds % 3600;

  const minutes = Math.floor(seconds / 60);
  seconds = seconds % 60;

  seconds = Math.floor(seconds);
  let result = (
    (minutes < 10 ? "0" : "") +
    minutes +
    ":" +
    (seconds < 10 ? "0" : "") +
    seconds
  );

  if (hours > 0) {
    result = hours + ":" + result;
  }
  return result;
}

// Retreive smallest image bigger than thumbnail size
export const getThumbnailImage = (images: IImage[] | undefined, size: number): string => {
  if (!images) {
    return thumbnail;
  }

  const sortedImages = [...images].sort((a, b) => a.height - b.height);
  const thumbnailImage = sortedImages.find(i => i.height >= size);
  return thumbnailImage ? thumbnailImage.url : thumbnail;
};

export const getApiByName = (name: string): ISearchApi | undefined => {
  switch (name) {
    case "youtube":
      return Youtube;
    case "soundcloud":
      return SoundCloud;
    case "spotify":
      return Spotify;
    case "napster":
      return Napster;
  }
};

export const navbarWidth = 200;

export const searchThumbnailSize = 40;
