import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import MatchModal from '../components/MatchModal';
import type { DiscoverUser } from '../types';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('MatchModal Component', () => {
  const mockUser: DiscoverUser = {
    id: 1,
    name: 'Deki Lhamo',
    age: 26,
    gender: 'female',
    dzongkhag: 'Paro',
    bio: 'Teacher who loves reading',
    profile_photos: ['photo.jpg'],
  };

  const mockOnClose = vi.fn();
  const matchId = 123;

  beforeEach(() => {
    mockNavigate.mockClear();
    mockOnClose.mockClear();
  });

  const renderModal = () => {
    return render(
      <BrowserRouter>
        <MatchModal user={mockUser} matchId={matchId} onClose={mockOnClose} />
      </BrowserRouter>
    );
  };

  it('renders match celebration message', () => {
    renderModal();

    expect(screen.getByText(/It's a Match!/i)).toBeInTheDocument();
    expect(screen.getByText(/You and Deki Lhamo liked each other/i)).toBeInTheDocument();
  });

  it('displays matched user information', () => {
    renderModal();

    expect(screen.getByText(/Deki Lhamo, 26/i)).toBeInTheDocument();
    expect(screen.getByText(/Paro/i)).toBeInTheDocument();
  });

  it('navigates to chat when Send Message is clicked', () => {
    renderModal();

    const sendMessageButton = screen.getByText(/Send Message/i);
    fireEvent.click(sendMessageButton);

    expect(mockNavigate).toHaveBeenCalledWith(`/chat/${matchId}`);
  });

  it('calls onClose when Keep Swiping is clicked', () => {
    renderModal();

    const keepSwipingButton = screen.getByText(/Keep Swiping/i);
    fireEvent.click(keepSwipingButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('displays user profile photo', () => {
    renderModal();

    const image = screen.getByAltText(mockUser.name);
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', mockUser.profile_photos[0]);
  });
});
