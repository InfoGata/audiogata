import { PluginDescription } from "@/default-plugins";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import { useTranslation } from "react-i18next";

type Props = {
  plugin: PluginDescription;
  addPlugin: (description: PluginDescription) => Promise<void>;
};

const PluginCard = (props: Props) => {
  const { plugin, addPlugin } = props;
  const onClickAdd = () => {
    addPlugin(plugin);
  };
  const { t } = useTranslation();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">{plugin.name}</CardTitle>
        <CardDescription>{plugin.description}</CardDescription>
      </CardHeader>
      <CardFooter>
        <Button onClick={onClickAdd}>{t("addPlugin")}</Button>
      </CardFooter>
    </Card>
  );
};

export default PluginCard;
