import React from 'react'
import { describe, it, vi } from "vitest"
import { CardHeader } from '../Card';

import { render } from '@testing-library/react';
import "@testing-library/jest-dom";

vi.mock("@/lib/utils", () => ({
  cn: (...args) => args.join(' '),
}));

// Mocking nested components
// jest.mock("../Card", () => ({
//   CardTitle: ({ children, ...props }) => <h3 {...props}>{children}</h3>,
//   CardDescription: ({ children, ...props }) => <p {...props}>{children}</p>,
//   CardContent: ({ children, ...props }) => <div {...props}>{children}</div>,
//   CardFooter: ({ children, ...props }) => <div {...props}>{children}</div>,
// }));

describe('CardHeader() CardHeader method', () => {
  describe('Happy Paths', () => {
    it('renders correctly with default props', () => {
      // Test to ensure the CardHeader renders with default props
      const { container } = render(<CardHeader />);
      expect(container.firstChild).toHaveClass('flex flex-col space-y-1.5 p-6');
    });

    it('applies additional class names', () => {
      // Test to ensure additional class names are applied
      const { container } = render(<CardHeader className="extra-class" />);
      expect(container.firstChild).toHaveClass('extra-class');
    });

    it('renders children components correctly', () => {
      // Test to ensure children components are rendered correctly
      const { getByText } = render(
        <CardHeader>
          <div>Child Component</div>
        </CardHeader>
      );
      expect(getByText('Child Component')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles null className gracefully', () => {
      // Test to ensure null className is handled gracefully
      const { container } = render(<CardHeader className={null} />);
      expect(container.firstChild).toHaveClass('flex flex-col space-y-1.5 p-6');
    });

    it('handles undefined className gracefully', () => {
      // Test to ensure undefined className is handled gracefully
      const { container } = render(<CardHeader className={undefined} />);
      expect(container.firstChild).toHaveClass('flex flex-col space-y-1.5 p-6');
    });

    it('renders without children', () => {
      // Test to ensure the component renders without children
      const { container } = render(<CardHeader />);
      expect(container.firstChild).toBeEmptyDOMElement();
    });
  });
});