import { Email, Language, Lock, Twitter } from "@mui/icons-material";
import {
  Avatar,
  Box,
  List,
  ListItem,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  SvgIcon,
} from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMonero } from "@fortawesome/free-brands-svg-icons/faMonero";
import { faBitcoin } from "@fortawesome/free-brands-svg-icons/faBitcoin";
import { faPaypal } from "@fortawesome/free-brands-svg-icons/faPaypal";
import { faMastodon } from "@fortawesome/free-brands-svg-icons/faMastodon";
import { ReactComponent as Liberapay } from "../liberapay_logo.svg";
import React from "react";

const AboutPage: React.FC = () => {
  const email = "contact@audiogata.com";
  const website = "https://www.infogata.com";
  const privacyPolicy = `${website}/privacy.html`;
  const btcDonation = "bc1q3jdf0xpy2m2m2vuvvuqrzzaqt6g8h4lspv49j0";
  const xmrDonation =
    "485HGRVmzC4XK3Tm6vq2v7hXg32qVJLaeK15GjUpsWvGHQ7nyrV3UA2PJGTE4rCTPzCQxqwnkMWF6WRafjg3KTuAAGvi6wJ";
  const twitterUrl = "https://twitter.com/info_gata";
  const twitterAt = "@info_gata";
  const paypalUrl =
    "https://www.paypal.com/donate/?hosted_button_id=VYJRQP387NF4S";
  const mastodonUrl = "https://mastodon.online/@InfoGata";
  const mastodonAt = "@InfoGata@mastodon.online";
  const liberapayUrl = "https://liberapay.com/InfoGata/donate";
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
          <ListItemButton component="a" href={paypalUrl} target="_blank">
            <ListItemAvatar>
              <Avatar>
                <FontAwesomeIcon icon={faPaypal} />
              </Avatar>
            </ListItemAvatar>
            <ListItemText primary="Donate" secondary="Paypal" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton component="a" href={liberapayUrl} target="_blank">
            <ListItemAvatar>
              <Avatar>
                <SvgIcon component={Liberapay} inheritViewBox />
              </Avatar>
            </ListItemAvatar>
            <ListItemText primary="Donate" secondary="Liberapay" />
          </ListItemButton>
        </ListItem>
        <ListItem>
          <ListItemAvatar>
            <Avatar>
              <FontAwesomeIcon icon={faBitcoin} />
            </Avatar>
          </ListItemAvatar>
          <ListItemText primary="Donate - BTC" secondary={btcDonation} />
        </ListItem>
        <ListItem>
          <ListItemAvatar>
            <Avatar>
              <FontAwesomeIcon icon={faMonero} />
            </Avatar>
          </ListItemAvatar>
          <ListItemText
            primary="Donate - XMR"
            secondary={xmrDonation}
            secondaryTypographyProps={{ style: { wordWrap: "break-word" } }}
          />
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
