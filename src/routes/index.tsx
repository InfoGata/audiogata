import { createFileRoute } from "@tanstack/react-router";
import PluginCards from "@/components/PluginCards/PluginCards";
import React from "react";
import { useTranslation } from "react-i18next";
import TopItemCards from "../components/TopItemCards";

export const Index: React.FC = () => {
  const { t } = useTranslation();
  return (
    <>
      <h3 className="text-2xl">{t("greeting")}</h3>
      <TopItemCards />
      <PluginCards />
    </>
  );
};

export const Route = createFileRoute("/")({
  component: Index,
});
