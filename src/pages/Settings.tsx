import DisableAutoUpdateSetting from "@/components/Settings/DisableAutoUpdateSettings";
import PlayCurrentTrackStartup from "@/components/Settings/PlayCurrentTrackStartup";
import SelectLyricsPlugin from "@/components/Settings/SelectLyricsPlugin";
import ShowForwardAndRewind from "@/components/Settings/ShowForwardAndRewind";
import UpdateCorsSetting from "@/components/Settings/UpdateCorsSettings";
import React from "react";

const Settings: React.FC = () => {
  return (
    <div>
      <DisableAutoUpdateSetting />
      <PlayCurrentTrackStartup />
      <ShowForwardAndRewind />
      <SelectLyricsPlugin />
      <UpdateCorsSetting />
    </div>
  );
};

export default Settings;
