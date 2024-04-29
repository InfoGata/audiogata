import Alert from "@/components/Alert";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { MoreHorizontalIcon } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";
import { FaTrash } from "react-icons/fa6";
import { PluginFrameContainer } from "../../PluginsContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Link } from "@tanstack/react-router";

interface PluginContainerProps {
  plugin: PluginFrameContainer;
  deletePlugin: (plugin: PluginFrameContainer) => Promise<void>;
}

const PluginContainer: React.FC<PluginContainerProps> = (props) => {
  const { plugin, deletePlugin } = props;
  const [alertOpen, setAlertOpen] = React.useState(false);
  const { t } = useTranslation("plugins");

  const onDelete = async () => {
    setAlertOpen(true);
  };

  const confirmDelete = async () => {
    await deletePlugin(plugin);
  };

  return (
    <div>
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">
          {plugin.name} {plugin.version}
        </h3>
        <div className="flex gap-2 items-center">
          {plugin.hasOptions && (
            <Link
              className={cn(buttonVariants({ variant: "outline" }))}
              to="/plugins/$pluginId/options"
              params={{ pluginId: plugin.id || "" }}
            >
              {t("options")}
            </Link>
          )}
          <Link
            className={cn(buttonVariants({ variant: "outline" }))}
            to={`/plugins/${plugin.id}`}
          >
            {t("pluginDetails")}
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="data-[state=open]:bg-muted"
              >
                <MoreHorizontalIcon />
                <span className="sr-only">{t("openMenu")}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem className="cursor-pointer" onClick={onDelete}>
                <FaTrash />
                <span>{t("deletePlugin")}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <Alert
        title={t("deletePlugin")}
        description={t("confirmDelete")}
        setOpen={setAlertOpen}
        open={alertOpen}
        confirm={confirmDelete}
      />
    </div>
  );
};

export default PluginContainer;
