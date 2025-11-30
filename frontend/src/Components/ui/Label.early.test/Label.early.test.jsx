
import * as React from "react";
import { describe, expect, it } from 'vitest';
import { Label } from '../Label';

import '@testing-library/jest-dom';
import { render } from '@testing-library/react';


describe('Label() Label method', () => {
  // Happy Path Tests
  describe('Happy Paths', () => {
    it('should render the Label component with default styles', () => {
      // Test to ensure the Label component renders with default styles
      const { getByText } = render(<Label>Test Label</Label>);
      const labelElement = getByText('Test Label');
      expect(labelElement).toBeInTheDocument();
      expect(labelElement).toHaveClass('text-sm font-medium leading-none');
    });

    it('should apply additional class names passed via className prop', () => {
      // Test to ensure additional class names are applied correctly
      const { getByText } = render(<Label className="extra-class">Test Label</Label>);
      const labelElement = getByText('Test Label');
      expect(labelElement).toHaveClass('extra-class');
    });

    it('should forward refs correctly', () => {
      // Test to ensure refs are forwarded correctly
      const ref = React.createRef();
      render(<Label ref={ref}>Test Label</Label>);
      expect(ref.current).toBeInstanceOf(HTMLElement);
    });
  });

  // Edge Case Tests
  describe('Edge Cases', () => {
    it('should handle peer-disabled class when a peer element is disabled', () => {
      // Test to ensure the peer-disabled class is applied when a peer element is disabled
      const { getByText } = render(
        <div>
          <input type="text" disabled aria-labelledby="label" />
          <Label id="label">Test Label</Label>
        </div>
      );
      const labelElement = getByText('Test Label');
      expect(labelElement).toHaveClass('peer-disabled:cursor-not-allowed peer-disabled:opacity-70');
    });

    it('should render without crashing when no children are provided', () => {
      // Test to ensure the component renders without crashing when no children are provided
      const { container } = render(<Label />);
      expect(container).toBeInTheDocument();
    });

  });
});