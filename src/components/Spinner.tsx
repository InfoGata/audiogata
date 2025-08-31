import { Loader2 } from "lucide-react";
import React from "react";

interface SpinnerProps {
  open?: boolean;
}

const Spinner: React.FC<SpinnerProps> = (props) => {
  const { open } = props;
  const isOpen = open ?? true;
  if (!isOpen) return null;

  return (
    <div className="fixed flex items-center justify-center bg-black/50 top-0 left-0 right-0 bottom-0">
      <Loader2 className="size-8 animate-spin" />
    </div>
  );
};
export default Spinner;
