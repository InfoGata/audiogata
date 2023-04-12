import React from "react";
import { ItemMenuType } from "./types";

export interface ItemMenuInterface {
  openItemMenu: (
    event: React.MouseEvent<HTMLButtonElement>,
    item: ItemMenuType
  ) => Promise<void>;
}

const ItemMenuContext = React.createContext<ItemMenuInterface>(undefined!);

export default ItemMenuContext;
