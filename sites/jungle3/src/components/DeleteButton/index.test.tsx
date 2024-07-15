import React from 'react'; // needed for tests to run
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from '@testing-library/react';
import '@testing-library/jest-dom';
import { DeleteButton } from './index';
import { deleteData } from '../../services/backendCommon';

jest.mock('../../services/backendCommon', () => ({
  deleteData: jest.fn(),
}));

jest.mock('../../stores/statusStore', () => ({
  useStatusStore: jest.fn(() => ({
    addError: jest.fn(),
    addWarning: jest.fn(),
    setSuccess: jest.fn(),
  })),
}));

const mockDeleteData = deleteData as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
  mockDeleteData.mockReset();
});

describe('DeleteButton', () => {
  it('should open and close modal', async () => {
    render(<DeleteButton url="/delete/1" name="Test Item" />);

    const deleteButton = screen.getByRole('button', { name: /delete/i });
    fireEvent.click(deleteButton);

    // Open Modal
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);

    // Close Modal
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('should call deleteData', async () => {
    mockDeleteData.mockResolvedValueOnce(undefined); // Mock successful deletion

    render(<DeleteButton url="/delete/1" name="Test Item" />);

    const deleteButton = screen.getByRole('button', { name: /delete/i });

    await act(async () => {
      fireEvent.click(deleteButton);
    });

    const confirmButton = screen.getByRole('button', { name: /confirm/i });

    await act(async () => {
      fireEvent.click(confirmButton);
    });

    await waitFor(() => {
      expect(mockDeleteData).toHaveBeenCalledWith('/delete/1');
    });
  });
});
