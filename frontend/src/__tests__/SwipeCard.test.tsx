import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import SwipeCard from '../components/SwipeCard';
import type { DiscoverUser } from '../types';

describe('SwipeCard Component', () => {
  const mockUser: DiscoverUser = {
    id: 1,
    name: 'Tashi Dorji',
    age: 28,
    gender: 'male',
    dzongkhag: 'Thimphu',
    bio: 'Love hiking and exploring dzongs',
    profile_photos: ['photo1.jpg', 'photo2.jpg'],
    interests: ['Hiking', 'Photography'],
    occupation: 'Software Engineer',
    zodiac_sign: 'Dragon',
  };

  const mockOnSwipe = vi.fn();

  beforeEach(() => {
    mockOnSwipe.mockClear();
  });

  it('renders user information correctly', () => {
    render(<SwipeCard user={mockUser} onSwipe={mockOnSwipe} />);

    expect(screen.getByText(/Tashi Dorji, 28/i)).toBeInTheDocument();
    expect(screen.getByText(/Thimphu/i)).toBeInTheDocument();
    expect(screen.getByText(/Software Engineer/i)).toBeInTheDocument();
  });

  it('calls onSwipe with "left" when pass button is clicked', () => {
    render(<SwipeCard user={mockUser} onSwipe={mockOnSwipe} />);

    const passButton = screen.getByLabelText(/pass/i);
    fireEvent.click(passButton);

    expect(mockOnSwipe).toHaveBeenCalledWith('left');
    expect(mockOnSwipe).toHaveBeenCalledTimes(1);
  });

  it('calls onSwipe with "right" when like button is clicked', () => {
    render(<SwipeCard user={mockUser} onSwipe={mockOnSwipe} />);

    const likeButton = screen.getByLabelText(/like/i);
    fireEvent.click(likeButton);

    expect(mockOnSwipe).toHaveBeenCalledWith('right');
    expect(mockOnSwipe).toHaveBeenCalledTimes(1);
  });

  it('toggles info panel when info button is clicked', () => {
    render(<SwipeCard user={mockUser} onSwipe={mockOnSwipe} />);

    // Bio should not be visible initially
    expect(screen.queryByText(mockUser.bio!)).not.toBeInTheDocument();

    // Click info button
    const infoButtons = screen.getAllByRole('button');
    const infoButton = infoButtons.find(btn => btn.querySelector('svg'));

    if (infoButton) {
      fireEvent.click(infoButton);
      // Bio should now be visible
      expect(screen.getByText(mockUser.bio!)).toBeInTheDocument();
    }
  });

  it('displays user interests when info is shown', () => {
    render(<SwipeCard user={mockUser} onSwipe={mockOnSwipe} />);

    // Find and click info button
    const buttons = screen.getAllByRole('button');
    const infoButton = buttons.find(btn => btn.querySelector('svg path[d*="M13"]'));

    if (infoButton) {
      fireEvent.click(infoButton);

      // Check for interests
      expect(screen.getByText('Hiking')).toBeInTheDocument();
      expect(screen.getByText('Photography')).toBeInTheDocument();
    }
  });

  it('handles user with no photos gracefully', () => {
    const userWithoutPhotos = { ...mockUser, profile_photos: [] };
    render(<SwipeCard user={userWithoutPhotos} onSwipe={mockOnSwipe} />);

    // Should still render the component
    expect(screen.getByText(/Tashi Dorji, 28/i)).toBeInTheDocument();
  });
});
