import React from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  AutoSizer,
  List,
  ListRowProps,
  WindowScroller,
} from "react-virtualized";
import { ISong } from "../models";
import { AppState, AppDispatch } from "../store/store";
import QueueItem from "./QueueItem";
import { Menu, ListItemText, MenuItem, ListItemIcon, Divider } from "@material-ui/core";
import { Delete, Info, PlaylistAdd } from "@material-ui/icons";
import { deleteTrack, setTracks } from "../store/reducers/songReducer";
import AddPlaylistDialog from "./AddPlaylistDialog";
import PlaylistMenuItem from "./PlaylistMenuItem";
import { Link } from "react-router-dom";
import {
  Droppable,
  DragDropContext,
  DropResult,
  DroppableProvided,
  DraggableStateSnapshot,
  DraggableProvided,
  DraggableRubric,
  Draggable,
} from "react-beautiful-dnd";
import ReactDOM from "react-dom";

const rowRenderer = (songs: ISong[], openMenu: (event: React.MouseEvent<HTMLButtonElement>, song: ISong) => void) =>
  (props: ListRowProps) => {

  const { index, style } = props;
  const song = songs[index];
  return (
    <Draggable draggableId={song.id || ""} index={index} key={song.id}>
      {(provided: DraggableProvided) => (
        <QueueItem song={song} style={style} openMenu={openMenu} provided={provided} />
      )}
    </Draggable>
  );
};

const PlayQueue: React.FC = () => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [menuSong, setMenuSong] = React.useState<ISong>({} as ISong);
  const openMenu = (event: React.MouseEvent<HTMLButtonElement>, song: ISong) => {
    setAnchorEl(event.currentTarget);
    setMenuSong(song);
  };
  const closeMenu = () => setAnchorEl(null);
  const songList = useSelector((state: AppState) => state.song.songs);
  const deleteClick = () => {
    dispatch(deleteTrack(menuSong));
    closeMenu();
  };
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const openDialog = () => setDialogOpen(true);
  const closeDialog = () => setDialogOpen(false);
  const addToNewPlaylist = () => {
    openDialog();
    closeMenu();
  };
  const playlists = useSelector((state: AppState) => state.playlist.playlists);
  const infoPath = `/track/${menuSong.id}`;

  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) {
      return;
    }

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const tracks = Array.from(songList);
    const track = tracks.find(s => s.id === draggableId);
    if (track) {
      tracks.splice(source.index, 1);
      tracks.splice(destination.index, 0, track);
      dispatch(setTracks(tracks));
    }
  };

  return (
    <>
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable
        droppableId="droppable"
        mode="virtual"
        renderClone={(provided: DraggableProvided, snapshot: DraggableStateSnapshot, rubric: DraggableRubric) => (
          <QueueItem song={songList[rubric.source.index]} openMenu={openMenu} style={{ margin: 0}} provided={provided} />
        )}
        >
        {(droppableProvided: DroppableProvided) => (
          <WindowScroller>
            {({ height, isScrolling, onChildScroll, scrollTop }) => (
              <AutoSizer disableHeight={true}>
                {({ width }) => (
                  <List
                    autoHeight={true}
                    height={height}
                    width={width}
                    rowCount={songList.length}
                    rowHeight={50}
                    rowRenderer={rowRenderer(songList, openMenu)}
                    isScrolling={isScrolling}
                    onScroll={onChildScroll}
                    scrollTop={scrollTop}
                    ref={ref => {
                      if (ref) {
                        const r = ReactDOM.findDOMNode(ref);
                        if (r instanceof HTMLElement) {
                          droppableProvided.innerRef(r);
                        }
                      }
                    }}
                  />
                )}
              </AutoSizer>
            )}
          </WindowScroller>
        )}
      </Droppable>
    </DragDropContext>
      <Menu open={Boolean(anchorEl)} onClose={closeMenu} anchorEl={anchorEl}>
        <MenuItem onClick={deleteClick}>
          <ListItemIcon>
            <Delete />
          </ListItemIcon>
          <ListItemText primary="Delete" />
        </MenuItem>
        <MenuItem component={Link} to={infoPath} >
          <ListItemIcon>
            <Info />
          </ListItemIcon>
          <ListItemText primary="Info" />
        </MenuItem>
        <Divider />
        <MenuItem onClick={addToNewPlaylist}>
          <ListItemIcon>
            <PlaylistAdd />
          </ListItemIcon>
          <ListItemText primary="Add To New Playlist" />
        </MenuItem>
        {playlists.map(p => (
          <PlaylistMenuItem
            key={p.id}
            playlist={p}
            songs={[menuSong]}
            closeMenu={closeMenu}
          />
        ))}
      </Menu>
      <AddPlaylistDialog
        songs={[menuSong]}
        open={dialogOpen}
        handleClose={closeDialog}
      />
    </>
  );
};
export default React.memo(PlayQueue);
