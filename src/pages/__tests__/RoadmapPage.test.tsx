import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
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

  it('renders only in-progress and planned sections', () => {
    renderPage();
    expect(screen.getByRole('heading', { name: /^In Progress/ })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /^Planned/ })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: /^Completed/ })).toBeNull();
  });

  it('shows correct count for each status', () => {
    renderPage();
    const inProgress = roadmapStories.filter((s) => s.status === 'in-progress').length;
    const planned = roadmapStories.filter((s) => s.status === 'planned').length;

    expect(screen.getByText(`(${inProgress})`)).toBeInTheDocument();
    expect(screen.getByText(`(${planned})`)).toBeInTheDocument();
  });

  it('renders only in-progress and planned story titles', () => {
    renderPage();
    const visibleStories = roadmapStories.filter(
      (story) => story.status === 'in-progress' || story.status === 'planned',
    );

    for (const story of visibleStories) {
      expect(screen.getByText(story.title)).toBeInTheDocument();
    }

    for (const story of roadmapStories.filter((story) => story.status === 'completed')) {
      expect(screen.queryByText(story.title)).toBeNull();
    }
  });

  it('renders status badges for visible stories only', () => {
    renderPage();
    expect(screen.queryByText('Complete')).toBeNull();
    expect(screen.getAllByText('In Progress').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Planned').length).toBeGreaterThan(0);
  });

  it('does not render PR links', () => {
    renderPage();
    expect(screen.queryAllByRole('link', { name: /Pull request #/ })).toHaveLength(0);
  });
});
