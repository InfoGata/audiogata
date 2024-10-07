import React from "react";
import { CoreMessage, streamText, tool } from "ai";
import ChatBot, { Button, Flow, Params, Settings, useFlow } from "react-chatbotify";
import { createOpenAI } from "@ai-sdk/openai";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { addTrack, pause, play } from "@/store/reducers/trackReducer";
import { setLlmKey } from "@/store/reducers/settingsReducer";
import { Converter } from "showdown";
import DOMPurify from "dompurify";
import { addPlaylist, addPlaylistTracks } from "@/store/reducers/playlistReducer";
import usePluginWithMethod from "@/hooks/useSearchPlugin";
import { Track } from "@/plugintypes";
import { PluginFrameContainer } from "@/PluginsContext";
let messages: CoreMessage[]= [];
let hasError = false;
const markdownConverter = new Converter();

const searchTracks = async (
  query: string,
  searchPlugin?: PluginFrameContainer
): Promise<Track | undefined> => {
  if (searchPlugin) {
    if (await searchPlugin?.hasDefined.onSearchTracks()) {
      const searchResults = await searchPlugin.remote.onSearchTracks({
        query: query,
      });
      const track = searchResults.items[0];
      return track;
    } else {
      const searchResults = await searchPlugin.remote.onSearchAll({
        query: query,
      });
      const track = searchResults.tracks?.items[0];
      return track;
    }
  }
};

const AudioChatBot: React.FC = () => {
  const playlists = useAppSelector((state) => state.playlist.playlists);
  const llmKey = useAppSelector((state) => state.settings.llmKey);
  const { restartFlow } = useFlow();
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const setApiKey = (key: string) => {
    dispatch(setLlmKey(key));
  }
  const searchPlugin = usePluginWithMethod("onSearchAll");

  const clearMessages = () => {
    messages = [];
    restartFlow();
  };

  const callAi = React.useCallback(async (params: Params) => {
    const model = "gpt-4o-mini";
    try {
      const openai = createOpenAI({
        apiKey: llmKey,
      });

      messages.push({
        role: "user",
        content: params.userInput,
      });

      const tools = {
        createPlaylist: tool({
          description: "Create a playlist",
          parameters: z.object({
            name: z.string().describe("The name of the playlist"),
          }),
          async execute(params) {
            const playlist = {
              name: params.name,
              tracks: [],
            };
            dispatch(addPlaylist(playlist));
            return `Playlist ${params.name} created`;
          },
        }),
        play: tool({
          description: "Play current track",
          parameters: z.object({}),
          async execute() {
            dispatch(play());
            return "Playing current track";
          },
        }),
        pause: tool({
          description: "Pause current track",
          parameters: z.object({}),
          async execute() {
            dispatch(pause());
            return "Pausing current track";
          },
        }),
        addTrackToPlaylist: tool({
          description: "Add track to playlist",
          parameters: z.object({
            playlistName: z.string().describe("The name of the playlist"),
            trackName: z.string().describe("The name of the track"),
            artistName: z.string().describe("The name of the artist"),
          }),
          async execute(params) {
            const searchQuery = `${params.artistName} - ${params.trackName}`;
            const track = await searchTracks(searchQuery, searchPlugin);
            if (track) {
              const playlist = playlists.find(p => p.name === params.playlistName);
              if (playlist) {
                dispatch(addPlaylistTracks(playlist, [track]));
              }
            }
            return `Track ${params.trackName} by ${params.artistName} added to playlist ${params.playlistName}`;
          },
        }),
        addTrackToQueue: tool({
          description: "Add track to queue",
          parameters: z.object({
            trackName: z.string().describe("The name of the track"),
            artistName: z.string().describe("The name of the artist"),
          }),
          async execute(params) {
            const searchQuery = `${params.artistName} - ${params.trackName}`;
            const track = await searchTracks(searchQuery, searchPlugin);
            console.log(searchPlugin);
            console.log(track);
            if (track) {
              dispatch(addTrack(track));
            }
            return `Track ${params.trackName} by ${params.artistName} added to queue`;
          },
        }),
      };

      const { textStream } = await streamText({
        model: openai(model),
        messages,
        maxSteps: 5,
        tools,
        onFinish: ({ text }) => {
          messages.push({
            role: "assistant",
            content: text,
          });
        },
      });

      let text = "";
      for await (const chunk of textStream) {
        text += chunk;
        const sanitizer = DOMPurify.sanitize;
        await params.streamMessage(sanitizer(markdownConverter.makeHtml(text)));
      }
    } catch {
      await params.injectMessage("Unable to load model");
      hasError = true;
    }
  }, [dispatch, llmKey, searchPlugin, playlists]);
  const flow: Flow = {
    start: {
      message: llmKey ? "Ask me anything!" : "Enter you OpenAI API key",
      path: llmKey ? "loop" : "api_key",
      isSensitive: llmKey ? false : true,
    },
    api_key: {
      message: (params: Params) => {
        setApiKey(params.userInput.trim());
        return "Ask me anything!";
      },
      path: "loop",
    },
    loop: {
      message: async (params: Params) => {
        await callAi(params);
      },
      path: () => {
        if (hasError) {
          return "start";
        }
        return "loop";
      },
    },
  };

  const settings: Settings = {
    general: {
      showFooter: false
    },
    header: {
      showAvatar: false,
      title: "",
      buttons: [
        <button key="clear" onClick={clearMessages}>{t("clear")}</button>,
        Button.CLOSE_CHAT_BUTTON
      ]
    },
    chatHistory: {
      disabled: true
    },
    notification: {
      disabled: true
    },
    tooltip: {
      mode: "NEVER"
    },
    botBubble: {
      dangerouslySetInnerHtml: true
    }
  }
  return (
    <ChatBot
      flow={flow}
      settings={settings}
      styles={{ chatButtonStyle: { display: "none" } }}
    />
  );
};

export default AudioChatBot;
