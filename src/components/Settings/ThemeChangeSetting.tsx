import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import usePlugins from "@/hooks/usePlugins";
import { useTheme } from "@/hooks/useTheme";
import { Theme } from "@/plugintypes";
import { filterAsync, mapAsync } from "@infogata/utils";
import React from "react";
import { useTranslation } from "react-i18next";

const ThemeChangeSetting: React.FC = () => {
  const theme = useTheme();
  const { plugins } = usePlugins();
  const { t } = useTranslation("settings");
  const onThemeChange = async (value: string) => {
    if (value) {
      theme.setTheme(value as Theme);
      const themePlugins = await filterAsync(plugins, (p: any) =>
        p.hasDefined.onChangeTheme()
      );
      await mapAsync(themePlugins, (p: any) =>
        p.remote.onChangeTheme(value as Theme)
      );
    }
  };
  return (
    <div>
      <Select value={theme.theme} onValueChange={onThemeChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Theme" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="light">{t("light")}</SelectItem>
          <SelectItem value="dark">{t("dark")}</SelectItem>
          <SelectItem value="system">{t("system")}</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default ThemeChangeSetting;
