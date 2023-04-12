import React from "react";
import PluginsContext, { PluginContextInterface } from "./PluginsContext";

export const withPlugins = <P extends PluginContextInterface>(
  Component: React.ComponentType<P>
) => {
  const displayName = Component.displayName || Component.name || "Component";
  const WrappedComponent: React.FC<Omit<P, keyof PluginContextInterface>> = (
    props
  ) => {
    return (
      <PluginsContext.Consumer>
        {(context) => <Component {...(props as P)} {...context} />}
      </PluginsContext.Consumer>
    );
  };

  WrappedComponent.displayName = `withPlugins(${displayName})`;

  return WrappedComponent;
};
