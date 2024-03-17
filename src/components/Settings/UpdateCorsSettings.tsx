import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { saveCorsProxyUrl } from "@/store/reducers/settingsReducer";
import React from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

const UpdateCorsSetting: React.FC = () => {
  const dispatch = useAppDispatch();
  const corsProxyUrl = useAppSelector((state) => state.settings.corsProxyUrl);
  const [corsProxy, setCorsProxy] = React.useState(corsProxyUrl);
  const { t } = useTranslation(["common", "settings"]);
  const onCorsProxyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCorsProxy(e.target.value);
  };

  const onCorsProxySave = () => {
    dispatch(saveCorsProxyUrl(corsProxy));
    toast.success("Saved Cors Proxy Url");
  };

  return (
    <div className="flex w-full max-w-sm items-end gap-2">
      <div className="grid space-y-2">
        <Label htmlFor="cors-proxy">{t("settings:corsProxy")}</Label>
        <Input
          id="cors-proxy"
          placeholder="https://example.com"
          value={corsProxy}
          onChange={onCorsProxyChange}
        />
      </div>
      <Button type="submit" onClick={onCorsProxySave}>
        {t("common:save")}
      </Button>
    </div>
  );
};

export default UpdateCorsSetting;
