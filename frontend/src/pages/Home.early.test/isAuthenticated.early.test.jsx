import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Home from "../Home";

import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

// Mock useAuth
vi.mock("../../context/AuthContext", () => ({
  useAuth: vi.fn(),
}));

describe("isAuthenticated() behaviour", () => {
  let mockIsAuthenticated;

  beforeEach(() => {
    mockIsAuthenticated = vi.fn();
    useAuth.mockReturnValue({ isAuthenticated: mockIsAuthenticated });
  });

  // -----------------------------------------
  // HAPPY PATHS
  // -----------------------------------------
  describe("Happy paths", () => {
    it("shows authenticated buttons", () => {
      mockIsAuthenticated.mockReturnValue(true);

      render(
        <MemoryRouter>
          <Home />
        </MemoryRouter>
      );

      expect(screen.getByText("Document Generation")).toBeInTheDocument();
      expect(screen.getByText("Document Analyzer")).toBeInTheDocument();
    });

    it("shows hero buttons even when NOT authenticated", () => {
      mockIsAuthenticated.mockReturnValue(false);

      render(
        <MemoryRouter>
          <Home />
        </MemoryRouter>
      );

      expect(screen.getByText("Document Generation")).toBeInTheDocument();
      expect(screen.getByText("Document Analyzer")).toBeInTheDocument();
    });
  });

  // -----------------------------------------
  // EDGE CASES
  // -----------------------------------------
  describe("Edge cases", () => {
    it("handles undefined authentication", () => {
      mockIsAuthenticated.mockReturnValue(undefined);

      render(
        <MemoryRouter>
          <Home />
        </MemoryRouter>
      );

      expect(screen.getByText("Document Generation")).toBeInTheDocument();
      expect(screen.getByText("Document Analyzer")).toBeInTheDocument();
    });

    it("handles null authentication", () => {
      mockIsAuthenticated.mockReturnValue(null);

      render(
        <MemoryRouter>
          <Home />
        </MemoryRouter>
      );

      expect(screen.getByText("Document Generation")).toBeInTheDocument();
      expect(screen.getByText("Document Analyzer")).toBeInTheDocument();
    });

    it("handles unexpected values", () => {
      mockIsAuthenticated.mockReturnValue("weird-value");

      render(
        <MemoryRouter>
          <Home />
        </MemoryRouter>
      );

      expect(screen.getByText("Document Generation")).toBeInTheDocument();
      expect(screen.getByText("Document Analyzer")).toBeInTheDocument();
    });
  });
});
