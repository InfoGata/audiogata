import React from "react";
import { describe, expect, test, vi } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import PlayButton from "../../components/PlayButton";
import "@testing-library/jest-dom/vitest"; // Import jest-dom matchers

// Mock for react-icons
vi.mock("react-icons/md", () => ({
  // eslint-disable-next-line i18next/no-literal-string
  MdPlayCircle: () => <div data-testid="play-icon">Play Icon</div>
}));

// Mock shadcn Button component
vi.mock("../../components/ui/button", () => ({
  Button: ({ children, onClick, className }: any) => (
    <button onClick={onClick} className={className} data-testid="play-button">
      {children}
    </button>
  )
}));

describe("PlayButton", () => {
  test("renders play button with icon", () => {
    const mockOnClick = vi.fn();
    const { container } = render(<PlayButton onClick={mockOnClick} />);
    
    // Use querySelector to avoid issues with multiple elements
    const button = container.querySelector('[data-testid="play-button"]');
    const icon = container.querySelector('[data-testid="play-icon"]');
    
    expect(button).toBeInTheDocument();
    expect(icon).toBeInTheDocument();
  });
  
  test("calls onClick when clicked", () => {
    const mockOnClick = vi.fn();
    const { container } = render(<PlayButton onClick={mockOnClick} />);
    
    const button = container.querySelector('[data-testid="play-button"]');
    if (button) {
      fireEvent.click(button);
    }
    
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });
  
  test("applies correct styling classes", () => {
    const mockOnClick = vi.fn();
    const { container } = render(<PlayButton onClick={mockOnClick} />);
    
    const button = container.querySelector('[data-testid="play-button"]');
    expect(button).toHaveClass("w-16");
    expect(button).toHaveClass("h-16");
  });
});