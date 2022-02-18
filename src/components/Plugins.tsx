import React from "react";
import { Button, Divider, Grid, styled } from "@mui/material";
import Spotify from "../plugins/spotify";
import { nanoid } from "@reduxjs/toolkit";
import { PluginInfo } from "../models";
import { usePlugins } from "../PluginsContext";
import PluginContainer from "./PluginContainer";

export interface DirectoryFile extends File {
  webkitRelativePath: string;
}

export interface UrlInfo {
  url: string;
  headers: Headers;
}

export interface FileType {
  filelist?: FileList;
  url?: UrlInfo;
}

interface Manifest {
  name: string;
  script: string;
  description?: string;
  options?: string;
}

const Input = styled("input")({
  display: "none",
});

function getFileByDirectoryAndName(files: FileList, name: string) {
  if (files.length === 0) {
    return null;
  }
  const firstFile = files[0] as DirectoryFile;
  const directory = firstFile.webkitRelativePath.split("/")[0];
  for (let i = 0; i < files.length; i++) {
    const file = files[i] as DirectoryFile;
    if (file.webkitRelativePath === `${directory}/${name}`) {
      return file;
    }
  }
  return null;
}

async function getFileText(
  fileType: FileType,
  name: string
): Promise<string | null> {
  if (fileType.filelist) {
    const file = getFileByDirectoryAndName(fileType.filelist, name);
    if (!file) {
      alert(`Error: Couldn't find ${name}`);
      return null;
    }

    return await file.text();
  } else if (fileType.url) {
    const encodedName = encodeURIComponent(name);
    const newUrl = fileType.url.url.replace("manifest.json", encodedName);
    try {
      const result = await fetch(newUrl, { headers: fileType.url.headers });
      return await result.text();
    } catch {
      alert(`Error: Couldn't get ${name}`);
      return null;
    }
  }
  return null;
}

async function getPlugin(fileType: FileType): Promise<PluginInfo | null> {
  const manifestText = await getFileText(fileType, "manifest.json");
  if (!manifestText) return null;

  const manifest = JSON.parse(manifestText) as Manifest;
  if (!manifest.script) {
    alert("Error: Manifest does not contain script");
    return null;
  }

  const script = await getFileText(fileType, manifest.script);
  if (!script) return null;

  const plugin: PluginInfo = {
    id: nanoid(),
    name: manifest.name,
    script,
    description: manifest.description,
  };

  if (manifest.options) {
    const optionsText = await getFileText(fileType, manifest.options);
    if (!optionsText) return null;

    plugin.optionsHtml = optionsText;
  }

  return plugin;
}

const Plugins: React.FC = () => {
  const { plugins, addPlugin, deletePlugin } = usePlugins();
  const directoryProps = {
    directory: "",
    webkitdirectory: "",
    mozdirectory: "",
  };
  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const fileType: FileType = {
      filelist: files,
    };
    const plugin = await getPlugin(fileType);

    if (plugin) {
      await addPlugin(plugin);
    }
  };

  const onSpotifyLoginClick = async () => {
    await Spotify.login();
  };

  const pluginComponents = plugins.map((plugin) => (
    <PluginContainer
      key={plugin.id}
      plugin={plugin}
      deletePlugin={deletePlugin}
    />
  ));

  return (
    <Grid>
      <label htmlFor="contained-button-file">
        <Input
          id="contained-button-file"
          type="file"
          {...directoryProps}
          onChange={onFileChange}
        />
        <Button variant="contained" component="span">
          Load plugin From Folder
        </Button>
      </label>
      <Divider />
      {pluginComponents}
      <Button onClick={onSpotifyLoginClick}>Login to Spotify</Button>
    </Grid>
  );
};

export default Plugins;
