import React from "react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import "@testing-library/jest-dom"

import MenuBar from "./Menubar"

function mockRun(fn = () => true) {
  return { run: fn }
}

// Full mock editor generator
function createMockEditor() {
  const mockRun = vi.fn(() => true)

  const focusActions = {
    toggleBold: vi.fn(() => ({ run: mockRun })),
    toggleItalic: vi.fn(() => ({ run: mockRun })),
    toggleUnderline: vi.fn(() => ({ run: mockRun })),
    toggleStrike: vi.fn(() => ({ run: mockRun })),
    toggleHeading: vi.fn(() => ({ run: mockRun })),
    setParagraph: vi.fn(() => ({ run: mockRun })),
    setHorizontalRule: vi.fn(() => ({ run: mockRun })),
    setTextAlign: vi.fn(() => ({ run: mockRun }))
  }

  return {
    // ----- MAIN chain() -----
    chain: vi.fn(() => ({
      focus: vi.fn(() => focusActions)
    })),

    // ----- can() chain for disabled checks -----
    can: vi.fn(() => ({
      chain: () => ({
        focus: () => ({
          toggleBold: () => ({ run: () => true }),
          toggleItalic: () => ({ run: () => true }),
          toggleUnderline: () => ({ run: () => true }),
          toggleStrike: () => ({ run: () => true }),
        })
      })
    })),

    // ----- active flags -----
    isActive: vi.fn(() => false),

    // ----- commands -----
    commands: {
      indent: vi.fn(),
      outdent: vi.fn()
    }
  }
}


describe("MenuBar – Extended Coverage", () => {
  let editor

  beforeEach(() => {
    editor = createMockEditor()
  })

  it("renders null without editor", () => {
    const { container } = render(<MenuBar editor={null} />)
    expect(container).toBeEmptyDOMElement()
  })

  it("renders all buttons", () => {
    render(<MenuBar editor={editor} />)
    const titles = [
      "Bold (Ctrl+B)",
      "Italic (Ctrl+I)",
      "Underline (Ctrl+U)",
      "Strikethrough",
      "Paragraph",
      "Heading 1",
      "Heading 2",
      "Heading 3",
      "Horizontal Rule",
      "Indent",
      "Outdent",
      "Align Left",
      "Align Center",
      "Align Right",
      "Align Justify"
    ]
    titles.forEach((t) => expect(screen.getByTitle(t)).toBeInTheDocument())
  })

  // ---------- NEW TESTS TO BOOST COVERAGE ---------- //

  it("executes formatting actions: bold, italic, underline, strike", () => {
    render(<MenuBar editor={editor} />)

    fireEvent.click(screen.getByTitle("Bold (Ctrl+B)"))
    fireEvent.click(screen.getByTitle("Italic (Ctrl+I)"))
    fireEvent.click(screen.getByTitle("Underline (Ctrl+U)"))
    fireEvent.click(screen.getByTitle("Strikethrough"))

    const focus = editor.chain().focus()

    expect(focus.toggleBold).toHaveBeenCalled()
    expect(focus.toggleItalic).toHaveBeenCalled()
    expect(focus.toggleUnderline).toHaveBeenCalled()
    expect(focus.toggleStrike).toHaveBeenCalled()
  })

  it("executes paragraph & heading actions", () => {
    render(<MenuBar editor={editor} />)

    fireEvent.click(screen.getByTitle("Paragraph"))
    fireEvent.click(screen.getByTitle("Heading 1"))
    fireEvent.click(screen.getByTitle("Heading 2"))
    fireEvent.click(screen.getByTitle("Heading 3"))

    const focus = editor.chain().focus()

    expect(focus.setParagraph).toHaveBeenCalled()
    expect(focus.toggleHeading).toHaveBeenCalledWith({ level: 1 })
    expect(focus.toggleHeading).toHaveBeenCalledWith({ level: 2 })
    expect(focus.toggleHeading).toHaveBeenCalledWith({ level: 3 })
  })

  it("executes horizontal rule", () => {
    render(<MenuBar editor={editor} />)

    fireEvent.click(screen.getByTitle("Horizontal Rule"))

    const focus = editor.chain().focus()
    expect(focus.setHorizontalRule).toHaveBeenCalled()
  })

  it("executes align-left / center / right / justify", () => {
    render(<MenuBar editor={editor} />)

    fireEvent.click(screen.getByTitle("Align Left"))
    fireEvent.click(screen.getByTitle("Align Center"))
    fireEvent.click(screen.getByTitle("Align Right"))
    fireEvent.click(screen.getByTitle("Align Justify"))

    const focus = editor.chain().focus()

    expect(focus.setTextAlign).toHaveBeenCalledWith("left")
    expect(focus.setTextAlign).toHaveBeenCalledWith("center")
    expect(focus.setTextAlign).toHaveBeenCalledWith("right")
    expect(focus.setTextAlign).toHaveBeenCalledWith("justify")
  })

  it("executes indent & outdent", () => {
    render(<MenuBar editor={editor} />)

    fireEvent.click(screen.getByTitle("Indent"))
    fireEvent.click(screen.getByTitle("Outdent"))

    expect(editor.commands.indent).toHaveBeenCalled()
    expect(editor.commands.outdent).toHaveBeenCalled()
  })

  it("displays active state", () => {
    editor.isActive = vi.fn((arg) => arg === "bold")

    const { container } = render(<MenuBar editor={editor} />)

    const boldBtn = screen.getByTitle("Bold (Ctrl+B)")
    expect(boldBtn.className).toMatch(/scale-105/) // active styling
    expect(container).toMatchSnapshot()
  })
})
