import React from 'react'
import { describe, test, vi, beforeAll } from "vitest"
import CommentItem from '../CommentItem';
import { fireEvent, render, screen } from '@testing-library/react';
import "@testing-library/jest-dom";

// Mock the CommentForm component
vi.mock("../CommentForm", () => ({
  default: function MockCommentForm({ onCommentAdded }) {
    return (
      <div>
        <button onClick={onCommentAdded}>Mock Submit</button>
      </div>
    );
  },
}));

beforeAll(() => {
  window.HTMLElement.prototype.scrollIntoView = vi.fn();
});

describe('CommentItem() CommentItem method', () => {
  const mockComment = {
    id: '1',
    user: 'Test User',
    created_at: new Date().toISOString(),
    content: 'This is a test comment',
    replies: [],
  };

  const mockDocumentId = 'doc-1';
  const mockOnCommentAdded = vi.fn();

  describe('Happy Paths', () => {
    test('renders comment content correctly', () => {
      render(
        <CommentItem
          comment={mockComment}
          documentId={mockDocumentId}
          onCommentAdded={mockOnCommentAdded}
          highlightCommentId={null}
        />
      );

      expect(screen.getByText('Test User')).toBeInTheDocument();
      expect(screen.getByText('This is a test comment')).toBeInTheDocument();
    });

    test('toggles reply form visibility', () => {
      render(
        <CommentItem
          comment={mockComment}
          documentId={mockDocumentId}
          onCommentAdded={mockOnCommentAdded}
          highlightCommentId={null}
        />
      );

      const replyButton = screen.getByText('Reply');
      fireEvent.click(replyButton);
      expect(screen.getByText('Mock Submit')).toBeInTheDocument();

      fireEvent.click(replyButton);
      expect(screen.queryByText('Mock Submit')).not.toBeInTheDocument();
    });

    test('calls onCommentAdded when a reply is added', () => {
      render(
        <CommentItem
          comment={mockComment}
          documentId={mockDocumentId}
          onCommentAdded={mockOnCommentAdded}
          highlightCommentId={null}
        />
      );

      fireEvent.click(screen.getByText('Reply'));
      fireEvent.click(screen.getByText('Mock Submit'));

      expect(mockOnCommentAdded).toHaveBeenCalled();
    });

    test('highlights comment when highlightCommentId matches', () => {
      render(
        <CommentItem
          comment={mockComment}
          documentId={mockDocumentId}
          onCommentAdded={mockOnCommentAdded}
          highlightCommentId="1"
        />
      );

      const commentElement = screen.getByText('This is a test comment').closest('div');
      expect(commentElement).toHaveClass('ring-2 ring-primary ring-offset-2');
    });

    test('removes highlight class after timeout', () => {
      vi.useFakeTimers();
      render(
        <CommentItem
          comment={mockComment}
          documentId={mockDocumentId}
          onCommentAdded={mockOnCommentAdded}
          highlightCommentId="1"
        />
      );

      const commentElement = screen.getByText('This is a test comment').closest('div');
      expect(commentElement.classList.contains('highlight-comment')).toBe(true);

      vi.runAllTimers();
      expect(commentElement.classList.contains('highlight-comment')).toBe(false);
      vi.useRealTimers();
    });
  });

  describe('Edge Cases', () => {
    test('renders without crashing when replies are present', () => {
      const commentWithReplies = {
        ...mockComment,
        replies: [
          {
            id: '2',
            user: 'Reply User',
            created_at: new Date().toISOString(),
            content: 'This is a reply',
            replies: [],
          },
        ],
      };

      render(
        <CommentItem
          comment={commentWithReplies}
          documentId={mockDocumentId}
          onCommentAdded={mockOnCommentAdded}
          highlightCommentId={null}
        />
      );

      expect(screen.getByText('Reply User')).toBeInTheDocument();
      expect(screen.getByText('This is a reply')).toBeInTheDocument();
    });

    test('handles missing comment content gracefully', () => {
      const commentWithoutContent = {
        ...mockComment,
        content: '',
      };

      render(
        <CommentItem
          comment={commentWithoutContent}
          documentId={mockDocumentId}
          onCommentAdded={mockOnCommentAdded}
          highlightCommentId={null}
        />
      );

      expect(screen.getByText('Test User')).toBeInTheDocument();
      expect(screen.queryByText('This is a test comment')).not.toBeInTheDocument();
    });
  });
});