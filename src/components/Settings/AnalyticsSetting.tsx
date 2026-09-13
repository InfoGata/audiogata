import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { analyticsConfigured, doNotTrackEnabled } from "@/lib/analytics";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setDisableAnalytics } from "@/store/reducers/settingsReducer";
import { Link } from "@tanstack/react-router";
import React from "react";
import { useTranslation } from "react-i18next";

const AnalyticsSetting: React.FC = () => {
  const { t } = useTranslation("settings");
  const dispatch = useAppDispatch();
  const disableAnalytics = useAppSelector(
    (state) => state.settings.disableAnalytics
  );

  // Nothing to offer a switch for in a build with no key.
  if (!analyticsConfigured) return null;

  const doNotTrack = doNotTrackEnabled();

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center space-x-2">
        <Switch
          id="share-analytics"
          // Left interactive under Do Not Track so the choice is still
          // recorded, but shown off because that is what's actually happening.
          checked={!disableAnalytics && !doNotTrack}
          onCheckedChange={(checked) => dispatch(setDisableAnalytics(!checked))}
        />
        <Label htmlFor="share-analytics">{t("shareAnalytics")}</Label>
      </div>
      <p className="text-sm text-muted-foreground">
        {t("shareAnalyticsDescription")}{" "}
        <Link to="/privacy" className="text-primary hover:underline">
          {t("whatIsCollected")}
        </Link>
      </p>
      {doNotTrack && (
        <p className="text-sm text-muted-foreground">{t("doNotTrackActive")}</p>
      )}
    </div>
  );
};

export default AnalyticsSetting;
