import React from "react";
import { NavigationLinkItem } from "../types";
import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Link } from "@tanstack/react-router";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import { setNavbarOpen } from "@/store/reducers/uiReducer";

interface NavigationLinkProps {
  item: NavigationLinkItem;
}

const NavigationLink: React.FC<NavigationLinkProps> = (props) => {
  const { item } = props;
  const open = useAppSelector((state) => state.ui.navbarOpen);
  const dispatch = useAppDispatch();
  const { isMd } = useBreakpoint("md");
  const onClick = () => {
    // if not md, navigation is in a sheet component.
    if (!isMd) {
      dispatch(setNavbarOpen(false));
    }
  };

  const Component = (props: {
    children: React.ReactNode;
    className?: string;
  }) => {
    return item.link ? (
      <Link
        className={props.className}
        activeProps={{ className: "bg-muted" }}
        to={item.link}
        onClick={onClick}
      >
        {props.children}
      </Link>
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
          <span>
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
                    "text-background hidden transition-all duration-300 group-hover:z-50 group-hover:ml-4 group-hover:rounded group-hover:bg-foreground group-hover:p-2 group-hover:opacity-100"
                )}
              >
                {item.title}
              </span>
            </Component>
          </span>
        </TooltipTrigger>
        <TooltipContent side="right">
          <p>{item.title}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
export default NavigationLink;
