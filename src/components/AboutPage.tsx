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
import { useTranslation } from "react-i18next";

const AboutPage: React.FC = () => {
  const { t } = useTranslation();
  const email = "contact@audiogata.com";
  const website = "https://www.infogata.com";
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
          <ListItemText primary={t("email")} secondary={email} />
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
            <ListItemText primary={t("donate")} />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton component={Link} to="/privacy">
            <ListItemAvatar>
              <Avatar>
                <Lock />
              </Avatar>
            </ListItemAvatar>
            <ListItemText primary={t("privacyPolicy")} />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );
};

export default AboutPage;
