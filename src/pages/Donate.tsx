import AboutLink, { AboutLinkProps } from "@/components/AboutLink";
import React from "react";
import { useTranslation } from "react-i18next";
import { FaBitcoin, FaMonero, FaPatreon, FaPaypal } from "react-icons/fa6";
import { SiLiberapay } from "react-icons/si";

const Donate: React.FC = () => {
  const { t } = useTranslation();
  const btcDonation = "bc1q3jdf0xpy2m2m2vuvvuqrzzaqt6g8h4lspv49j0";
  const xmrDonation =
    "485HGRVmzC4XK3Tm6vq2v7hXg32qVJLaeK15GjUpsWvGHQ7nyrV3UA2PJGTE4rCTPzCQxqwnkMWF6WRafjg3KTuAAGvi6wJ";
  const paypalUrl =
    "https://www.paypal.com/donate/?hosted_button_id=VYJRQP387NF4S";
  const liberapayUrl = "https://liberapay.com/InfoGata/donate";
  const patreonUrl = "https://www.patreon.com/InfoGata";
  const donateText = t("donate");
  const links: AboutLinkProps[] = [
    {
      title: donateText,
      description: "Paypal",
      icon: <FaPaypal />,
      url: paypalUrl,
    },
    {
      title: donateText,
      description: "Pateron",
      icon: <FaPatreon />,
      url: patreonUrl,
    },
    {
      title: donateText,
      description: "Liberapay",
      icon: <SiLiberapay />,
      url: liberapayUrl,
    },
    {
      title: `${donateText} - BTC`,
      description: btcDonation,
      icon: <FaBitcoin />,
    },
    {
      title: `${donateText} - XMR`,
      description: xmrDonation,
      icon: <FaMonero />,
    },
  ];

  return (
    <div>
      {links.map((l) => (
        <AboutLink {...l} key={`${l.title}-${l.description}`} />
      ))}
    </div>
  );
};

export default Donate;
