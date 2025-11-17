import React from 'react'
import { describe, test, vi, beforeEach, afterEach } from "vitest"
import axios from '../../../api/axios';
import CommentList from '../CommentList';
import { render, screen, waitFor, act, cleanup } from '@testing-library/react';
import "@testing-library/jest-dom";

const mockCommentItem = vi.fn(({ comment }) => (
  <div data-testid="comment-item">{comment.text}</div>
));

const mockCommentForm = vi.fn(() => <div data-testid="comment-form">Comment Form</div>);

vi.mock("../CommentItem", () => ({
  default: (props) => mockCommentItem(props),
}));

vi.mock("../CommentForm", () => ({
  default: () => mockCommentForm(),
}));

const mockLocation = { search: '' };

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useLocation: () => mockLocation,
  };
});

vi.mock("../../../api/axios", () => ({
  default: {
    get: vi.fn(),
  },
}));

let webSocketInstances = [];

class MockWebSocket {
  constructor(url) {
    this.url = url;
    this.onopen = null;
    this.onmessage = null;
    this.onclose = null;
    this.onerror = null;
    this.close = vi.fn(() => {
      if (this.onclose) this.onclose();
    });
    webSocketInstances.push(this);
  }
}

const originalLocation = window.location;

const setWindowLocation = (protocol = 'http:') => {
  const newLocation = new URL(`${protocol}//localhost`);
  Object.defineProperty(window, 'location', {
    configurable: true,
    value: newLocation,
  });
};

describe('CommentList() CommentList method', () => {
  beforeEach(() => {
    global.WebSocket = MockWebSocket;
    axios.get.mockResolvedValue({ data: [] });
    mockLocation.search = '';
    localStorage.clear();
    webSocketInstances = [];
    mockCommentItem.mockClear();
    mockCommentForm.mockClear();
    setWindowLocation('http:');
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: originalLocation,
    });
  });

  describe('Happy Paths', () => {
    test('renders loading state initially', async () => {
      render(<CommentList documentId="123" />);
      expect(screen.getByText('Loading comments...')).toBeInTheDocument();
      await waitFor(() => expect(axios.get).toHaveBeenCalled());
    });

    test('renders comments after successful fetch', async () => {
      axios.get.mockResolvedValueOnce({
        data: [{ id: 1, text: 'Test Comment' }],
      });

      render(<CommentList documentId="123" />);

      await waitFor(() => {
        expect(screen.getByTestId('comment-item')).toBeInTheDocument();
        expect(screen.getByText('Test Comment')).toBeInTheDocument();
      });
    });

    test('renders CommentForm component', async () => {
      render(<CommentList documentId="123" />);

      await waitFor(() => {
        expect(screen.getByTestId('comment-form')).toBeInTheDocument();
      });
    });

    test('passes highlight comment id from query parameters', async () => {
      mockLocation.search = '?comment=42';
      axios.get.mockResolvedValueOnce({
        data: [{ id: '42', text: 'Target comment' }],
      });

      render(<CommentList documentId="123" />);

      await waitFor(() => expect(mockCommentItem).toHaveBeenCalled());
      expect(mockCommentItem.mock.calls[0][0].highlightCommentId).toBe('42');
    });

    test('uses secure websocket with token and handles new comment messages', async () => {
      setWindowLocation('https:');
      localStorage.setItem('access_token', 'token123');
      axios.get.mockResolvedValueOnce({ data: [] });

      const { unmount } = render(<CommentList documentId="123" />);

      await waitFor(() => expect(axios.get).toHaveBeenCalled());
      const ws = webSocketInstances[0];
      expect(ws.url).toBe('wss://localhost:8000/ws/document/123/?token=token123');

      await act(async () => {
        ws.onopen?.();
      });

      await act(async () => {
        ws.onmessage?.({
          data: JSON.stringify({
            type: 'new_comment',
            comment: { id: 7, text: 'Socket Comment' },
          }),
        });
      });

      await waitFor(() => expect(screen.getByText('Socket Comment')).toBeInTheDocument());

      await act(async () => {
        ws.onmessage?.({
          data: JSON.stringify({
            type: 'new_comment',
            comment: { id: 7, text: 'Socket Comment' },
          }),
        });
      });

      expect(screen.getAllByText('Socket Comment')).toHaveLength(1);

      await act(async () => {
        ws.onmessage?.({
          data: JSON.stringify({
            type: 'other_event',
          }),
        });
      });

      await act(async () => {
        ws.onerror?.(new Event('error'));
      });

      unmount();
      expect(ws.close).toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    test('renders error message on fetch failure', async () => {
      axios.get.mockRejectedValueOnce(new Error('Network Error'));

      render(<CommentList documentId="123" />);

      await waitFor(() => {
        expect(screen.getByText('Failed to load comments.')).toBeInTheDocument();
      });
    });

    test('renders no comments message when there are no comments', async () => {
      axios.get.mockResolvedValueOnce({
        data: [],
      });

      render(<CommentList documentId="123" />);

      await waitFor(() => {
        expect(screen.getByText('No comments.')).toBeInTheDocument();
      });
    });

    test('renders message to save document when documentId is not provided', () => {
      axios.get.mockResolvedValueOnce({ data: [] });
      render(<CommentList documentId={null} />);
      expect(screen.getByText('Save the document to enable comments.')).toBeInTheDocument();
    });
  });
});