import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setNavbarOpen } from "@/store/reducers/uiReducer";
import React from "react";
import Navigation from "./Navigation";

const MobileSidebar: React.FC = () => {
  const open = useAppSelector((state) => state.ui.navbarOpen);
  const dispatch = useAppDispatch();
  const setOpen = (value: boolean) => dispatch(setNavbarOpen(value));
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent side="left" className="w-72 overflow-y-scroll">
        <Navigation />
      </SheetContent>
    </Sheet>
  );
};

export default MobileSidebar;
