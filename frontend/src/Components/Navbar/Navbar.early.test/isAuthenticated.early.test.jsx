import React from "react"
import "@testing-library/jest-dom"
import { describe, it, expect, beforeEach, vi } from "vitest"
import { fireEvent, render, screen, within } from "@testing-library/react"
import { BrowserRouter as Router } from "react-router-dom"
import Navbar from "../Navbar"

vi.mock("@/components/ui/Button", () => ({
  Button: ({ children, ...props }) => (
    <button {...props} data-testid="mock-button">
      {children}
    </button>
  ),
}))

const mockUseAuth = vi.fn()

vi.mock("../../../context/AuthContext", () => ({
  useAuth: () => mockUseAuth(),
}))

const renderNavbar = () =>
  render(
    <Router>
      <Navbar />
    </Router>,
  )

describe("Navbar isAuthenticated behaviour", () => {
  beforeEach(() => {
    mockUseAuth.mockReset()
  })

  describe("Happy Paths", () => {
    it("should render public links when user is not authenticated", () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: false,
        user: null,
        logout: vi.fn(),
      })

      renderNavbar()

      expect(screen.getAllByText("Home").length).toBeGreaterThan(0)
      expect(screen.getAllByText("Document Analyzer").length).toBeGreaterThan(0)
      expect(screen.getAllByText("Document Generator").length).toBeGreaterThan(0)
      expect(screen.getAllByText("Connect").length).toBeGreaterThan(0)
      expect(screen.getAllByText("Login").length).toBeGreaterThan(0)

      expect(screen.queryByText("My Documents")).toBeNull()
      expect(screen.queryByText("Messages")).toBeNull()
      expect(screen.queryByText("Lawyer Dashboard")).toBeNull()
    })

    it("should render authenticated links when user is authenticated", () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        user: { role: "user" },
        logout: vi.fn(),
      })

      renderNavbar()

      expect(screen.getAllByText("My Documents").length).toBeGreaterThan(0)
      expect(screen.getAllByText("Messages").length).toBeGreaterThan(0)
      expect(screen.queryByText("Lawyer Dashboard")).toBeNull()
    })

    it("should render lawyer-specific links when user is a lawyer", () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        user: { role: "lawyer" },
        logout: vi.fn(),
      })

      renderNavbar()

      expect(screen.getAllByText("Lawyer Dashboard").length).toBeGreaterThan(0)
    })

    it("shows profile avatar when profile picture provided", () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        user: { role: "user", profile_picture: "/avatar.png" },
        logout: vi.fn(),
      })

      renderNavbar()

      expect(screen.getByAltText("Profile")).toHaveAttribute("src", "/avatar.png")
    })
  })

  describe("Edge Cases", () => {
    it("should handle logout action correctly", () => {
      const mockLogout = vi.fn()

      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        user: { role: "user" },
        logout: mockLogout,
      })

      renderNavbar()

      fireEvent.click(screen.getAllByText("Logout")[0])
      expect(mockLogout).toHaveBeenCalled()
    })

    it("should close profile menu when clicking outside", () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        user: { role: "user", profile_picture: "profile.jpg" },
        logout: vi.fn(),
      })

      renderNavbar()

      const profileButtons = screen.getAllByTestId("mock-button")
      fireEvent.click(profileButtons[0])

      fireEvent.mouseDown(document.body)
      expect(screen.getAllByText("Logout")[0]).toBeVisible()
    })

    it("shows mobile login button after opening menu when unauthenticated", () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: false,
        user: null,
        logout: vi.fn(),
      })

      renderNavbar()

      fireEvent.click(screen.getByLabelText("Toggle menu"))

      expect(screen.getAllByText("Login").length).toBeGreaterThan(0)
    })

    it("falls back to placeholder avatar when profile picture missing", () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        user: { role: "user", profile_picture: null },
        logout: vi.fn(),
      })

      renderNavbar()

      const profileButtons = screen.getAllByTestId("mock-button")
      const avatarButton = profileButtons[0]

      expect(avatarButton.querySelector("img")).toBeNull()
      expect(avatarButton.querySelector("svg")).not.toBeNull()
    })

    it("toggles the mobile menu open and closed", () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        user: { role: "user" },
        logout: vi.fn(),
      })

      renderNavbar()

      const menu = screen.getByTestId("mobile-menu")
      const toggle = screen.getByLabelText("Toggle menu")

      expect(menu.className).toContain("translate-x-full")
      fireEvent.click(toggle)
      expect(menu.className).toContain("translate-x-0")
      fireEvent.click(screen.getByLabelText("Close menu"))
      expect(menu.className).toContain("translate-x-full")
    })

    it("closes menu when selecting a mobile link", () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        user: { role: "user" },
        logout: vi.fn(),
      })

      renderNavbar()

      const menu = screen.getByTestId("mobile-menu")
      fireEvent.click(screen.getByLabelText("Toggle menu"))

      const docLink = within(menu).getByText("Document Generator")
      fireEvent.click(docLink.closest("a") ?? docLink)

      expect(menu.className).toContain("translate-x-full")
    })

    it("invokes logout from the mobile menu and closes it", () => {
      const mockLogout = vi.fn()
      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        user: { role: "user" },
        logout: mockLogout,
      })

      renderNavbar()

      const menu = screen.getByTestId("mobile-menu")
      fireEvent.click(screen.getByLabelText("Toggle menu"))

      const mobileLogout = within(menu).getByText("Logout")
      fireEvent.click(mobileLogout.closest("a") ?? mobileLogout)

      expect(mockLogout).toHaveBeenCalledTimes(1)
      expect(menu.className).toContain("translate-x-full")
    })

    it("closes the menu when tapping the mobile profile link", () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        user: { role: "user", profile_picture: "profile.jpg" },
        logout: vi.fn(),
      })

      renderNavbar()

      const menu = screen.getByTestId("mobile-menu")
      fireEvent.click(screen.getByLabelText("Toggle menu"))

      const profileLink = within(menu).getByText("Profile")
      fireEvent.click(profileLink.closest("a") ?? profileLink)

      expect(menu.className).toContain("translate-x-full")
    })

    it("closes the menu when tapping the mobile login link while unauthenticated", () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: false,
        user: null,
        logout: vi.fn(),
      })

      renderNavbar()

      const menu = screen.getByTestId("mobile-menu")
      fireEvent.click(screen.getByLabelText("Toggle menu"))

      const loginLink = within(menu).getByText("Login")
      fireEvent.click(loginLink.closest("a") ?? loginLink)

      expect(menu.className).toContain("translate-x-full")
    })
  })
})