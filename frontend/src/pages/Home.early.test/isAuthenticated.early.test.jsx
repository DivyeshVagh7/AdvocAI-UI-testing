import React from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Home from '../Home';

// Import necessary modules and components
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';


// Import necessary modules and components
// Mock the useAuth hook
vi.mock("../../context/AuthContext", () => ({
  useAuth: vi.fn(),
}));

describe('isAuthenticated() isAuthenticated method', () => {
  let mockIsAuthenticated;

  beforeEach(() => {
    // Reset the mock before each test
    mockIsAuthenticated = vi.fn();
    useAuth.mockReturnValue({ isAuthenticated: mockIsAuthenticated });
  });

  describe('Happy paths', () => {
    it('should render Document Generation and Document Analyzer buttons when authenticated', () => {
      // Arrange: Set isAuthenticated to true
      mockIsAuthenticated.mockReturnValue(true);

      // Act: Render the Home component
      const { getByText } = render(
        <MemoryRouter>
          <Home />
        </MemoryRouter>
      );

      // Assert: Check if the authenticated buttons are rendered
      expect(getByText('Document Generation')).toBeInTheDocument();
      expect(getByText('Document Analyzer')).toBeInTheDocument();
    });

    it('should render Sign Up and Sign In buttons when not authenticated', () => {
      // Arrange: Set isAuthenticated to false
      mockIsAuthenticated.mockReturnValue(false);

      // Act: Render the Home component
      const { getByText } = render(
        <MemoryRouter>
          <Home />
        </MemoryRouter>
      );

      // Assert: Check if the unauthenticated buttons are rendered
      expect(getByText('Sign Up')).toBeInTheDocument();
      expect(getByText('Sign In')).toBeInTheDocument();
    });
  });

  describe('Edge cases', () => {
    it('should handle undefined isAuthenticated gracefully', () => {
      // Arrange: Set isAuthenticated to undefined
      mockIsAuthenticated.mockReturnValue(undefined);

      // Act: Render the Home component
      const { getByText } = render(
        <MemoryRouter>
          <Home />
        </MemoryRouter>
      );

      // Assert: Check if the unauthenticated buttons are rendered
      expect(getByText('Sign Up')).toBeInTheDocument();
      expect(getByText('Sign In')).toBeInTheDocument();
    });

    it('should handle null isAuthenticated gracefully', () => {
      // Arrange: Set isAuthenticated to null
      mockIsAuthenticated.mockReturnValue(null);

      // Act: Render the Home component
      const { getByText } = render(
        <MemoryRouter>
          <Home />
        </MemoryRouter>
      );

      // Assert: Check if the unauthenticated buttons are rendered
      expect(getByText('Sign Up')).toBeInTheDocument();
      expect(getByText('Sign In')).toBeInTheDocument();
    });

    it('should handle unexpected values for isAuthenticated gracefully', () => {
      // Arrange: Set isAuthenticated to an unexpected value
      mockIsAuthenticated.mockReturnValue('unexpected');

      // Act: Render the Home component
      const { getByText } = render(
        <MemoryRouter>
          <Home />
        </MemoryRouter>
      );

      // Assert: Check if the unauthenticated buttons are rendered
      expect(getByText('Sign Up')).toBeInTheDocument();
      expect(getByText('Sign In')).toBeInTheDocument();
    });
  });
});