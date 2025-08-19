import DOMPurify from "dompurify";
import React from "react";
import { ImageInfo } from "../plugintypes";
import PlaylistImage from "./PlaylistImage";
import { Link } from "@tanstack/react-router";
import { Card, CardContent } from "./ui/card";

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
      : (props: any) => React.createElement("span", props);
    return (
      <React.Fragment key={i}>
        {i !== 0 && <span className="text-muted-foreground mx-1">•</span>}
        <Component
          to={sl.link ?? ""}
          className={`text-lg ${sl.link ? 'text-primary hover:underline' : 'text-muted-foreground'} transition-colors`}
          dangerouslySetInnerHTML={{
            __html: sanitizer(sl.name || ""),
          }}
        />
      </React.Fragment>
    );
  });

  return (
    <div className="w-full">
      {/* Hero Section with Gradient Background */}
      <div className="relative bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        
        <Card className="bg-transparent border-none shadow-none">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row gap-8 items-start md:items-end relative z-10">
              {/* Album/Artist Image */}
              <div className="flex-shrink-0">
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-lg" />
                  <PlaylistImage images={images} />
                  <div className="absolute inset-0 ring-2 ring-white/10 rounded-lg" />
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 text-white">
                <div className="space-y-4">
                  {/* Main Title */}
                  <div>
                    <h1
                      className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-white drop-shadow-lg"
                      dangerouslySetInnerHTML={{
                        __html: sanitizer(name),
                      }}
                    />
                  </div>

                  {/* Subtitle Links */}
                  {subtitleLinks && subtitleLinks.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1 text-white/90">
                      {subtitles}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PlaylistInfoCard;
