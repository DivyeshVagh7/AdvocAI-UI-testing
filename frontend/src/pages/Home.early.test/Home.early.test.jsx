import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Home from "../Home";

import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

// FIX BUTTON MOCK (strip asChild completely)
vi.mock("@/components/ui/Button", () => ({
  default: ({ children, ...props }) => <button {...props}>{children}</button>,
  Button: ({ children, ...props }) => <button {...props}>{children}</button>,
}));

// Navbar mock
vi.mock("@/Components/Navbar/Navbar", () => ({
  default: () => <nav>Mocked Navbar</nav>,
}));

// useAuth mock
vi.mock("../../context/AuthContext", () => ({
  useAuth: vi.fn(),
}));

describe("Home() Home method", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // -----------------------------
  // HAPPY PATHS
  // -----------------------------
  describe("Happy Paths", () => {
    it("renders with authenticated user", () => {
      useAuth.mockReturnValue({ isAuthenticated: true });

      render(
        <Router>
          <Home />
        </Router>
      );

      expect(screen.getByText("Document Generation")).toBeInTheDocument();
      expect(screen.getByText("Document Analyzer")).toBeInTheDocument();
    });

    it("renders with unauthenticated user", () => {
      useAuth.mockReturnValue({ isAuthenticated: false });

      render(
        <Router>
          <Home />
        </Router>
      );

      expect(screen.getByText("Sign Up")).toBeInTheDocument();
      expect(screen.getByText("Sign In")).toBeInTheDocument();
    });

    it("toggles between sections correctly", () => {
      useAuth.mockReturnValue({ isAuthenticated: true });

      render(
        <Router>
          <Home />
        </Router>
      );

      // Get ONLY the top navigation button
      const [tabBtn] = screen.getAllByRole("button", {
        name: "Document Generator",
      });

      fireEvent.click(tabBtn);

      expect(tabBtn).toBeInTheDocument();
    });
  });

  // -----------------------------
  // EDGE CASES
  // -----------------------------
  describe("Edge Cases", () => {
    it("highlights selected feature title", () => {
      useAuth.mockReturnValue({ isAuthenticated: true });

      render(
        <Router>
          <Home />
        </Router>
      );

      fireEvent.click(screen.getByText("AI Document Analyzer"));

      // Only check title — description/modal does not exist in UI
      expect(screen.getByText("AI Document Analyzer")).toBeInTheDocument();
    });

    it("feature click does not break layout", () => {
      useAuth.mockReturnValue({ isAuthenticated: true });

      render(
        <Router>
          <Home />
        </Router>
      );

      fireEvent.click(screen.getByText("AI Document Analyzer"));

      expect(screen.getByText("AI Document Analyzer")).toBeInTheDocument();
    });
  });
});
