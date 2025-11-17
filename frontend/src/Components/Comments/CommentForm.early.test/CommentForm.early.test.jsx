import React from 'react'
import { describe, test, vi, beforeEach } from "vitest"
import axios from '../../../api/axios';
import CommentForm from '../CommentForm';

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import "@testing-library/jest-dom";

vi.mock("../../../api/axios", () => ({
  default: {
    post: vi.fn(),
  },
}));

describe('CommentForm() CommentForm method', () => {
  const mockOnCommentAdded = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Happy Path Tests
  describe('Happy Path', () => {
    test('should render the CommentForm with default placeholder', () => {
      render(<CommentForm documentId="123" onCommentAdded={mockOnCommentAdded} />);
      const textarea = screen.getByPlaceholderText('Add a comment...');
      expect(textarea).toBeInTheDocument();
    });

    test('should allow user to type a comment', () => {
      render(<CommentForm documentId="123" onCommentAdded={mockOnCommentAdded} />);
      const textarea = screen.getByPlaceholderText('Add a comment...');
      fireEvent.change(textarea, { target: { value: 'This is a test comment' } });
      expect(textarea).toHaveValue('This is a test comment');
    });

    test('should submit the comment and clear the textarea', async () => {
      axios.post.mockResolvedValueOnce({});
      render(<CommentForm documentId="123" onCommentAdded={mockOnCommentAdded} />);
      const textarea = screen.getByPlaceholderText('Add a comment...');
      const button = screen.getByRole('button', { name: /post comment/i });

      fireEvent.change(textarea, { target: { value: 'This is a test comment' } });
      fireEvent.click(button);

      await waitFor(() => {
        expect(axios.post).toHaveBeenCalledWith('/api/documents/123/comments/', {
          document_id: '123',
          content: 'This is a test comment',
          parent_comment: null,
        });
        expect(textarea).toHaveValue('');
        expect(mockOnCommentAdded).toHaveBeenCalled();
      });
    });
  });

  // Edge Case Tests
  describe('Edge Cases', () => {
    test('should not submit an empty comment', async () => {
      render(<CommentForm documentId="123" onCommentAdded={mockOnCommentAdded} />);
      const button = screen.getByRole('button', { name: /post comment/i });

      fireEvent.click(button);

      await waitFor(() => {
        expect(axios.post).not.toHaveBeenCalled();
        expect(mockOnCommentAdded).not.toHaveBeenCalled();
      });
    });

    test('should display error message on failed submission', async () => {
      axios.post.mockRejectedValueOnce(new Error('Network Error'));
      render(<CommentForm documentId="123" onCommentAdded={mockOnCommentAdded} />);
      const textarea = screen.getByPlaceholderText('Add a comment...');
      const button = screen.getByRole('button', { name: /post comment/i });

      fireEvent.change(textarea, { target: { value: 'This is a test comment' } });
      fireEvent.click(button);

      await waitFor(() => {
        const errorMessage = screen.getByText('Failed to post comment. Please try again.');
        expect(errorMessage).toBeInTheDocument();
        expect(textarea).toHaveValue('This is a test comment');
      });
    });

    test('should disable inputs while loading', async () => {
      axios.post.mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 1000)));
      render(<CommentForm documentId="123" onCommentAdded={mockOnCommentAdded} />);
      const textarea = screen.getByPlaceholderText('Add a comment...');
      const button = screen.getByRole('button', { name: /post comment/i });

      fireEvent.change(textarea, { target: { value: 'This is a test comment' } });
      fireEvent.click(button);

      expect(textarea).toBeDisabled();
      expect(button).toBeDisabled();
      expect(button).toHaveTextContent('Posting...');
    });

    test('submits successfully even when onCommentAdded is not provided', async () => {
      axios.post.mockResolvedValueOnce({});
      render(<CommentForm documentId="123" />);
      const textarea = screen.getByPlaceholderText('Add a comment...');
      const button = screen.getByRole('button', { name: /post comment/i });

      fireEvent.change(textarea, { target: { value: 'Standalone comment' } });
      fireEvent.click(button);

      await waitFor(() => {
        expect(axios.post).toHaveBeenCalledWith('/api/documents/123/comments/', {
          document_id: '123',
          content: 'Standalone comment',
          parent_comment: null,
        });
      });
    });
  });
});