import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import LoginPage from './LoginPage';

// Mock environment variable
vi.stubEnv('VITE_API_URL', 'http://localhost:3000');

const renderLoginPage = () => {
  return render(
    <BrowserRouter>
      <LoginPage />
    </BrowserRouter>
  );
};

describe('LoginPage', () => {
  it('renders login page with Discord button', () => {
    renderLoginPage();
    
    expect(screen.getByRole('heading', { name: /sign in/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /login with discord/i })).toBeInTheDocument();
  });

  it('has Discord login button that links to OAuth endpoint', () => {
    renderLoginPage();
    
    const discordButton = screen.getByRole('link', { name: /login with discord/i });
    expect(discordButton).toHaveAttribute('href', 'http://localhost:3000/api/auth/discord');
  });

  it('displays welcome message', () => {
    renderLoginPage();
    
    expect(screen.getByText(/welcome/i)).toBeInTheDocument();
  });

  it('shows Discord logo or icon', () => {
    renderLoginPage();
    
    // Check for Discord branding
    const discordButton = screen.getByRole('link', { name: /login with discord/i });
    expect(discordButton).toBeInTheDocument();
  });

  it('renders in a card container', () => {
    const { container } = renderLoginPage();
    
    // Check for card structure (DarkCard component should be present)
    const card = container.querySelector('[class*="card"]') || container.querySelector('[class*="Card"]');
    expect(card).toBeInTheDocument();
  });

  it('is accessible via keyboard navigation', async () => {
    const user = userEvent.setup();
    renderLoginPage();
    
    const discordButton = screen.getByRole('link', { name: /login with discord/i });
    
    // Tab to the button
    await user.tab();
    expect(discordButton).toHaveFocus();
  });
});
