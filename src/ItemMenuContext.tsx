import React from "react";
import { ItemMenuType } from "./types";

export interface ItemMenuInterface {
  openItemMenu: (
    event: React.MouseEvent<HTMLButtonElement>,
    item: ItemMenuType
  ) => Promise<void>;
}

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const ItemMenuContext = React.createContext<ItemMenuInterface>(undefined!);

export default ItemMenuContext;
