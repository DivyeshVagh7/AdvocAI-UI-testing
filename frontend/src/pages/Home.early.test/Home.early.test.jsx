import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import Home from "../Home.jsx";
import { useAuth } from "../../context/AuthContext";

vi.mock("@/components/ui/Button", () => ({
  Button: ({ children, ...props }) => {
    const { asChild, ...clean } = props;
    return <button {...clean}>{children}</button>;
  },
  default: ({ children, ...props }) => {
    const { asChild, ...clean } = props;
    return <button {...clean}>{children}</button>;
  },
}));

vi.mock("@/Components/Navbar/Navbar", () => ({
  default: () => <div>Mock Navbar</div>,
}));

vi.mock("../Components/Subtle3DBackground.jsx", () => ({
  default: () => <div>Mock Background</div>,
}));

vi.mock("../../context/AuthContext", () => ({
  useAuth: vi.fn(),
}));

const setup = () =>
  render(
    <MemoryRouter>
      <Home />
    </MemoryRouter>
  );

function clickFeatureCard(sectionIndex, childIndex) {
  const grids = document.querySelectorAll("#features-detailed .grid");
  const section = grids[sectionIndex];
  const card = section?.children[childIndex];

  if (!section) throw new Error("Feature section missing: " + sectionIndex);
  if (!card) throw new Error("Card missing in section " + sectionIndex);

  fireEvent.click(card);
}

describe("Home Component – FINAL FIXED SUITE", () => {
  beforeEach(() => vi.clearAllMocks());

  describe("Authentication", () => {
    it("authenticated", () => {
      useAuth.mockReturnValue({ isAuthenticated: true });
      setup();
      expect(screen.getAllByText("Document Analyzer")[0]).toBeInTheDocument();
    });

    it("unauthenticated", () => {
      useAuth.mockReturnValue({ isAuthenticated: false });
      setup();
      expect(screen.getByText("Sign Up")).toBeInTheDocument();
    });

    it("null auth -> unauth", () => {
      useAuth.mockReturnValue({ isAuthenticated: null });
      setup();
      expect(screen.getByText("Sign Up")).toBeInTheDocument();
    });

    it("weird auth → logged in", () => {
      useAuth.mockReturnValue({ isAuthenticated: "weird" });
      setup();
      expect(screen.getAllByText("Document Analyzer")[0]).toBeInTheDocument();
    });
  });

  describe("Tabs", () => {
    it("switches generator tab", () => {
      useAuth.mockReturnValue({ isAuthenticated: true });
      setup();
      fireEvent.click(
        screen.getAllByRole("button", { name: "Document Generator" })[0]
      );
      expect(screen.getAllByText("Document Generator")[0]).toBeInTheDocument();
    });

    it("defaults to analysis", () => {
      useAuth.mockReturnValue({ isAuthenticated: true });
      setup();
      expect(
        screen.getAllByText("Document Analysis").length
      ).toBeGreaterThan(0);
    });
  });

  describe("Feature Modals", () => {
    beforeEach(() => useAuth.mockReturnValue({ isAuthenticated: true }));

    it("opens analyzer modal", () => {
      setup();
      clickFeatureCard(0, 0);
      expect(screen.getByText("Key Benefits:")).toBeInTheDocument();
    });

    it("opens creator modal", () => {
      setup();
      clickFeatureCard(1, 1);
      expect(screen.getByText("Key Benefits:")).toBeInTheDocument();
    });

    it("opens timeline modal", () => {
      setup();
      clickFeatureCard(2, 0);
      expect(screen.getByText("Key Benefits:")).toBeInTheDocument();
    });

    it("opens signature modal", () => {
      setup();
      clickFeatureCard(3, 1);
      expect(screen.getByText("Key Benefits:")).toBeInTheDocument();
    });

    it("opens gen-track-sign modal", () => {
      setup();
      clickFeatureCard(4, 0);
      expect(screen.getByText("Key Benefits:")).toBeInTheDocument();
    });
  });

  describe("Modal closing", () => {
    beforeEach(() => useAuth.mockReturnValue({ isAuthenticated: true }));

    it("closes when overlay clicked", () => {
      setup();
      clickFeatureCard(0, 0);
      const overlay = document.querySelector(".fixed.inset-0.bg-black\\/60");
      fireEvent.click(overlay);
      expect(screen.queryByText("Key Benefits:")).not.toBeInTheDocument();
    });

    it("closes via X", () => {
      setup();
      clickFeatureCard(0, 0);
      const modal = document.querySelector(".bg-card");
      const closeBtn = document.querySelector('button[aria-label="close-modal"]');
      fireEvent.click(closeBtn);
      expect(screen.queryByText("Key Benefits:")).not.toBeInTheDocument();
    });


    it("inner click does NOT close", () => {
      setup();
      clickFeatureCard(0, 0);
      fireEvent.click(screen.getByText("Key Benefits:"));
      expect(screen.getByText("Key Benefits:")).toBeInTheDocument();
    });
  });

  it("renders benefits list", () => {
    useAuth.mockReturnValue({ isAuthenticated: true });
    setup();
    clickFeatureCard(0, 0);
    expect(screen.getAllByRole("listitem").length).toBeGreaterThan(2);
  });
});
