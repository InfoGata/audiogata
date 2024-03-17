import PluginCards from "@/components/PluginCards/PluginCards";
import { Typography } from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import TopItemCards from "../components/TopItemCards";

const Home: React.FC = () => {
  const { t } = useTranslation();
  return (
    <>
      <Typography variant="h4">{t("greeting")}</Typography>
      <TopItemCards />
      <PluginCards />
    </>
  );
};

export default Home;
