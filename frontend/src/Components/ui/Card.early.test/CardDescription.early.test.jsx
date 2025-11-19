import React from 'react'
import { CardDescription } from '../Card'
import { render } from '@testing-library/react'
import "@testing-library/jest-dom"
import { vi } from 'vitest'

// Mocking the cn utility function
vi.mock("@/lib/utils", () => ({
  cn: (...classes) => classes.filter(Boolean).join(' '),
}))

// OPTIONAL: If Card exports multiple components, you may mock them too
// vi.mock("../Card", () => ({
//   CardDescription: ({ children, className }) => (
//     <p className={`text-sm text-muted-foreground ${className || ""}`}>
//       {children}
//     </p>
//   ),
// }))

describe('CardDescription() CardDescription method', () => {

  describe('Happy Path', () => {
    test('renders with default class names', () => {
      const { container } = render(<CardDescription>Test Description</CardDescription>)
      expect(container.firstChild).toHaveClass('text-sm text-muted-foreground')
    })

    test('renders with additional class names', () => {
      const { container } = render(
        <CardDescription className="extra-class">Test Description</CardDescription>
      )
      expect(container.firstChild).toHaveClass('text-sm text-muted-foreground extra-class')
    })

    test('renders children correctly', () => {
      const { getByText } = render(<CardDescription>Test Description</CardDescription>)
      expect(getByText('Test Description')).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    test('renders without children', () => {
      const { container } = render(<CardDescription />)
      expect(container.firstChild).toBeEmptyDOMElement()
    })

    test('handles null className gracefully', () => {
      const { container } = render(
        <CardDescription className={null}>Test Description</CardDescription>
      )
      expect(container.firstChild).toHaveClass('text-sm text-muted-foreground')
    })

    test('handles undefined className gracefully', () => {
      const { container } = render(
        <CardDescription className={undefined}>Test Description</CardDescription>
      )
      expect(container.firstChild).toHaveClass('text-sm text-muted-foreground')
    })
  })
})
