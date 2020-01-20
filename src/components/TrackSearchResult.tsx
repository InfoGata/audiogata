import {
  Avatar,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Typography,
} from "@material-ui/core";
import React from "react";
import { useDispatch } from "react-redux";
import { ISong } from "../models";
import { addTrack } from "../store/reducers/songReducer";
import { AppDispatch } from "../store/store";
import { getThumbnailImage, searchThumbnailSize } from "../utils";

interface ITrackResultProps {
  track: ISong;
}
const TrackSearchResult: React.FC<ITrackResultProps> = props => {
  const dispatch = useDispatch<AppDispatch>();

  const onClickSong = () => {
    dispatch(addTrack(props.track));
  };

  const image = getThumbnailImage(props.track.images, searchThumbnailSize);
  return (
    <ListItem button={true} onClick={onClickSong}>
      <ListItemAvatar>
        <Avatar
          alt={props.track.name}
          src={image}
          style={{ borderRadius: 0 }}
        />
      </ListItemAvatar>
      <ListItemText
        primary={
          <Typography dangerouslySetInnerHTML={{ __html: props.track.name }} />
        }
      />
    </ListItem>
  );
};

export default React.memo(TrackSearchResult);
