import React from "react";
import ItemMenuContext from "../ItemMenuContext";
import { ItemMenuType } from "../types";

const useItemMenu = () => {
  const { openItemMenu } = React.useContext(ItemMenuContext);

  const openMenu = (
    event: React.MouseEvent<HTMLButtonElement>,
    item: ItemMenuType
  ) => {
    openItemMenu(event, item);
  };

  return { openMenu };
};

export default useItemMenu;
