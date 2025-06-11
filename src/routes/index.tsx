import PluginCards from "@/components/PluginCards/PluginCards";
import { createFileRoute } from "@tanstack/react-router";
import React from "react";
import TopItemCards from "../components/TopItemCards";
import { ExtensionBanner } from "@/components/ExtensionBanner";

export const Index: React.FC = () => {
  return (
    <>
      <ExtensionBanner />
      <TopItemCards />
      <PluginCards />
    </>
  );
};

export const Route = createFileRoute("/")({
  component: Index,
});
