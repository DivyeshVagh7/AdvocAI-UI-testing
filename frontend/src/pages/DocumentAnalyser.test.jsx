// frontend/src/pages/DocumentAnalyzer.test.jsx
import React from "react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import DocumentAnalyzer from "../pages/DocumentAnalyzer";

// Mock lucide-react icons
vi.mock("lucide-react", () => ({
  Upload: () => <div data-testid="icon-upload" />,
  Bot: () => <div data-testid="icon-bot" />,
  MessageCircle: () => <div data-testid="icon-msg" />,
  Send: () => <div data-testid="icon-send" />,
  FileText: () => <div data-testid="icon-file" />,
  Loader2: () => <div data-testid="icon-loader" />,
  History: () => <div data-testid="icon-history" />,
  X: () => <div data-testid="icon-x" />,
  Sparkles: () => <div data-testid="icon-sparkles" />,
  User: () => <div data-testid="icon-user" />,
  Copy: () => <div data-testid="icon-copy" />,
  Check: () => <div data-testid="icon-check" />,
}));

// Mock Clipboard
Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn(),
  },
});

// Mock APIs
vi.mock("../utils/api", () => ({
  uploadDocument: vi.fn(),
  getUserSessions: vi.fn(),
  getChatHistory: vi.fn(),
  sendChatMessage: vi.fn(),
}));

import {
  uploadDocument,
  getUserSessions,
  getChatHistory,
  sendChatMessage,
} from "../utils/api";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("DocumentAnalyzer Component – Medium Coverage", () => {
  it("renders upload section initially", () => {
    getUserSessions.mockResolvedValue([]);
    render(<DocumentAnalyzer />);
    expect(screen.getByText("Drop your document here")).toBeInTheDocument();
  });

  it("uploads a file successfully and shows summary", async () => {
    uploadDocument.mockResolvedValueOnce({
      summary: "This is a test summary",
      session_id: "session123",
    });
    getUserSessions.mockResolvedValue([]);

    render(<DocumentAnalyzer />);

    const fileInput = screen.getByTestId("file-input");
    const file = new File(["test"], "test.pdf", { type: "application/pdf" });

    fireEvent.change(fileInput, { target: { files: [file] } });

    expect(uploadDocument).toHaveBeenCalledTimes(1);

    await waitFor(() =>
      expect(screen.getByText("This is a test summary")).toBeInTheDocument()
    );
  });

  it("shows upload error", async () => {
    uploadDocument.mockRejectedValueOnce({
      response: { data: { error: "Upload failed" } },
    });
    getUserSessions.mockResolvedValue([]);

    render(<DocumentAnalyzer />);

    const fileInput = screen.getByTestId("file-input");
    const file = new File(["abc"], "bad.pdf", { type: "application/pdf" });

    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => expect(screen.getByText("Upload failed")).toBeInTheDocument());
  });

  it("copies summary to clipboard", async () => {
    uploadDocument.mockResolvedValueOnce({
      summary: "Copy this",
      session_id: "s1",
    });
    getUserSessions.mockResolvedValue([]);

    render(<DocumentAnalyzer />);

    const fileInput = screen.getByTestId("file-input");
    const file = new File(["test"], "ok.pdf", { type: "application/pdf" });

    fireEvent.change(fileInput, { target: { files: [file] } });

    // Wait for summary UI to appear
    await waitFor(() => expect(screen.getByText("Copy this")).toBeInTheDocument());

    // Copy button should appear in Analysis panel (summary open)
    await waitFor(() => expect(screen.getByText("Copy Analysis")).toBeInTheDocument());

    fireEvent.click(screen.getByText("Copy Analysis"));

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith("Copy this");
  });

  it("fetches sessions on mount and shows them", async () => {
    getUserSessions.mockResolvedValue([
      {
        id: "s1",
        summary_preview: "Doc Summary",
        created_at: new Date().toISOString(),
        message_count: 3,
      },
    ]);

    render(<DocumentAnalyzer />);

    await waitFor(() => expect(screen.getByText("Doc Summary")).toBeInTheDocument());
  });

  it("shows 'No previous sessions' when sessions are empty", async () => {
    getUserSessions.mockResolvedValue([]);

    render(<DocumentAnalyzer />);

    await waitFor(() =>
      expect(screen.getByText("No previous sessions")).toBeInTheDocument()
    );
  });

  it("opens session and loads chat messages", async () => {
    getUserSessions.mockResolvedValue([{ id: "s1", summary_preview: "Old Summary" }]);

    getChatHistory.mockResolvedValue({
      messages: [
        {
          id: 1,
          sender: "user",
          message: "Hello AI",
          timestamp: new Date().toISOString(),
        },
      ],
      session: { summary: "Old Summary" },
    });

    render(<DocumentAnalyzer />);

    await waitFor(() => expect(screen.getByText("Old Summary")).toBeInTheDocument());

    fireEvent.click(screen.getByText("Old Summary"));

    await waitFor(() => expect(screen.getByText("Hello AI")).toBeInTheDocument());
  });

  it("sends chat message successfully", async () => {
    uploadDocument.mockResolvedValueOnce({
      summary: "Ready",
      session_id: "s1",
    });

    sendChatMessage.mockResolvedValueOnce({
      response: "AI reply text",
    });

    getUserSessions.mockResolvedValue([]);

    render(<DocumentAnalyzer />);

    // upload file to unlock chat
    const fileInput = screen.getByTestId("file-input");
    const file = new File(["x"], "a.pdf", { type: "application/pdf" });
    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => expect(screen.getByText("Ready")).toBeInTheDocument());

    const input = screen.getByPlaceholderText("Ask anything about your document...");
    fireEvent.change(input, { target: { value: "Hello AI" } });

    fireEvent.click(screen.getByText("Send"));

    expect(sendChatMessage).toHaveBeenCalledTimes(1);

    await waitFor(() => expect(screen.getByText("AI reply text")).toBeInTheDocument());
  });

  it("triggers message send on Enter key", async () => {
    uploadDocument.mockResolvedValueOnce({
      summary: "Doc",
      session_id: "s1",
    });
    getUserSessions.mockResolvedValue([]);
    sendChatMessage.mockResolvedValueOnce({ response: "Reply" });

    render(<DocumentAnalyzer />);

    const fileInput = screen.getByTestId("file-input");

    fireEvent.change(fileInput, {
      target: { files: [new File(["1"], "x.pdf")] },
    });

    await waitFor(() => screen.getByText("Doc"));

    const input = screen.getByPlaceholderText("Ask anything about your document...");
    fireEvent.change(input, { target: { value: "Hello!" } });

    fireEvent.keyDown(input, { key: "Enter", shiftKey: false });

    await waitFor(() => expect(sendChatMessage).toHaveBeenCalled());
  });

  it("handles chat API error", async () => {
    uploadDocument.mockResolvedValueOnce({
      summary: "Hi",
      session_id: "s1",
    });
    getUserSessions.mockResolvedValue([]);

    sendChatMessage.mockRejectedValueOnce({
      response: { data: { error: "Chat error" } },
    });

    render(<DocumentAnalyzer />);

    const fileInput = screen.getByTestId("file-input");
    fireEvent.change(fileInput, { target: { files: [new File(["a"], "err.pdf")] } });

    await waitFor(() => expect(screen.getByText("Hi")).toBeInTheDocument());

    const input = screen.getByPlaceholderText("Ask anything about your document...");
    fireEvent.change(input, { target: { value: "Hey" } });

    fireEvent.click(screen.getByText("Send"));

    await waitFor(() => expect(screen.getByText("Chat error")).toBeInTheDocument());
  });

  it("toggles sidebar open/close", async () => {
    getUserSessions.mockResolvedValue([]);

    render(<DocumentAnalyzer />);

    // close sidebar
    fireEvent.click(screen.getByTestId("icon-x"));

    // open toggle button appears (history icon on edge)
    await waitFor(() => expect(screen.getByTestId("icon-history")).toBeInTheDocument());
  });

  it("resets document analysis", async () => {
    uploadDocument.mockResolvedValueOnce({
      summary: "Test summary",
      session_id: "s1",
    });
    getUserSessions.mockResolvedValue([]);

    render(<DocumentAnalyzer />);

    // upload file
    const fileInput = screen.getByTestId("file-input");
    fireEvent.change(fileInput, { target: { files: [new File(["x"], "test.pdf")] } });

    await waitFor(() => expect(screen.getByText("Test summary")).toBeInTheDocument());

    fireEvent.click(screen.getByText("Summarize New Document"));

    expect(screen.getByText("Drop your document here")).toBeInTheDocument();
  });
});
