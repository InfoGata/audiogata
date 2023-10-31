import { Backdrop, CircularProgress } from "@mui/material";
import React from "react";

interface SpinnerProps {
  open?: boolean;
}

const Spinner: React.FC<SpinnerProps> = (props) => {
  const { open } = props;
  return (
    <Backdrop open={open ?? true}>
      <CircularProgress color="inherit" />
    </Backdrop>
  );
};
export default Spinner;
