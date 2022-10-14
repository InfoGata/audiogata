import { Email, Favorite, Language, Lock, Twitter } from "@mui/icons-material";
import {
  Avatar,
  Box,
  List,
  ListItem,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
} from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMastodon } from "@fortawesome/free-brands-svg-icons/faMastodon";
import { faGitAlt } from "@fortawesome/free-brands-svg-icons/faGitAlt";
import React from "react";
import { Link } from "react-router-dom";

const AboutPage: React.FC = () => {
  const email = "contact@audiogata.com";
  const website = "https://www.infogata.com";
  const privacyPolicy = `${website}/privacy.html`;
  const twitterUrl = "https://twitter.com/info_gata";
  const twitterAt = "@info_gata";
  const mastodonUrl = "https://mastodon.online/@InfoGata";
  const mastodonAt = "@InfoGata@mastodon.online";
  const githubUrl = "https://github.com/InfoGata/audiogata";
  return (
    <Box>
      <List dense>
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
          <ListItemButton component="a" href={githubUrl} target="_blank">
            <ListItemAvatar>
              <Avatar>
                <FontAwesomeIcon icon={faGitAlt} />
              </Avatar>
            </ListItemAvatar>
            <ListItemText primary="Github" secondary={githubUrl} />
          </ListItemButton>
        </ListItem>
        <ListItem>
          <ListItemAvatar>
            <Avatar>
              <Email />
            </Avatar>
          </ListItemAvatar>
          <ListItemText primary="Email" secondary={email} />
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton component="a" href={twitterUrl} target="_blank">
            <ListItemAvatar>
              <Avatar>
                <Twitter />
              </Avatar>
            </ListItemAvatar>
            <ListItemText primary="Twitter" secondary={twitterAt} />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton component="a" href={mastodonUrl} target="_blank">
            <ListItemAvatar>
              <Avatar>
                <FontAwesomeIcon icon={faMastodon} />
              </Avatar>
            </ListItemAvatar>
            <ListItemText primary="Mastodon" secondary={mastodonAt} />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton component={Link} to="/donate">
            <ListItemAvatar>
              <Avatar>
                <Favorite />
              </Avatar>
            </ListItemAvatar>
            <ListItemText primary="Donate" />
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
