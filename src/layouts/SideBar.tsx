import { cn } from "@/lib/utils";
import React from "react";
import { useAppSelector } from "../store/hooks";
import Navigation from "./Navigation";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import MobileSidebar from "./MobileSidebar";

const SideBar: React.FC = () => {
  const navbarOpen = useAppSelector((state) => state.ui.navbarOpen);
  const { isMd } = useBreakpoint("md");

  return (
    <div
      className={cn(
        "pt-16 hidden h-screen flex-shrink-0 md:block duration-500 bg-background",
        navbarOpen ? "w-52" : "w-20"
      )}
    >
      <div className="border-r h-full overflow-y-scroll pb-28">
        <div className="mt-3 space-y-1 px-3 py-2 text-muted-foreground">
          <Navigation />
        </div>
      </div>
      {!isMd && <MobileSidebar />}
    </div>
  );
};

export default SideBar;
