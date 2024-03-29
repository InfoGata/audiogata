import React from "react";
import { DropdownMenuItem } from "./ui/dropdown-menu";
import { Link } from "react-router-dom";
import { ItemMenuType } from "@/types";

export interface DropdownItemProps {
  title: string;
  icon: JSX.Element;
  action?: (item?: ItemMenuType) => void;
  item?: ItemMenuType;
  url?: string;
  internalPath?: string;
}

const DropdownItem: React.FC<DropdownItemProps> = (props) => {
  const { title, icon, action, url, internalPath, item } = props;
  const InnerComponent = (props: { children: React.ReactNode }) => {
    if (internalPath) {
      return (
        <Link to={internalPath} className="flex items-center">
          {props.children}
        </Link>
      );
    }
    if (url) {
      return (
        <a href={url} target="_blank" className="flex items-center">
          {props.children}
        </a>
      );
    }
    return <>{props.children}</>;
  };

  const onClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (action) {
      action(item);
    }
  };

  return (
    <DropdownMenuItem onClick={onClick} className="cursor-pointer">
      <InnerComponent>
        {icon}
        <span>{title}</span>
      </InnerComponent>
    </DropdownMenuItem>
  );
};

export default DropdownItem;
