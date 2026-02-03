import { ExtensionProvider } from "@/contexts/ExtensionContext";
import { PluginsProvider } from "@/contexts/PluginsContext";
import { ThemeProvider } from "@infogata/shadcn-vite-theme-provider";
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
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Provider } from "react-redux";
import store from "../store/store";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

export function renderWithProviders(ui: React.ReactElement) {
  function Wrapper({ children }: PropsWithChildren<unknown>): React.ReactElement {
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
          <ExtensionProvider>
            <QueryClientProvider client={queryClient}>
              <PluginsProvider>
                <RouterProvider router={router as any} />
              </PluginsProvider>
            </QueryClientProvider>
          </ExtensionProvider>
        </ThemeProvider>
      </Provider>
    );
  }
  return { store, ...render(ui, { wrapper: Wrapper }) };
}
