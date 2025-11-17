
import * as React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../Card';

// src/Components/ui/Card.test.jsx
import { render } from '@testing-library/react';
import "@testing-library/jest-dom";

// src/Components/ui/Card.test.jsx
// Mocking the nested components
// jest.mock("../Card", () => ({
//   Card: React.forwardRef(({ className, ...props }, ref) => (
//     <div ref={ref} className={className} {...props} />
//   )),
//   CardHeader: React.forwardRef(({ className, ...props }, ref) => (
//     <div ref={ref} className={className} {...props} />
//   )),
//   CardFooter: React.forwardRef(({ className, ...props }, ref) => (
//     <div ref={ref} className={className} {...props} />
//   )),
//   CardTitle: React.forwardRef(({ className, ...props }, ref) => (
//     <h3 ref={ref} className={className} {...props} />
//   )),
//   CardDescription: React.forwardRef(({ className, ...props }, ref) => (
//     <p ref={ref} className={className} {...props} />
//   )),
//   CardContent: React.forwardRef(({ className, ...props }, ref) => (
//     <div ref={ref} className={className} {...props} />
//   )),
// }));

describe('Card() Card method', () => {
  // Happy Path Tests
  describe('Happy Paths', () => {
    it('renders Card with all subcomponents correctly', () => {
      // This test checks if the Card component renders with all its subcomponents
      const { getByText } = render(
        <Card>
          <CardHeader>Header</CardHeader>
          <CardTitle>Title</CardTitle>
          <CardDescription>Description</CardDescription>
          <CardContent>Content</CardContent>
          <CardFooter>Footer</CardFooter>
        </Card>
      );

      expect(getByText('Header')).toBeInTheDocument();
      expect(getByText('Title')).toBeInTheDocument();
      expect(getByText('Description')).toBeInTheDocument();
      expect(getByText('Content')).toBeInTheDocument();
      expect(getByText('Footer')).toBeInTheDocument();
    });

    it('applies custom className to Card component', () => {
      // This test checks if a custom className is applied to the Card component
      const { container } = render(<Card className="custom-class" />);
      expect(container.firstChild).toHaveClass('custom-class');
    });
  });

  // Edge Case Tests
  describe('Edge Cases', () => {
    it('renders Card without any children', () => {
      // This test checks if the Card component renders without any children
      const { container } = render(<Card />);
      expect(container.firstChild).toBeEmptyDOMElement();
    });

    it('handles null className gracefully', () => {
      // This test checks if the Card component handles a null className gracefully
      const { container } = render(<Card className={null} />);
      expect(container.firstChild).not.toHaveClass('null');
    });

    it('renders Card with a ref', () => {
      // This test checks if the Card component can accept and use a ref
      const ref = React.createRef();
      render(<Card ref={ref} />);
      expect(ref.current).not.toBeNull();
    });
  });
});