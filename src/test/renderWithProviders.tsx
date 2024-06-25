import PluginsProvider from "@/providers/PluginsProvider";
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
import { QueryClient, QueryClientProvider } from "react-query";
import { Provider } from "react-redux";
import store from "../store/store";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

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
          <QueryClientProvider client={queryClient}>
            <PluginsProvider>
              <RouterProvider router={router as any} />
            </PluginsProvider>
          </QueryClientProvider>
        </ThemeProvider>
      </Provider>
    );
  }
  return { store, ...render(ui, { wrapper: Wrapper }) };
}
