import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setEnableChatBot, setLlmKey } from "@/store/reducers/settingsReducer";
import React from "react";
import { useTranslation } from "react-i18next";
import { Switch } from "../ui/switch";
import { Label } from "../ui/label";
import { Input } from "../ui/input";

const ChatBotSetting: React.FC = () => {
  const { t } = useTranslation("settings");
  const dispatch = useAppDispatch();
  const enableChatBot = useAppSelector((state) => state.settings.enableChatBot);
  const onEnableChatBotChange = (value: boolean) => {
    dispatch(setEnableChatBot(value));
  };
  const llmKey = useAppSelector((state) => state.settings.llmKey);
  const setOpenAiKey = (e: React.ChangeEvent<HTMLInputElement>) =>
    dispatch(setLlmKey(e.target.value));
  return (
    <div>
      <div className="flex items-center space-x-2">
        <Switch
          id="chat-bot"
          checked={enableChatBot}
          onCheckedChange={onEnableChatBotChange}
        />
        <Label htmlFor="chat-bot">{t("enableChatBot")}</Label>
      </div>
      {enableChatBot && (
        <div>
          <Label htmlFor="llm-key">{t("openaiKey")}</Label>
          <Input
            id="llm-key"
            type="password"
            value={llmKey}
            onChange={setOpenAiKey}
          />
        </div>
      )}
    </div>
  );
};

export default ChatBotSetting;
