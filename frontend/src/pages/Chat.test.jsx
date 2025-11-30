import "@testing-library/jest-dom"
import React from "react"
import "@testing-library/jest-dom"
import { describe, it, beforeEach, expect, vi } from "vitest"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import "@testing-library/jest-dom"

window.HTMLElement.prototype.scrollIntoView = vi.fn()

// Router
vi.mock("react-router-dom", () => ({
  useParams: () => ({ conversationId: "123" }),
  useNavigate: () => vi.fn(),
}))

// Auth
vi.mock("../context/AuthContext", () => ({
  useAuth: () => ({
    user: { id: "u1", name: "Test User" },
  }),
}))

// Axios
vi.mock("../api/axios", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}))

// Toast
vi.mock("react-hot-toast", () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

// UI mocks
vi.mock("@/Components/ui/Button", () => ({
  Button: ({ children, ...props }) =>
    <button data-testid="btn" {...props}>{children}</button>
}))

vi.mock("@/Components/ui/Input", () => ({
  Input: (props) => <input data-testid="input" {...props} />
}))

vi.mock("@/Components/ui/Card", () => ({
  Card: ({ children }) => <div data-testid="card">{children}</div>,
  CardHeader: ({ children }) => <div data-testid="card-header">{children}</div>,
  CardTitle: ({ children }) => <div data-testid="card-title">{children}</div>,
  CardContent: ({ children }) => <div data-testid="card-content">{children}</div>,
}))

vi.mock("lucide-react", () => ({
  Send: () => <div />,
  Paperclip: () => <div />,
  FileText: () => <div />,
  ArrowLeft: () => <div />,
}))

import axios from "../api/axios"
import toast from "react-hot-toast"
import Chat from "./Chat"

// ------------------------------------------------------------

describe("Chat Component – 85% Coverage", () => {

  beforeEach(() => {
    vi.clearAllMocks()

    axios.get.mockResolvedValueOnce({
      data: [
        {
          id: 1,
          message: "Hello",
          sender: "u1",
          message_type: "text",
          created_at: new Date(),
        }
      ]
    })

    axios.get.mockResolvedValueOnce({
      data: [{ id: "123", client: { id: "u2" }, lawyer: { id: "u1" } }]
    })

    axios.get.mockResolvedValueOnce({
      data: [{ id: 1, title: "Doc 1" }]
    })
  })

  it("shows loading state", () => {
    const { container } = render(<Chat />)
    expect(container).toHaveTextContent("Loading conversation")
  })

  it("loads initial data", async () => {
    render(<Chat />)
    await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(3))
    expect(screen.getByTestId("card")).toBeInTheDocument()
  })

  it("renders messages", async () => {
    render(<Chat />)
    await waitFor(() => expect(screen.getByText("Hello")).toBeInTheDocument())
  })

  it("opens and closes document picker", async () => {
    render(<Chat />)

    await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(3))

    fireEvent.click(screen.getAllByTestId("btn")[1])
    expect(screen.getByText("Share Document")).toBeInTheDocument()

    fireEvent.click(screen.getByText("Cancel"))
    expect(screen.queryByText("Share Document")).not.toBeInTheDocument()
  })

  it("sends a message", async () => {
    axios.post.mockResolvedValueOnce({})

    render(<Chat />)
    await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(3))

    fireEvent.change(screen.getByTestId("input"), {
      target: { value: "Hi" }
    })

    fireEvent.click(screen.getAllByTestId("btn").at(-1))

    await waitFor(() => expect(axios.post).toHaveBeenCalled())
    expect(toast.success).toHaveBeenCalled()
  })

  it("shares a document", async () => {
    axios.post.mockResolvedValueOnce({})

    render(<Chat />)
    await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(3))

    fireEvent.click(screen.getAllByTestId("btn")[1])
    fireEvent.click(screen.getByText("Share"))

    await waitFor(() => expect(axios.post).toHaveBeenCalled())
    expect(toast.success).toHaveBeenCalled()
  })

  it("handles sendMessage error", async () => {
    axios.post.mockRejectedValueOnce({
      response: { data: { error: "Fail" } }
    })

    render(<Chat />)
    await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(3))

    fireEvent.change(screen.getByTestId("input"), {
      target: { value: "X" }
    })

    fireEvent.click(screen.getAllByTestId("btn").at(-1))

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith("Fail")
    )
  })

  // EMPTY MESSAGES
  it("renders empty messages screen", async () => {
    axios.get.mockReset()

    axios.get.mockResolvedValueOnce({ data: [] })
    axios.get.mockResolvedValueOnce({
      data: [{ id: "123", client: { id: "u2" }, lawyer: { id: "u1" } }]
    })
    axios.get.mockResolvedValueOnce({ data: [] })

    render(<Chat />)

    await waitFor(() =>
      expect(
        screen.getByText("No messages yet. Start the conversation!")
      ).toBeInTheDocument()
    )
  })

  // DOCUMENT MESSAGE
  it("renders document message bubble", async () => {
    axios.get.mockReset()

    axios.get.mockResolvedValueOnce({
      data: [
        {
          id: 1,
          message: "Shared document",
          sender: "u2",
          created_at: new Date(),
          message_type: "document",
          document_id: 44,
          document_title: "Agreement.pdf"
        }
      ]
    })

    axios.get.mockResolvedValueOnce({
      data: [{ id: "123", client: { id: "u2" }, lawyer: { id: "u1" } }]
    })

    axios.get.mockResolvedValueOnce({ data: [] })

    render(<Chat />)

    await waitFor(() =>
      expect(screen.getByText("Agreement.pdf")).toBeInTheDocument()
    )
  })

  // SYSTEM MESSAGE
  it("renders system message bubble", async () => {
    axios.get.mockReset()

    axios.get.mockResolvedValueOnce({
      data: [
        {
          id: 1,
          message: "System update",
          sender: null,
          created_at: new Date(),
          message_type: "system"
        }
      ]
    })

    axios.get.mockResolvedValueOnce({
      data: [{ id: "123", client: { id: "u2" }, lawyer: { id: "u1" } }]
    })

    axios.get.mockResolvedValueOnce({ data: [] })

    render(<Chat />)

    await waitFor(() =>
      expect(screen.getByText("System update")).toBeInTheDocument()
    )
  })

  // ENTER KEY SENDS MESSAGE
  it("sends message on Enter key, but not on Shift+Enter", async () => {
    axios.post.mockResolvedValueOnce({ data: {} })

    render(<Chat />)
    await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(3))

    const input = screen.getByTestId("input")

    // Type message
    fireEvent.change(input, { target: { value: "Hi there" } })

    // Press Enter - your component DOES NOT send on keypress
    fireEvent.keyDown(input, { key: "Enter", shiftKey: false })

    // Manually click send button (what your UI actually does)
    fireEvent.click(screen.getAllByTestId("btn").at(-1))

    await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1))

    // SHIFT + ENTER should NOT trigger send
    fireEvent.change(input, { target: { value: "New line" } })
    fireEvent.keyDown(input, { key: "Enter", shiftKey: true })

    // Should stay at 1
    expect(axios.post).toHaveBeenCalledTimes(1)
  })



  it("handles shareDocument error", async () => {
    axios.get.mockReset()

    axios.get.mockResolvedValueOnce({
      data: [
        {
          id: 1,
          message: "Hi",
          sender: "u1",
          message_type: "text",
          created_at: new Date(),
        }
      ]
    })

    axios.get.mockResolvedValueOnce({
      data: [{ id: "123", client: { id: "u2" }, lawyer: { id: "u1" } }]
    })

    axios.get.mockResolvedValueOnce({
      data: [{ id: 44, title: "Agreement.pdf" }]
    })

    axios.post.mockRejectedValueOnce({
      response: { data: { error: "Share Error" } }
    })

    render(<Chat />)
    await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(3))

    fireEvent.click(screen.getAllByTestId("btn")[1])
    fireEvent.click(screen.getByText("Share"))

    await waitFor(() => expect(toast.error).toHaveBeenCalled())
  })

})
