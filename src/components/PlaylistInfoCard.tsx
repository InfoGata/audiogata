import DOMPurify from "dompurify";
import React from "react";
import { ImageInfo } from "../plugintypes";
import PlaylistImage from "./PlaylistImage";
import { Link } from "@tanstack/react-router";

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

  const subtitles = subtitleLinks?.map((sl, i) => {
    const Component = sl.link
      ? Link
      : (props: any) => React.createElement("div", props);
    return (
      <>
        {i !== 0 && ", "}
        <Component
          to={sl.link ?? ""}
          className="text-2xl"
          dangerouslySetInnerHTML={{
            __html: sanitizer(name),
          }}
        />
      </>
    );
  });

  return (
    <div className="flex">
      <div>
        <PlaylistImage images={images} />
      </div>
      <div>
        <h2
          className="text-2xl"
          dangerouslySetInnerHTML={{
            __html: sanitizer(name),
          }}
        />
        {subtitles}
      </div>
    </div>
  );
};

export default PlaylistInfoCard;
