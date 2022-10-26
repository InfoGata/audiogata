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
import React from "react";
import { faMonero } from "@fortawesome/free-brands-svg-icons/faMonero";
import { faBitcoin } from "@fortawesome/free-brands-svg-icons/faBitcoin";
import { faPaypal } from "@fortawesome/free-brands-svg-icons/faPaypal";
import { ReactComponent as Liberapay } from "../liberapay_logo.svg";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useTranslation } from "react-i18next";

const Donate: React.FC = () => {
  const { t } = useTranslation();
  const btcDonation = "bc1q3jdf0xpy2m2m2vuvvuqrzzaqt6g8h4lspv49j0";
  const xmrDonation =
    "485HGRVmzC4XK3Tm6vq2v7hXg32qVJLaeK15GjUpsWvGHQ7nyrV3UA2PJGTE4rCTPzCQxqwnkMWF6WRafjg3KTuAAGvi6wJ";
  const paypalUrl =
    "https://www.paypal.com/donate/?hosted_button_id=VYJRQP387NF4S";
  const liberapayUrl = "https://liberapay.com/InfoGata/donate";
  const donateText = t("donate");
  return (
    <Box>
      <List dense>
        <ListItem disablePadding>
          <ListItemButton component="a" href={paypalUrl} target="_blank">
            <ListItemAvatar>
              <Avatar>
                <FontAwesomeIcon icon={faPaypal} />
              </Avatar>
            </ListItemAvatar>
            <ListItemText primary={donateText} secondary="Paypal" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton component="a" href={liberapayUrl} target="_blank">
            <ListItemAvatar>
              <Avatar>
                <SvgIcon component={Liberapay} inheritViewBox />
              </Avatar>
            </ListItemAvatar>
            <ListItemText primary={donateText} secondary="Liberapay" />
          </ListItemButton>
        </ListItem>
        <ListItem>
          <ListItemAvatar>
            <Avatar>
              <FontAwesomeIcon icon={faBitcoin} />
            </Avatar>
          </ListItemAvatar>
          <ListItemText
            primary={`${donateText} - BTC`}
            secondary={btcDonation}
          />
        </ListItem>
        <ListItem>
          <ListItemAvatar>
            <Avatar>
              <FontAwesomeIcon icon={faMonero} />
            </Avatar>
          </ListItemAvatar>
          <ListItemText
            primary={`${donateText} - XMR`}
            secondary={xmrDonation}
            secondaryTypographyProps={{ style: { wordWrap: "break-word" } }}
          />
        </ListItem>
      </List>
    </Box>
  );
};

export default Donate;
