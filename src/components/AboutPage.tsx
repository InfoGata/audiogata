import { Email, Language } from "@mui/icons-material";
import {
  Avatar,
  Box,
  List,
  ListItem,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
} from "@mui/material";
import React from "react";

const AboutPage: React.FC = () => {
  const email = "contact@audiogata.com";
  const website = "https://www.infogata.com";
  return (
    <Box>
      <List>
        <ListItem disablePadding>
          <ListItemButton component="a" href={website} target="_blank">
            <ListItemAvatar>
              <Avatar>
                <Language />
              </Avatar>
            </ListItemAvatar>
            <ListItemText primary="Company Website" secondary={website} />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton
            component="a"
            href={`mailto:${email}`}
            target="_blank"
          >
            <ListItemAvatar>
              <Avatar>
                <Email />
              </Avatar>
            </ListItemAvatar>
            <ListItemText primary="Email" secondary={email} />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );
};

export default AboutPage;
