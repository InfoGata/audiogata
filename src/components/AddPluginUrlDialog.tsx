import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  Typography,
} from "@mui/material";
import { nanoid } from "@reduxjs/toolkit";
import React from "react";
import { PluginInfo } from "../plugintypes";
import { FileType } from "../types";
import { getPlugin } from "../utils";
import { ExpandMore } from "@mui/icons-material";
import { useTranslation } from "react-i18next";

interface AddPluginUrlDialogProps {
  open: boolean;
  handleConfirm: (plugin: PluginInfo) => void;
  handleClose: () => void;
}

const AddPluginUrlDialog: React.FC<AddPluginUrlDialogProps> = (props) => {
  const { open, handleClose, handleConfirm } = props;
  const [pluginUrl, setPluginUrl] = React.useState("");
  const [headerKey, setHeaderKey] = React.useState("");
  const [headerValue, setHeaderValue] = React.useState("");
  const { t } = useTranslation(["plugins", "common"]);

  const onChangePluginUrl = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPluginUrl(event.target.value);
  };
  const onChangeHeaderKey = (event: React.ChangeEvent<HTMLInputElement>) => {
    setHeaderKey(event.target.value);
  };
  const onChangeHeaderValue = (event: React.ChangeEvent<HTMLInputElement>) => {
    setHeaderValue(event.target.value);
  };

  const onConfirm = async () => {
    if (!pluginUrl.includes("manifest.json")) {
      alert("The filename 'manifest.json' must be in the url");
      return;
    }
    const headers = new Headers();
    if (headerKey) {
      headers.append(headerKey, headerValue);
    }

    const fileType: FileType = {
      url: {
        url: pluginUrl,
        headers: headers,
      },
    };

    const plugin = await getPlugin(fileType);

    if (plugin) {
      if (!plugin.id) {
        plugin.id = nanoid();
      }
      handleConfirm(plugin);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      aria-labelledby="form-dialog-title"
    >
      <DialogTitle id="form-dialog-title">
        {t("plugins:addPlugin_one")}
      </DialogTitle>
      <DialogContent>
        <DialogContentText>
          {t("plugins:installPluginFromUrl")}
        </DialogContentText>
        <TextField
          onChange={onChangePluginUrl}
          value={pluginUrl}
          placeholder={t("plugins:manifestUrl")}
          variant="outlined"
          fullWidth
        />
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography>{t("plugins:advancedOptions")}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <TextField
              onChange={onChangeHeaderKey}
              value={headerKey}
              placeholder={t("plugins:headerKey")}
              variant="outlined"
            />
            <TextField
              onChange={onChangeHeaderValue}
              value={headerValue}
              placeholder={t("plugins:headerValue")}
              variant="outlined"
            />
          </AccordionDetails>
        </Accordion>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>{t("common:cancel")}</Button>
        <Button onClick={onConfirm}>{t("common:confirm")}</Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddPluginUrlDialog;
