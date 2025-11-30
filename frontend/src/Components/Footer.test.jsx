import React from "react"
import { describe, it, expect } from "vitest"
import { render } from "@testing-library/react"
import "@testing-library/jest-dom"
import { MemoryRouter } from "react-router-dom"

// Import Footer from Components folder
import Footer from "./Footer"

describe("Footer Component – FULL COVERAGE", () => {
  it("renders without crashing", () => {
    const { container } = render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>
    )

    expect(container).toBeInTheDocument()
  })

  it("renders an empty fragment (no visible DOM nodes)", () => {
    const { container } = render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>
    )

    // Empty fragment → no visible DOM
    expect(container).toBeEmptyDOMElement()
  })

  it("matches snapshot (empty output)", () => {
    const { container } = render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>
    )

    expect(container).toMatchSnapshot()
  })
})
