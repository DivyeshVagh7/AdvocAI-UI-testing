import React from 'react'
import { CardFooter } from '../Card'
import { render } from '@testing-library/react'
import "@testing-library/jest-dom"
import { vi } from 'vitest'

// Mocking the cn utility function (Vitest syntax)
vi.mock("@/lib/utils", () => ({
  cn: (...classes) => classes.filter(Boolean).join(' '),
}))

describe('CardFooter() CardFooter method', () => {
  // Happy Path Tests
  describe('Happy Path', () => {
    it('renders correctly with default props', () => {
      const { container } = render(<CardFooter />)
      expect(container.firstChild).toHaveClass('flex items-center p-6 pt-0')
    })

    it('applies additional className from props', () => {
      const { container } = render(<CardFooter className="extra-class" />)
      expect(container.firstChild).toHaveClass(
        'flex items-center p-6 pt-0 extra-class'
      )
    })

    it('renders children correctly', () => {
      const { getByText } = render(
        <CardFooter><span>Child Content</span></CardFooter>
      )
      expect(getByText('Child Content')).toBeInTheDocument()
    })
  })

  // Edge Case Tests
  describe('Edge Cases', () => {
    it('handles empty className gracefully', () => {
      const { container } = render(<CardFooter className="" />)
      expect(container.firstChild).toHaveClass('flex items-center p-6 pt-0')
    })

    it('handles null children gracefully', () => {
      const { container } = render(<CardFooter>{null}</CardFooter>)
      expect(container.firstChild).toBeInTheDocument()
    })

    it('handles undefined props gracefully', () => {
      const { container } = render(<CardFooter className={undefined} />)
      expect(container.firstChild).toHaveClass('flex items-center p-6 pt-0')
    })
  })
})
