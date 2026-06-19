import React from "react";
import { Default } from "./create-caller";

// Component half of the vendored `react-outside-call` package. The `createCaller`
// helper and its types live in `./create-caller` so this file only exports a
// component (keeps react-refresh's only-export-components rule happy).

interface OutsideCallConsumerWrapperProps {
  config: Default;
}

const OutsideCallConsumer: React.FC<OutsideCallConsumerWrapperProps> = ({
  config,
}) => {
  for (const key in config.initCaller) {
    config.call[key] = config.initCaller[key]();
  }
  return null;
};

const OutsideCallConsumerWrapper: React.FC<
  React.PropsWithChildren<OutsideCallConsumerWrapperProps>
> = ({ children, config }) => {
  return (
    <>
      {children}
      <OutsideCallConsumer config={config} />
    </>
  );
};

export default OutsideCallConsumerWrapper;
