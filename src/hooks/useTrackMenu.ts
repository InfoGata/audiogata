import React from "react";
import { Track } from "../plugintypes";

const useTrackMenu = () => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [menuTrack, setMenuTrack] = React.useState<Track>();

  const openMenu = (
    event: React.MouseEvent<HTMLButtonElement>,
    track: Track
  ) => {
    const currentTarget = event.currentTarget;
    event.stopPropagation();
    event.preventDefault();
    setAnchorEl(currentTarget);
    setMenuTrack(track);
  };
  const closeMenu = () => setAnchorEl(null);

  return { closeMenu, openMenu, anchorEl, menuTrack };
};

export default useTrackMenu;
