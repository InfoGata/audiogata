import { ThemeProvider } from "@/providers/ThemeProvider";
import { Root } from "@/routes/__root";
import {
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { render } from "@testing-library/react";
import React, { PropsWithChildren } from "react";
import { Provider } from "react-redux";
import store from "../store/store";

export function renderWithProviders(ui: React.ReactElement) {
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
  return { store, ...render(ui, { wrapper: Wrapper }) };
}
