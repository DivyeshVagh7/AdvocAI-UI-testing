import React from 'react'
import { describe, test, vi } from "vitest"
import { Button } from '../button';

import { render, screen } from '@testing-library/react';
import "@testing-library/jest-dom";

vi.mock("@radix-ui/react-slot", () => ({
  Slot: ({ children, ...props }) => <div {...props}>{children}</div>,
}));

vi.mock("@/lib/utils", () => ({
  cn: (...args) => args.join(' '),
}));

vi.mock("@/lib/button-variants", () => ({
  buttonVariants: ({ variant, size }) => `variant-${variant} size-${size}`,
}));

describe('Button() Button method', () => {
  // Happy Path Tests
  describe('Happy Paths', () => {
    test('renders a button with default props', () => {
      render(<Button>Click Me</Button>);
      const buttonElement = screen.getByRole('button');
      expect(buttonElement).toBeInTheDocument();
      expect(buttonElement).toHaveTextContent('Click Me');
    });

    test('renders a button with custom className', () => {
      render(<Button className="custom-class">Click Me</Button>);
      const buttonElement = screen.getByRole('button');
      expect(buttonElement).toHaveClass('custom-class');
    });

    test('renders a button with variant and size', () => {
      render(<Button variant="primary" size="large">Click Me</Button>);
      const buttonElement = screen.getByRole('button');
      expect(buttonElement).toHaveClass('variant-primary size-large');
    });

    test('renders a Slot component when asChild is true', () => {
      render(<Button asChild>Click Me</Button>);
      const slotElement = screen.getByText('Click Me');
      expect(slotElement).toBeInTheDocument();
    });
  });

  // Edge Case Tests
  describe('Edge Cases', () => {
    test('renders without children', () => {
      render(<Button />);
      const buttonElement = screen.getByRole('button');
      expect(buttonElement).toBeInTheDocument();
      expect(buttonElement).toBeEmptyDOMElement();
    });

    test('handles undefined variant and size gracefully', () => {
      render(<Button variant={undefined} size={undefined}>Click Me</Button>);
      const buttonElement = screen.getByRole('button');
      expect(buttonElement).toHaveClass('variant-undefined size-undefined');
    });

    test('handles additional props correctly', () => {
      render(<Button data-testid="custom-button">Click Me</Button>);
      const buttonElement = screen.getByTestId('custom-button');
      expect(buttonElement).toBeInTheDocument();
    });
  });
});