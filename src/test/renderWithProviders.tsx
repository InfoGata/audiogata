import { PreloadedState } from "@reduxjs/toolkit";
import { RenderOptions, render } from "@testing-library/react";
import React, { PropsWithChildren } from "react";
import { Provider } from "react-redux";
import { AppState, AppStore, setupStore } from "../store/store";
import {
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { Root } from "@/routes/__root";
import { ThemeProvider } from "@/providers/ThemeProvider";

// as allows the user to specify other things such as initialState, store.
interface ExtendedRenderOptions extends Omit<RenderOptions, "queries"> {
  preloadedState?: PreloadedState<AppState>;
  store?: AppStore;
}

export function renderWithProviders(
  ui: React.ReactElement,
  {
    preloadedState = {},
    // Automatically create a store instance if no store was passed in
    store = setupStore(preloadedState),
    ...renderOptions
  }: ExtendedRenderOptions = {}
) {
  function Wrapper({ children }: PropsWithChildren<unknown>): JSX.Element {
    const rootRoute = createRootRoute({
      component: Root,
    });
    const route = createRoute({
      getParentRoute: () => rootRoute,
      path: "/",
      component: () => <>{children}</>,
    });

    const router = createRouter({
      routeTree: rootRoute.addChildren([route]),
      history: createMemoryHistory(),
    });
    return (
      <Provider store={store}>
        <ThemeProvider defaultTheme="dark">
          <RouterProvider router={router} />
        </ThemeProvider>
      </Provider>
    );
  }
  return { store, ...render(ui, { wrapper: Wrapper, ...renderOptions }) };
}
