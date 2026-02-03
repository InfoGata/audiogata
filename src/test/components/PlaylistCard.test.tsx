import React from "react";
import { afterEach, describe, expect, test, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import PlaylistCard from "../../components/PlaylistCard";
import { PlaylistInfo } from "../../plugintypes";
import "@testing-library/jest-dom/vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Provider } from "react-redux";
import store from "../../store/store";

// Mock the router Link component
vi.mock("@tanstack/react-router", () => ({
  Link: ({ children, to, params }: any) => (
    <a
      href={`${to}?pluginId=${params?.pluginId}&apiId=${params?.apiId}`}
      data-testid="router-link"
    >
      {children}
    </a>
  ),
}));

// Mock utils.ts to include needed functions
vi.mock("../../utils", async () => {
  const actual = await vi.importActual("../../utils");
  return {
    ...actual,
    getThumbnailImage: vi.fn((images: any) =>
      images && images.length > 0 ? images[0].url : undefined
    ),
    playlistThumbnailSize: 200,
  };
});

// Mock ItemMenu component
vi.mock("@/components/ItemMenu", () => ({
  // eslint-disable-next-line i18next/no-literal-string
  default: vi.fn(() => <div data-testid="item-menu">Menu</div>),
}));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

function renderWithMinimalProviders(ui: React.ReactElement) {
  return render(ui, {
    wrapper: ({ children }) => (
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      </Provider>
    ),
  });
}

describe("PlaylistCard", () => {
  afterEach(() => {
    cleanup();
  });

  test("renders playlist name", () => {
    const playlist: PlaylistInfo = {
      id: "playlist-1",
      apiId: "api-1",
      pluginId: "plugin-1",
      name: "Test Playlist",
      images: [{ url: "test-image.jpg" }],
    };

    renderWithMinimalProviders(<PlaylistCard playlist={playlist} />);

    expect(screen.getByText("Test Playlist")).toBeInTheDocument();
  });

  test("renders playlist image", () => {
    const playlist: PlaylistInfo = {
      id: "playlist-1",
      apiId: "api-1",
      pluginId: "plugin-1",
      name: "Test Playlist",
      images: [{ url: "test-image.jpg" }],
    };

    const { container } = renderWithMinimalProviders(
      <PlaylistCard playlist={playlist} />
    );

    const playlistCardDiv = container.querySelector(".min-w-64");
    expect(playlistCardDiv).not.toBeNull();

    const image = playlistCardDiv?.querySelector("img");
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute("src", "test-image.jpg");
  });

  test("handles playlist without image", () => {
    const playlist: PlaylistInfo = {
      id: "playlist-1",
      apiId: "api-1",
      pluginId: "plugin-1",
      name: "Test Playlist",
      images: [],
    };

    const { container } = renderWithMinimalProviders(
      <PlaylistCard playlist={playlist} />
    );

    const playlistCardDiv = container.querySelector(".min-w-64");
    expect(playlistCardDiv).not.toBeNull();

    const image = playlistCardDiv?.querySelector("img");
    expect(image).toBeInTheDocument();
    // Since we're mocking getThumbnailImage, it will return undefined
    expect(image?.getAttribute("src")).toBeFalsy();
  });

  test("renders item menu", () => {
    const playlist: PlaylistInfo = {
      id: "playlist-1",
      apiId: "api-1",
      pluginId: "plugin-1",
      name: "Test Playlist",
      images: [{ url: "test-image.jpg" }],
    };

    const { container } = renderWithMinimalProviders(
      <PlaylistCard playlist={playlist} />
    );

    const playlistCardDiv = container.querySelector(".min-w-64");
    expect(playlistCardDiv).not.toBeNull();

    const menu = playlistCardDiv?.querySelector('[data-testid="item-menu"]');
    expect(menu).toBeInTheDocument();
  });

  test("sanitizes playlist name", () => {
    const playlist: PlaylistInfo = {
      id: "playlist-1",
      apiId: "api-1",
      pluginId: "plugin-1",
      name: "<script>alert('XSS')</script>Test Playlist",
      images: [{ url: "test-image.jpg" }],
    };

    const { container } = renderWithMinimalProviders(
      <PlaylistCard playlist={playlist} />
    );

    const playlistCardDiv = container.querySelector(".min-w-64");
    expect(playlistCardDiv).not.toBeNull();

    // Look for the sanitized text directly within the component
    const nameElement = playlistCardDiv?.querySelector("h3");
    expect(nameElement?.textContent).toBe("Test Playlist");
    expect(nameElement?.textContent).not.toContain("<script>");
  });
});
