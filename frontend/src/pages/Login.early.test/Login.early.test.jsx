import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import "@testing-library/jest-dom";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router-dom";

import Login from "../Login";
import axios from "../../api/axios";
import { useAuth } from "../../context/AuthContext";

/* -------------------------
   Mocks
------------------------- */

vi.mock("@react-oauth/google", () => ({
  GoogleLogin: ({ onSuccess, onError }) => (
    <button
      onClick={() => {
        onSuccess?.({ credential: "test-credential" });
        onError?.();
      }}
    >
      Login with Google
    </button>
  ),
}));

vi.mock("@/Components/ui/Button", () => ({
  Button: ({ children, ...props }) => <button {...props}>{children}</button>,
}));

vi.mock("@/Components/ui/Label", () => ({
  Label: ({ children, ...props }) => <label {...props}>{children}</label>,
}));

vi.mock("@/Components/ui/Input", () => ({
  Input: (props) => <input {...props} />,
}));

vi.mock("../../context/AuthContext", () => ({
  useAuth: vi.fn(),
}));

vi.mock("../../api/axios", () => ({
  default: {
    post: vi.fn(),
  },
}));

vi.mock("react-hot-toast", () => ({
  default: {
    error: vi.fn(),
  },
}));

const toast = (await import("react-hot-toast")).default;

/* -------------------------
   react-router-dom partial mock
------------------------- */

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: vi.fn(() => vi.fn()),
  };
});

/* -------------------------
   Tests
------------------------- */

describe("Login() behaviour", () => {
  const mockLogin = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    useAuth.mockReturnValue({
      login: mockLogin,
    });
  });

  it("renders login form", () => {
    render(
      <Router>
        <Login />
      </Router>
    );

    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
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

  it("calls login(email, password) on submit", async () => {
    mockLogin.mockResolvedValueOnce();

    render(
      <Router>
        <Login />
      </Router>
    );

    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/Password/i), {
      target: { value: "password123" },
    });

    const loginBtn = screen.getAllByRole("button", { name: /Login/i })[1];
    fireEvent.click(loginBtn);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith("test@example.com", "password123");
    });
  });

  it("handles Google login success", async () => {
    axios.post.mockResolvedValueOnce({
      data: { user: "testUser", tokens: "testTokens" },
    });

    render(
      <Router>
        <Login />
      </Router>
    );

    fireEvent.click(screen.getByRole("button", { name: /Login with Google/i }));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalled();
      expect(mockLogin).toHaveBeenCalled();
    });
  });

  it("go back button calls navigate(-1)", async () => {
    const mockNavigate = vi.fn();

    const { useNavigate } = await import("react-router-dom");
    useNavigate.mockImplementation(() => mockNavigate);

    render(
      <Router>
        <Login />
      </Router>
    );

    fireEvent.click(screen.getByRole("button", { name: /go back/i }));

    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });

  it("shows toast when Google login fails BEFORE request", async () => {
    render(
      <Router>
        <Login />
      </Router>
    );

    const googleBtn = screen.getByRole("button", { name: /Login with Google/i });
    googleBtn.onError?.();
    fireEvent.click(googleBtn);

    expect(toast.error).toHaveBeenCalled();
  });

  it("disables form while loading", async () => {
    mockLogin.mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 150))
    );

    render(
      <Router>
        <Login />
      </Router>
    );

    const loginBtn = screen.getAllByRole("button", { name: /Login/i })[1];

    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { value: "user@mail.com" },
    });
    fireEvent.change(screen.getByLabelText(/Password/i), {
      target: { value: "123456" },
    });

    fireEvent.click(loginBtn);

    expect(loginBtn).toBeDisabled();
    expect(loginBtn.textContent).toBe("Logging in...");
  });

  it("handles login() rejection gracefully", async () => {
    mockLogin.mockRejectedValueOnce(new Error("Login failed"));

    render(
      <Router>
        <Login />
      </Router>
    );

    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { value: "err@mail.com" },
    });
    fireEvent.change(screen.getByLabelText(/Password/i), {
      target: { value: "wrong" },
    });

    const loginBtn = screen.getAllByRole("button", { name: /Login/i })[1];
    fireEvent.click(loginBtn);

    await waitFor(() => {
      expect(loginBtn).not.toBeDisabled();
    });
  });

  it("handles Google login backend failure", async () => {
    axios.post.mockRejectedValueOnce({
      response: { data: { error: "Google login failed." } },
    });

    render(
      <Router>
        <Login />
      </Router>
    );

    fireEvent.click(screen.getByRole("button", { name: /Login with Google/i }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Google login failed.");
    });
  });
});
