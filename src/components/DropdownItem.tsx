import React from "react";
import { DropdownMenuItem } from "./ui/dropdown-menu";
import { ItemMenuType } from "@/types";
import { Link } from "@tanstack/react-router";

export interface DropdownItemProps {
  title: string;
  icon: React.JSX.Element;
  action?: (item?: ItemMenuType) => void;
  item?: ItemMenuType;
  url?: string;
  internalPath?: string;
  setOpen?: (open: boolean) => void;
}

const DropdownItem: React.FC<DropdownItemProps> = (props) => {
  const { title, icon, action, url, internalPath, item, setOpen } = props;
  const onLinkClick = () => {
    if (setOpen) {
      setOpen(false);
    }
  };
  const InnerComponent = (props: { children: React.ReactNode }) => {
    if (internalPath) {
      return (
        <Link
          to={internalPath}
          onClick={onLinkClick}
          className="flex items-center w-full"
        >
          {props.children}
        </Link>
      );
    }
    if (url) {
      return (
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="flex items-center w-full"
        >
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
