import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setNavbarOpen } from "@/store/reducers/uiReducer";
import React from "react";
import { useTranslation } from "react-i18next";
import Navigation from "./Navigation";

const MobileSidebar: React.FC = () => {
  const { t } = useTranslation();
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
      <SheetContent side="left" className="w-72 overflow-y-auto" aria-describedby={undefined}>
        <SheetTitle className="sr-only">{t("navigationMenu")}</SheetTitle>
        <Navigation />
      </SheetContent>
    </Sheet>
  );
};

export default MobileSidebar;
