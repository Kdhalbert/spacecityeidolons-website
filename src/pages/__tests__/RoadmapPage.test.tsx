import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import RoadmapPage from '../RoadmapPage';
import { roadmapStories } from '../../data/roadmap';

function renderPage() {
  return render(
    <BrowserRouter>
      <RoadmapPage />
    </BrowserRouter>
  );
}

describe('RoadmapPage', () => {
  it('renders page heading', () => {
    renderPage();
    expect(screen.getByText('Roadmap')).toBeInTheDocument();
  });

  it('renders all three status sections', () => {
    renderPage();
    expect(screen.getByRole('heading', { name: /^Completed/ })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /^In Progress/ })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /^Planned/ })).toBeInTheDocument();
  });

  it('shows correct count for each status', () => {
    renderPage();
    const completed = roadmapStories.filter((s) => s.status === 'completed').length;
    const inProgress = roadmapStories.filter((s) => s.status === 'in-progress').length;
    const planned = roadmapStories.filter((s) => s.status === 'planned').length;

    expect(screen.getByText(`(${completed})`)).toBeInTheDocument();
    expect(screen.getByText(`(${inProgress})`)).toBeInTheDocument();
    expect(screen.getByText(`(${planned})`)).toBeInTheDocument();
  });

  it('renders a story title for each entry', () => {
    renderPage();
    for (const story of roadmapStories) {
      expect(screen.getByText(story.title)).toBeInTheDocument();
    }
  });

  it('renders Complete badge on completed stories', () => {
    renderPage();
    const badges = screen.getAllByText('Complete');
    const expected = roadmapStories.filter((s) => s.status === 'completed').length;
    expect(badges).toHaveLength(expected);
  });

  it('renders PR links for completed stories that have a PR', () => {
    renderPage();
    const completedStoriesWithPR = roadmapStories.filter(
      (s) => s.status === 'completed' && s.pr !== undefined,
    );
    const links = screen.getAllByRole('link', { name: /Pull request #/ });

    expect(links).toHaveLength(completedStoriesWithPR.length);

    for (const story of completedStoriesWithPR) {
      expect(screen.getByRole('link', { name: `Pull request #${story.pr}` })).toBeInTheDocument();
    }
  });

  it('does not render PR links inside planned stories', () => {
    renderPage();
    const planned = roadmapStories.filter((s) => s.status === 'planned');
    for (const story of planned) {
      const title = screen.getByText(story.title);
      const card = title.closest('div')?.parentElement;
      expect(card).toBeTruthy();
      expect(within(card as HTMLElement).queryByRole('link', { name: /Pull request #/ })).toBeNull();
    }
  });
});
