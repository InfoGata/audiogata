import { createFileRoute } from "@tanstack/react-router";
import AboutLink, { AboutLinkProps } from "@/components/AboutLink";
import { appBuild, buildReport } from "@/lib/app-version";
import React from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
  FaCircleInfo,
  FaEnvelope,
  FaGitAlt,
  FaGlobe,
  FaHeart,
  FaLock,
  FaMastodon,
  FaXTwitter,
} from "react-icons/fa6";

const About: React.FC = () => {
  const { t } = useTranslation();
  const email = "contact@audiogata.com";
  const website = "https://www.infogata.com";
  const xUrl = "https://x.com/info_gata";
  const xAt = "@info_gata";
  const mastodonUrl = "https://mastodon.online/@InfoGata";
  const mastodonAt = "@InfoGata@mastodon.online";
  const gitUrl = "https://github.com/InfoGata/audiogata";

  // Tapping the version copies the build plus the platform behind it: the
  // things a bug report is useless without and that nobody can be expected to
  // find on their own.
  const copyBuildReport = async () => {
    try {
      await navigator.clipboard.writeText(buildReport());
      toast.success(t("buildDetailsCopied"));
    } catch {
      // No clipboard on an insecure origin, or the user denied it. The version
      // is on screen either way, which is the part that matters.
      toast.error(t("buildDetailsCopyFailed"));
    }
  };

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
      title: "X",
      description: xAt,
      icon: <FaXTwitter />,
      url: xUrl,
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
      link: { to: "/donate" },
    },
    {
      title: t("privacyPolicy"),
      icon: <FaLock />,
      link: { to: "/privacy" },
    },
    {
      title: t("version"),
      description: appBuild,
      icon: <FaCircleInfo />,
      action: copyBuildReport,
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

export const Route = createFileRoute("/about")({
  component: About,
});
