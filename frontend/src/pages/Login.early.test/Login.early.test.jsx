import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import "@testing-library/jest-dom";

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router-dom";

import Login from "../Login";
import axios from "../../api/axios";
import { useAuth } from "../../context/AuthContext";

/* -------------------------------------------------------
   🔥  FIXED MOCKS
-------------------------------------------------------- */

// Google Login mock
vi.mock("@react-oauth/google", () => ({
  GoogleLogin: ({ onSuccess }) => (
    <button onClick={() => onSuccess({ credential: "test-credential" })}>
      Login with Google
    </button>
  ),
}));

// UI mocks
vi.mock("@/Components/ui/Button", () => ({
  Button: ({ children, ...props }) => <button {...props}>{children}</button>,
}));

vi.mock("@/Components/ui/Label", () => ({
  Label: ({ children, ...props }) => <label {...props}>{children}</label>,
}));

// Auth mock
vi.mock("../../context/AuthContext", () => ({
  useAuth: vi.fn(),
}));

// Axios mock
vi.mock("../../api/axios", () => ({
  default: {
    post: vi.fn(),
  },
}));

// Toast mock (🔥 FIXED: must return "default")
vi.mock("react-hot-toast", () => ({
  default: {
    error: vi.fn(),
  },
}));

const toast = (await import("react-hot-toast")).default;

/* -------------------------------------------------------
   TESTS
-------------------------------------------------------- */

describe("Login() behaviour", () => {
  const mockLogin = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    useAuth.mockReturnValue({
      login: mockLogin,
    });
  });

  /* ---------------------------
     HAPPY PATHS
  ---------------------------- */

  it("renders login form", () => {
    render(
      <Router>
        <Login />
      </Router>
    );

    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();

    // Use getAllByRole to avoid matching Google Login
    const loginButtons = screen.getAllByRole("button", { name: /Login/i });
    expect(loginButtons.length).toBeGreaterThan(0);
  });

  it("updates email + password fields", () => {
    render(
      <Router>
        <Login />
      </Router>
    );

    const email = screen.getByLabelText(/Email/i);
    const password = screen.getByLabelText(/Password/i);

    fireEvent.change(email, { target: { value: "test@example.com" } });
    fireEvent.change(password, { target: { value: "password123" } });

    expect(email.value).toBe("test@example.com");
    expect(password.value).toBe("password123");
  });

  it("calls login(email, password) on form submit", async () => {
    mockLogin.mockResolvedValueOnce();

    render(
      <Router>
        <Login />
      </Router>
    );

    const email = screen.getByLabelText(/Email/i);
    const password = screen.getByLabelText(/Password/i);

    fireEvent.change(email, { target: { value: "test@example.com" } });
    fireEvent.change(password, { target: { value: "password123" } });

    const loginBtn = screen.getAllByRole("button", { name: /Login/i })[1];
    fireEvent.click(loginBtn);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith(
        "test@example.com",
        "password123"
      );
    });
  });

  it("handles Google login success", async () => {
    axios.post.mockResolvedValueOnce({
      data: {
        user: "testUser",
        tokens: "testTokens",
      },
    });

    render(
      <Router>
        <Login />
      </Router>
    );

    const googleBtn = screen.getByRole("button", {
      name: /Login with Google/i,
    });

    fireEvent.click(googleBtn);

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith("api/auth/google/", {
        token: "test-credential",
      });

      expect(mockLogin).toHaveBeenCalledWith(
        null,
        null,
        "testUser",
        "testTokens"
      );
    });
  });

  /* ---------------------------
     EDGE CASES
  ---------------------------- */

  it("handles Google login failure", async () => {
    axios.post.mockRejectedValueOnce({
      response: {
        data: { error: "Google login failed." },
      },
    });

    render(
      <Router>
        <Login />
      </Router>
    );

    const googleBtn = screen.getByRole("button", {
      name: /Login with Google/i,
    });

    fireEvent.click(googleBtn);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Google login failed.");
    });
  });
});
