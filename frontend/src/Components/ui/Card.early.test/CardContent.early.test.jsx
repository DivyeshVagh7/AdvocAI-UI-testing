import React from 'react'
import { CardContent } from '../Card';

// CardContent.test.jsx
import { render } from '@testing-library/react';
import "@testing-library/jest-dom";

// CardContent.test.jsx
// Mocking the cn utility function
import { vi } from 'vitest'

vi.mock('@/lib/utils', () => ({
  cn: (...args) => args.join(' '),
}))


// Mocking other components
// jest.mock("../Card", () => ({
//   Card: ({ children }) => <div>{children}</div>,
//   CardHeader: ({ children }) => <div>{children}</div>,
//   CardFooter: ({ children }) => <div>{children}</div>,
//   CardTitle: ({ children }) => <h3>{children}</h3>,
//   CardDescription: ({ children }) => <p>{children}</p>,
//   CardContent: ({ children, className, ...props }) => (
//     <div className={`p-6 pt-0 ${className}`} {...props}>
//       {children}
//     </div>
//   ),
// }));

describe('CardContent() CardContent method', () => {
  describe('Happy Paths', () => {
    it('renders CardContent with default styles and children', () => {
      // Test to ensure CardContent renders with default styles and children
      const { getByText } = render(
        <CardContent>
          <span>Test Content</span>
        </CardContent>
      );

      const content = getByText('Test Content');
      expect(content).toBeInTheDocument();
      expect(content.parentElement).toHaveClass('p-6 pt-0');
    });

    it('applies additional className to CardContent', () => {
      // Test to ensure additional className is applied correctly
      const { container } = render(
        <CardContent className="extra-class">
          <span>Test Content</span>
        </CardContent>
      );

      expect(container.firstChild).toHaveClass('p-6 pt-0 extra-class');
    });
  });

  describe('Edge Cases', () => {
    it('renders CardContent without children', () => {
      // Test to ensure CardContent can render without children
      const { container } = render(<CardContent />);

      expect(container.firstChild).toBeInTheDocument();
      expect(container.firstChild).toHaveClass('p-6 pt-0');
    });

    it('handles null className gracefully', () => {
      // Test to ensure null className does not break the component
      const { container } = render(
        <CardContent className={null}>
          <span>Test Content</span>
        </CardContent>
      );

      expect(container.firstChild).toHaveClass('p-6 pt-0');
    });

    it('handles undefined className gracefully', () => {
      // Test to ensure undefined className does not break the component
      const { container } = render(
        <CardContent className={undefined}>
          <span>Test Content</span>
        </CardContent>
      );

      expect(container.firstChild).toHaveClass('p-6 pt-0');
    });
  });
});