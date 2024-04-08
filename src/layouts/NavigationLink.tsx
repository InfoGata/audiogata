import React from "react";
import { NavLink } from "react-router-dom";
import { NavigationLinkItem } from "../types";
import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";
import { useAppSelector } from "@/store/hooks";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface NavigationLinkProps {
  item: NavigationLinkItem;
}

const NavigationLink: React.FC<NavigationLinkProps> = (props) => {
  const { item } = props;
  const open = useAppSelector((state) => state.ui.navbarOpen);
  const Component = (props: {
    children: React.ReactNode;
    className?: string;
  }) => {
    return item.link ? (
      <NavLink
        className={({ isActive }) =>
          cn(props.className, isActive && "bg-muted")
        }
        to={item.link}
        end
      >
        {props.children}
      </NavLink>
    ) : (
      <Button
        className={cn(props.className, "w-full")}
        variant="ghost"
        onClick={item.action}
      >
        {props.children}
      </Button>
    );
  };
  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger>
          <Component
            className={cn(
              buttonVariants({ variant: "ghost" }),
              "relative flex h-12 justify-start"
            )}
          >
            {item.icon}
            <span
              className={cn(
                "absolute left-12 text-base duration-200",
                !open &&
                  "text-background opacity-0 transition-all duration-300 group-hover:z-50 group-hover:ml-4 group-hover:rounded group-hover:bg-foreground group-hover:p-2 group-hover:opacity-100"
              )}
            >
              {item.title}
            </span>
          </Component>
        </TooltipTrigger>
        <TooltipContent side="right">
          <p>{item.title}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
export default NavigationLink;
