import React from "react"
import { describe, expect, test, vi, beforeEach, afterEach } from "vitest"
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

const mockLogout = vi.fn()
const mockAuthState = {
  user: { profile_picture: "profile.jpg", role: "lawyer" },
  isAuthenticated: true,
  logout: mockLogout,
}

vi.mock("../../../context/AuthContext", () => ({
  useAuth: () => mockAuthState,
}))

const renderNavbar = () =>
  render(
    <Router>
      <Navbar />
    </Router>,
  )

describe("Navbar", () => {
  beforeEach(() => {
    mockLogout.mockReset()
  })

  afterEach(() => {
    mockAuthState.user = { profile_picture: "profile.jpg", role: "lawyer" }
    mockAuthState.isAuthenticated = true
  })

  test("renders all navigation links for authenticated user", () => {
    renderNavbar()
    const links = [
      "Home",
      "Document Analyzer",
      "Document Generator",
      "Connect",
      "My Documents",
      "Messages",
      "Lawyer Dashboard",
    ]

    links.forEach((link) =>
      expect(screen.getAllByText(link).length).toBeGreaterThan(0),
    )
  })

  test("shows profile avatar", () => {
    renderNavbar()
    const profileImg = screen.getByAltText("Profile")
    expect(profileImg).toHaveAttribute("src", "profile.jpg")
  })

  test("renders login button when unauthenticated", () => {
    mockAuthState.isAuthenticated = false
    mockAuthState.user = null

    renderNavbar()

    expect(screen.getAllByText(/login/i).length).toBeGreaterThan(0)
  })

  test("hides lawyer dashboard for non-lawyer users", () => {
    mockAuthState.user = { profile_picture: "profile.jpg", role: "client" }

    renderNavbar()

    expect(screen.queryByText("Lawyer Dashboard")).toBeNull()
  })

  test("falls back to placeholder avatar when no profile picture", () => {
    mockAuthState.user = { profile_picture: null, role: "lawyer" }

    renderNavbar()

    const profileButtons = screen.getAllByTestId("mock-button")
    const avatarButton = profileButtons[0]

    expect(avatarButton.querySelector("img")).toBeNull()
    expect(avatarButton.querySelector("svg")).not.toBeNull()
  })

  test("invokes logout when logout button clicked", () => {
    renderNavbar()

    fireEvent.click(screen.getAllByText(/logout/i)[0])
    expect(mockLogout).toHaveBeenCalledTimes(1)
  })

  test("toggles mobile menu open and close", () => {
    renderNavbar()

    const menu = screen.getByTestId("mobile-menu")
    const toggleButton = screen.getByLabelText("Toggle menu")

    expect(menu.className).toContain("translate-x-full")

    fireEvent.click(toggleButton)
    expect(menu.className).toContain("translate-x-0")

    const closeButton = screen.getByLabelText("Close menu")
    fireEvent.click(closeButton)
    expect(menu.className).toContain("translate-x-full")
  })

  test("closes mobile menu after selecting a link", () => {
    renderNavbar()

    const menu = screen.getByTestId("mobile-menu")
    fireEvent.click(screen.getByLabelText("Toggle menu"))

    const mobileLink = within(menu).getByText("Document Generator")
    fireEvent.click(mobileLink.closest("a") ?? mobileLink)

    expect(menu.className).toContain("translate-x-full")
  })

  test("invokes logout from mobile menu", () => {
    renderNavbar()

    const menu = screen.getByTestId("mobile-menu")
    fireEvent.click(screen.getByLabelText("Toggle menu"))

    const mobileLogout = within(menu).getByText("Logout")
    fireEvent.click(mobileLogout)

    expect(mockLogout).toHaveBeenCalledTimes(1)
    expect(menu.className).toContain("translate-x-full")
  })

  test("clicking mobile login closes menu when unauthenticated", () => {
    mockAuthState.isAuthenticated = false
    mockAuthState.user = null

    renderNavbar()

    const menu = screen.getByTestId("mobile-menu")
    fireEvent.click(screen.getByLabelText("Toggle menu"))

    const loginLink = within(menu).getByText("Login")
    fireEvent.click(loginLink.closest("a") ?? loginLink)

    expect(menu.className).toContain("translate-x-full")
  })
})