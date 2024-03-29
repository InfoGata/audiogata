import React from "react";
import { useTranslation } from "react-i18next";
import { PluginMethodInterface } from "../PluginsContext";
import usePlugins from "../hooks/usePlugins";
import { useAppDispatch, useAppStore } from "../store/hooks";
import { setCurrentPluginId } from "../store/reducers/settingsReducer";
import { filterAsync } from "../utils";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

interface SelectPluginProps {
  methodName: keyof PluginMethodInterface;
  pluginId: string;
  setPluginId: (value: string) => void;
  noneOption?: boolean;
  labelText?: string;
  useCurrentPlugin?: boolean;
}

const SelectPlugin: React.FC<SelectPluginProps> = (props) => {
  const {
    methodName,
    setPluginId,
    pluginId,
    noneOption,
    labelText,
    useCurrentPlugin,
  } = props;
  const { plugins } = usePlugins();
  const [options, setOptions] = React.useState<[string, string][]>();
  const dispatch = useAppDispatch();
  const store = useAppStore();
  const { t } = useTranslation();

  React.useEffect(() => {
    const getOptions = async () => {
      const validPlugins = await filterAsync(plugins, (p) =>
        p.methodDefined(methodName)
      );
      if (useCurrentPlugin) {
        const currentPluginId = store.getState().settings.currentPluginId;
        if (
          !currentPluginId ||
          !validPlugins.some((p) => p.id === currentPluginId)
        ) {
          setPluginId(validPlugins[0]?.id || "");
        } else {
          setPluginId(currentPluginId);
        }
      }

      const options: [string, string][] = validPlugins.map((p) => [
        p.id || "",
        p.name || "",
      ]);
      setOptions(options);
    };
    getOptions();
  }, [plugins, methodName, setPluginId, store, useCurrentPlugin]);

  const optionsComponents = options?.map((option) => (
    <SelectItem key={option[0]} value={option[0]}>
      {option[1]}
    </SelectItem>
  ));

  const onSelectPluginChange = (pluginId: string) => {
    dispatch(setCurrentPluginId(pluginId));
    setPluginId(pluginId);
  };

  return (
    <div className="grid w-full items-center gap-1.5">
      <Label htmlFor="select-plugin">
        {labelText ? labelText : t("plugin")}
      </Label>
      <Select value={pluginId} onValueChange={onSelectPluginChange}>
        <SelectTrigger>
          <SelectValue placeholder={t("plugin")} />
        </SelectTrigger>
        <SelectContent id="select-plugin">
          {!!noneOption && <SelectItem value="">{t("none")}</SelectItem>}
          {optionsComponents}
        </SelectContent>
      </Select>
    </div>
  );
};

export default SelectPlugin;
