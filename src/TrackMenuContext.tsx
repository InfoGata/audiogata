import { PlaylistAdd, PlaylistPlay } from "@mui/icons-material";
import { ListItemIcon, ListItemText, Menu, MenuItem } from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import AddPlaylistDialog from "./components/AddPlaylistDialog";
import PlaylistMenuItem from "./components/PlaylistMenuItem";
import { PlaylistInfo, Track } from "./plugintypes";
import { useAppDispatch } from "./store/hooks";
import { addTrack } from "./store/reducers/trackReducer";

export interface TrackMenuInterface {
  openTrackMenu: (
    event: React.MouseEvent<HTMLButtonElement>,
    track: Track
  ) => void;
  setPlaylists: React.Dispatch<React.SetStateAction<PlaylistInfo[]>>;
  setListElements: React.Dispatch<React.SetStateAction<JSX.Element[]>>;
  setNoQueue: React.Dispatch<React.SetStateAction<boolean>>;
  menuTrack: Track | undefined;
  closeMenu: () => void;
}

const TrackMenuContext = React.createContext<TrackMenuInterface>(undefined!);

export const TrackMenuProvider: React.FC<React.PropsWithChildren> = (props) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [playlists, setPlaylists] = React.useState<PlaylistInfo[]>([]);
  const [listElements, setListElements] = React.useState<JSX.Element[]>([]);
  const [menuTrack, setMenuTrack] = React.useState<Track>();
  const [playlistDialogOpen, setPlaylistDialogOpen] = React.useState(false);
  const [noQueue, setNoQueue] = React.useState(false);
  const closeMenu = () => setAnchorEl(null);
  const closePlaylistDialog = () => setPlaylistDialogOpen(false);
  const dispatch = useAppDispatch();
  const { t } = useTranslation();

  const openTrackMenu = (
    event: React.MouseEvent<HTMLButtonElement>,
    track: Track
  ) => {
    event.stopPropagation();
    event.preventDefault();
    setAnchorEl(event.currentTarget);
    setMenuTrack(track);
  };

  const addMenuTrackToNewPlaylist = () => {
    setPlaylistDialogOpen(true);
    closeMenu();
  };

  const addTrackToQueue = () => {
    if (menuTrack) {
      dispatch(addTrack(menuTrack));
    }
    closeMenu();
  };

  const defaultContext: TrackMenuInterface = {
    menuTrack,
    openTrackMenu,
    closeMenu,
    setPlaylists,
    setListElements,
    setNoQueue,
  };

  return (
    <TrackMenuContext.Provider value={defaultContext}>
      {props.children}
      <Menu open={Boolean(anchorEl)} onClose={closeMenu} anchorEl={anchorEl}>
        {!noQueue && (
          <MenuItem onClick={addTrackToQueue}>
            <ListItemIcon>
              <PlaylistPlay />
            </ListItemIcon>
            <ListItemText primary={t("addToQueue")} />
          </MenuItem>
        )}
        {listElements}
        <MenuItem onClick={addMenuTrackToNewPlaylist}>
          <ListItemIcon>
            <PlaylistAdd />
          </ListItemIcon>
          <ListItemText primary={t("addToNewPlaylist")} />
        </MenuItem>
        {playlists.map((p) => (
          <PlaylistMenuItem
            key={p.id}
            playlist={p}
            tracks={menuTrack ? [menuTrack] : []}
            closeMenu={closeMenu}
            namePrefix="Add to "
          />
        ))}
      </Menu>
      <AddPlaylistDialog
        tracks={menuTrack ? [menuTrack] : []}
        handleClose={closePlaylistDialog}
        open={playlistDialogOpen}
      />
    </TrackMenuContext.Provider>
  );
};

export default TrackMenuContext;
