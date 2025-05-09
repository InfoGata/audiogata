import React from "react";
import { describe, expect, test, vi } from "vitest";
import { screen } from "@testing-library/react";
import PlaylistCard from "../../components/PlaylistCard";
import { PlaylistInfo } from "../../plugintypes";
import { renderWithProviders } from "../renderWithProviders";
import "@testing-library/jest-dom/vitest"; // Import jest-dom matchers

// Mock the router link component since we're not testing navigation
vi.mock("@tanstack/react-router", async () => {
  const actual = await vi.importActual("@tanstack/react-router");
  return {
    ...actual,
    Link: vi.fn(({ children, to, params }: any) => (
      <a href={`${to}?pluginId=${params?.pluginId}&apiId=${params?.apiId}`} data-testid="router-link">
        {children}
      </a>
    ))
  };
});

// Mock utils.ts to include needed functions
vi.mock("../../utils", async () => {
  const actual = await vi.importActual("../../utils");
  return {
    ...actual,
    getThumbnailImage: vi.fn((images) => 
      images && images.length > 0 ? images[0].url : undefined
    ),
    playlistThumbnailSize: 200,
    formatSeconds: vi.fn((_sec) => "00:00"),
    playerThumbnailSize: 70,
  };
});

// Mock ItemMenu component
vi.mock("@/components/ItemMenu", () => ({
  // eslint-disable-next-line i18next/no-literal-string
  default: vi.fn(() => <div data-testid="item-menu">Menu</div>)
}));

describe("PlaylistCard", () => {
  test("renders playlist name", () => {
    const playlist: PlaylistInfo = {
      id: "playlist-1",
      apiId: "api-1",
      pluginId: "plugin-1",
      name: "Test Playlist",
      images: [{ url: "test-image.jpg" }]
    };
    
    renderWithProviders(<PlaylistCard playlist={playlist} />);
    
    expect(screen.getByText("Test Playlist")).toBeInTheDocument();
  });
  
  test("renders playlist image", () => {
    const playlist: PlaylistInfo = {
      id: "playlist-1",
      apiId: "api-1",
      pluginId: "plugin-1",
      name: "Test Playlist",
      images: [{ url: "test-image.jpg" }]
    };
    
    const { container } = renderWithProviders(<PlaylistCard playlist={playlist} />);
    
    // Find the playlist card image directly in the rendered component
    const playlistCardDiv = container.querySelector('.min-w-64');
    expect(playlistCardDiv).not.toBeNull();
    
    const image = playlistCardDiv?.querySelector('img');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute("src", "test-image.jpg");
  });
  
  test("handles playlist without image", () => {
    const playlist: PlaylistInfo = {
      id: "playlist-1",
      apiId: "api-1",
      pluginId: "plugin-1",
      name: "Test Playlist",
      images: []
    };
    
    const { container } = renderWithProviders(<PlaylistCard playlist={playlist} />);
    
    // Find the playlist card image directly in the rendered component
    const playlistCardDiv = container.querySelector('.min-w-64');
    expect(playlistCardDiv).not.toBeNull();
    
    const image = playlistCardDiv?.querySelector('img');
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
      images: [{ url: "test-image.jpg" }]
    };
    
    const { container } = renderWithProviders(<PlaylistCard playlist={playlist} />);
    
    // Find the menu directly within the playlist card component
    const playlistCardDiv = container.querySelector('.min-w-64');
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
      images: [{ url: "test-image.jpg" }]
    };
    
    // Using container to narrow down search, avoids testing library test isolation issues
    const { container } = renderWithProviders(<PlaylistCard playlist={playlist} />);
    
    // The script tag should be sanitized out
    const playlistCardDiv = container.querySelector('.min-w-64');
    expect(playlistCardDiv).not.toBeNull();
    
    // Look for the sanitized text directly within the component
    const nameElement = playlistCardDiv?.querySelector('h3');
    expect(nameElement?.textContent).toBe("Test Playlist");
    expect(nameElement?.textContent).not.toContain("<script>");
  });
});