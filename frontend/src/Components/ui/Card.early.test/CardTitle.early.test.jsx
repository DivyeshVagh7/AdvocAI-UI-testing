import React from 'react'
import { describe, it, vi } from "vitest"
import { CardTitle } from '../Card';

import { render } from '@testing-library/react';
import "@testing-library/jest-dom";

vi.mock("@/lib/utils", () => ({
  cn: (...args) => args.join(' '),
}));

// Mocking other components
// vi.mock("../Card", () => ({
//   Card: ({ children }) => <div>{children}</div>,
//   CardHeader: ({ children }) => <div>{children}</div>,
//   CardFooter: ({ children }) => <div>{children}</div>,
//   CardDescription: ({ children }) => <div>{children}</div>,
//   CardContent: ({ children }) => <div>{children}</div>,
// }));

describe('CardTitle() CardTitle method', () => {
  // Happy Path Tests
  describe('Happy Paths', () => {
    it('renders with default class names', () => {
      // Test to ensure the CardTitle renders with default class names
      const { getByText } = render(<CardTitle>Title</CardTitle>);
      const titleElement = getByText('Title');
      expect(titleElement).toHaveClass('text-2xl font-semibold leading-none tracking-tight');
    });

    it('applies additional class names from props', () => {
      // Test to ensure additional class names are applied correctly
      const { getByText } = render(<CardTitle className="extra-class">Title</CardTitle>);
      const titleElement = getByText('Title');
      expect(titleElement).toHaveClass('extra-class');
    });

    it('renders with children content', () => {
      // Test to ensure the CardTitle renders with children content
      const { getByText } = render(<CardTitle>Title Content</CardTitle>);
      expect(getByText('Title Content')).toBeInTheDocument();
    });
  });

  // Edge Case Tests
  describe('Edge Cases', () => {
    it('renders without crashing when no children are provided', () => {
      // Test to ensure the CardTitle does not crash when no children are provided
      const { container } = render(<CardTitle />);
      expect(container.firstChild).toBeInTheDocument();
    });

    it('handles null className gracefully', () => {
      // Test to ensure the CardTitle handles null className gracefully
      const { getByText } = render(<CardTitle className={null}>Title</CardTitle>);
      const titleElement = getByText('Title');
      expect(titleElement).toHaveClass('text-2xl font-semibold leading-none tracking-tight');
    });

    it('handles undefined className gracefully', () => {
      // Test to ensure the CardTitle handles undefined className gracefully
      const { getByText } = render(<CardTitle className={undefined}>Title</CardTitle>);
      const titleElement = getByText('Title');
      expect(titleElement).toHaveClass('text-2xl font-semibold leading-none tracking-tight');
    });
  });
});