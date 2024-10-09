import { createFileRoute } from "@tanstack/react-router";
import DisableAutoUpdateSetting from "@/components/Settings/DisableAutoUpdateSettings";
import PlayCurrentTrackStartup from "@/components/Settings/PlayCurrentTrackStartup";
import SelectLyricsPlugin from "@/components/Settings/SelectLyricsPlugin";
import ShowForwardAndRewind from "@/components/Settings/ShowForwardAndRewind";
import ThemeChangeSetting from "@/components/Settings/ThemeChangeSetting";
import UpdateCorsSetting from "@/components/Settings/UpdateCorsSettings";
import React from "react";
// import ChatBotSetting from "@/components/Settings/ChatBotSetting";

const Settings: React.FC = () => {
  return (
    <div className="flex flex-col gap-4">
      <DisableAutoUpdateSetting />
      <PlayCurrentTrackStartup />
      <ShowForwardAndRewind />
      <UpdateCorsSetting />
      <SelectLyricsPlugin />
      <ThemeChangeSetting />
      {/* <ChatBotSetting /> */}
    </div>
  );
};

export const Route = createFileRoute("/settings")({
  component: Settings,
});
