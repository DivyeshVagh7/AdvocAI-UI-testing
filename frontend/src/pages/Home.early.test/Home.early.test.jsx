import React from 'react'
import { beforeEach, describe, expect, it } from 'vitest';
import Home from '../Home';

import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';


// Mocking the Button component
jest.mock("@/components/ui/Button", () => ({
  Button: ({ children, ...props }) => <button {...props}>{children}</button>,
}));

// Mocking the Navbar component
jest.mock("@/Components/Navbar/Navbar", () => () => <nav>Mocked Navbar</nav>);

// Mocking the Subtle3DBackground component
// jest.mock("../../Components/Subtle3DBackground.jsx", () => () => <div>Mocked Background</div>);

// Mocking the useAuth hook
jest.mock("../../context/AuthContext", () => ({
  useAuth: jest.fn(),
}));

describe('Home() Home method', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Happy Paths', () => {
    it('should render the Home component with authenticated user', () => {
      // Mocking the useAuth hook to return an authenticated user
      useAuth.mockReturnValue({ isAuthenticated: true });

      render(
        <Router>
          <Home />
        </Router>
      );

      // Check if the authenticated user buttons are rendered
      expect(screen.getByText('Document Generation')).toBeInTheDocument();
      expect(screen.getByText('Document Analyzer')).toBeInTheDocument();
    });

    it('should render the Home component with unauthenticated user', () => {
      // Mocking the useAuth hook to return an unauthenticated user
      useAuth.mockReturnValue({ isAuthenticated: false });

      render(
        <Router>
          <Home />
        </Router>
      );

      // Check if the unauthenticated user buttons are rendered
      expect(screen.getByText('Sign Up')).toBeInTheDocument();
      expect(screen.getByText('Sign In')).toBeInTheDocument();
    });

    it('should toggle between Document Analysis and Document Generator', () => {
      // Mocking the useAuth hook to return an authenticated user
      useAuth.mockReturnValue({ isAuthenticated: true });

      render(
        <Router>
          <Home />
        </Router>
      );

      // Initially, Document Analysis should be active
      expect(screen.getByText('Document Analysis')).toBeInTheDocument();

      // Click on Document Generator button
      fireEvent.click(screen.getByText('Document Generator'));

      // Document Generator should now be active
      expect(screen.getByText('Document Generator')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle feature selection and display feature details', () => {
      // Mocking the useAuth hook to return an authenticated user
      useAuth.mockReturnValue({ isAuthenticated: true });

      render(
        <Router>
          <Home />
        </Router>
      );

      // Click on a feature to select it
      fireEvent.click(screen.getByText('AI Document Analyzer'));

      // Check if the feature details modal is displayed
      expect(screen.getByText('AI Document Analyzer')).toBeInTheDocument();
      expect(screen.getByText('Transform complex legal documents into clear, actionable insights with our advanced AI-powered analysis engine.')).toBeInTheDocument();
    });

    it('should close the feature details modal when clicking outside', () => {
      // Mocking the useAuth hook to return an authenticated user
      useAuth.mockReturnValue({ isAuthenticated: true });

      render(
        <Router>
          <Home />
        </Router>
      );

      // Click on a feature to select it
      fireEvent.click(screen.getByText('AI Document Analyzer'));

      // Click outside the modal to close it
      fireEvent.click(screen.getByRole('dialog'));

      // Check if the feature details modal is closed
      expect(screen.queryByText('AI Document Analyzer')).not.toBeInTheDocument();
    });
  });
});