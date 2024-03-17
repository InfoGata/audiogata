import AboutLink, { AboutLinkProps } from "@/components/AboutLink";
import React from "react";
import { useTranslation } from "react-i18next";
import {
  FaEnvelope,
  FaGitAlt,
  FaGlobe,
  FaHeart,
  FaLock,
  FaMastodon,
  FaTwitter,
} from "react-icons/fa6";

const AboutPage: React.FC = () => {
  const { t } = useTranslation();
  const email = "contact@audiogata.com";
  const website = "https://www.infogata.com";
  const twitterUrl = "https://twitter.com/info_gata";
  const twitterAt = "@info_gata";
  const mastodonUrl = "https://mastodon.online/@InfoGata";
  const mastodonAt = "@InfoGata@mastodon.online";
  const gitUrl = "https://github.com/InfoGata/audiogata";

  const links: AboutLinkProps[] = [
    {
      title: "Company Website",
      description: website,
      icon: <FaGlobe />,
      url: website,
    },
    {
      title: "Github",
      description: gitUrl,
      icon: <FaGitAlt />,
      url: gitUrl,
    },
    {
      title: "Email",
      description: email,
      icon: <FaEnvelope />,
    },
    {
      title: "Twitter",
      description: twitterAt,
      icon: <FaTwitter />,
      url: twitterUrl,
    },
    {
      title: "Mastodon",
      description: mastodonAt,
      icon: <FaMastodon />,
      url: mastodonUrl,
    },
    {
      title: t("donate"),
      icon: <FaHeart />,
      internalPath: "/donate",
    },
    {
      title: t("privacyPolicy"),
      icon: <FaLock />,
      internalPath: "/privacy",
    },
  ];

  return (
    <div>
      {links.map((l) => (
        <AboutLink {...l} key={l.title} />
      ))}
    </div>
  );
};

export default AboutPage;
