import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";
import React from "react";

type FavoriteLinkProps = {
  title: string;
  url: string;
};

const FavoriteLink: React.FC<FavoriteLinkProps> = (props) => {
  const { title, url } = props;
  return (
    <Link
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
      )}
      activeProps={{ className: "bg-background text-foreground shadow-sm" }}
      to={url}
    >
      {title}
    </Link>
  );
};
export default FavoriteLink;
