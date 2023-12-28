import {
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Tooltip,
} from "@mui/material";
import React from "react";
import { Link } from "react-router-dom";
import { NavigationLinkItem } from "../types";

interface NavigationLinkProps {
  item: NavigationLinkItem;
}

const NavigationLink: React.FC<NavigationLinkProps> = (props) => {
  const { item } = props;
  return (
    <ListItem disablePadding>
      <ListItemButton component={Link} to={item.link}>
        <ListItemIcon>
          <Tooltip title={item.title} placement="right">
            {item.icon}
          </Tooltip>
        </ListItemIcon>
        <ListItemText>{item.title}</ListItemText>
      </ListItemButton>
    </ListItem>
  );
};
export default NavigationLink;
