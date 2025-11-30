import React from 'react'
import toast from 'react-hot-toast';
import { beforeEach, describe, expect, it } from 'vitest';
import axios from '../../api/axios';
import Login from '../Login';

import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';


// Mocking necessary components and hooks
jest.mock("@react-oauth/google", () => ({
  GoogleLogin: ({ onSuccess, render }) => (
    <button onClick={() => onSuccess({ credential: 'test-credential' })}>
      {render({ onClick: () => {} })}
    </button>
  ),
}));

jest.mock("@/Components/ui/Button", () => ({
  Button: ({ children, ...props }) => <button {...props}>{children}</button>,
}));

jest.mock("@/Components/ui/Label", () => ({
  Label: ({ children, ...props }) => <label {...props}>{children}</label>,
}));

jest.mock("../../context/AuthContext", () => ({
  useAuth: jest.fn(),
}));

jest.mock("../../api/axios", () => ({
  post: jest.fn(),
}));

jest.mock("react-hot-toast", () => ({
  error: jest.fn(),
}));

describe('Login() Login method', () => {
  const mockLogin = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    useAuth.mockReturnValue({ login: mockLogin });
  });

  describe('Happy Paths', () => {
    it('should render the login form correctly', () => {
      render(
        <Router>
          <Login />
        </Router>
      );

      expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Login/i })).toBeInTheDocument();
    });

    it('should handle email and password input changes', () => {
      render(
        <Router>
          <Login />
        </Router>
      );

      const emailInput = screen.getByLabelText(/Email/i);
      const passwordInput = screen.getByLabelText(/Password/i);

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });

      expect(emailInput.value).toBe('test@example.com');
      expect(passwordInput.value).toBe('password123');
    });

    it('should call login function on form submit', async () => {
      mockLogin.mockResolvedValueOnce();

      render(
        <Router>
          <Login />
        </Router>
      );

      const emailInput = screen.getByLabelText(/Email/i);
      const passwordInput = screen.getByLabelText(/Password/i);
      const loginButton = screen.getByRole('button', { name: /Login/i });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(loginButton);

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
      });
    });

    it('should handle Google login success', async () => {
      axios.post.mockResolvedValueOnce({
        data: { user: 'testUser', tokens: 'testTokens' },
      });

      render(
        <Router>
          <Login />
        </Router>
      );

      const googleLoginButton = screen.getByRole('button', { name: /Login with Google/i });
      fireEvent.click(googleLoginButton);

      await waitFor(() => {
        expect(axios.post).toHaveBeenCalledWith('api/auth/google/', { token: 'test-credential' });
        expect(mockLogin).toHaveBeenCalledWith(null, null, 'testUser', 'testTokens');
      });
    });
  });

  describe('Edge Cases', () => {
    it('should display error toast on Google login failure', async () => {
      axios.post.mockRejectedValueOnce({ response: { data: { error: 'Google login failed.' } } });

      render(
        <Router>
          <Login />
        </Router>
      );

      const googleLoginButton = screen.getByRole('button', { name: /Login with Google/i });
      fireEvent.click(googleLoginButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Google login failed.');
      });
    });

    it('should display error toast on form submit failure', async () => {
      mockLogin.mockRejectedValueOnce(new Error('Login failed'));

      render(
        <Router>
          <Login />
        </Router>
      );

      const emailInput = screen.getByLabelText(/Email/i);
      const passwordInput = screen.getByLabelText(/Password/i);
      const loginButton = screen.getByRole('button', { name: /Login/i });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(loginButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Login failed');
      });
    });
  });
});