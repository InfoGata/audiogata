import { Email, Language, Lock } from "@mui/icons-material";
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
  const privacyPolicy = `${website}/privacy.html`;
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
        <ListItem disablePadding>
          <ListItemButton component="a" href={privacyPolicy} target="_blank">
            <ListItemAvatar>
              <Avatar>
                <Lock />
              </Avatar>
            </ListItemAvatar>
            <ListItemText primary="Privacy Policy" />
          </ListItemButton>
        </ListItem>
      </List>
      <iframe
        title="out-opt"
        style={{ border: 0, height: "200px", width: "600px" }}
        src="https://matomo.infogata.com/index.php?module=CoreAdminHome&action=optOut&language=en&backgroundColor=121212&fontColor=ffffff&fontSize=16px"
      ></iframe>
    </Box>
  );
};

export default AboutPage;
