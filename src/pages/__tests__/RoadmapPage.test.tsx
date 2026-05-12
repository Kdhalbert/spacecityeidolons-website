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

    const inProgressCount = roadmapStories.filter((s) => s.status === 'in-progress').length;
    const plannedCount = roadmapStories.filter((s) => s.status === 'planned').length;

    if (inProgressCount > 0) {
      expect(
        screen.getByRole('heading', { name: new RegExp(`^In Progress\\(${inProgressCount}\\)$`) }),
      ).toBeInTheDocument();
    } else {
      expect(screen.queryByRole('heading', { name: /^In Progress/ })).toBeNull();
    }

    if (plannedCount > 0) {
      expect(
        screen.getByRole('heading', { name: new RegExp(`^Planned\\(${plannedCount}\\)$`) }),
      ).toBeInTheDocument();
    } else {
      expect(screen.queryByRole('heading', { name: /^Planned/ })).toBeNull();
    }

    expect(screen.queryByRole('heading', { name: /^Completed/ })).toBeNull();
  });

  it('shows correct count for each status', () => {
    renderPage();
    const inProgress = roadmapStories.filter((s) => s.status === 'in-progress').length;
    const planned = roadmapStories.filter((s) => s.status === 'planned').length;

    if (inProgress > 0) {
      expect(
        screen.getByRole('heading', { name: new RegExp(`^In Progress\\(${inProgress}\\)$`) }),
      ).toBeInTheDocument();
    }

    if (planned > 0) {
      expect(
        screen.getByRole('heading', { name: new RegExp(`^Planned\\(${planned}\\)$`) }),
      ).toBeInTheDocument();
    }
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
    const inProgress = roadmapStories.filter((s) => s.status === 'in-progress').length;
    const planned = roadmapStories.filter((s) => s.status === 'planned').length;

    expect(screen.queryByText('Complete')).toBeNull();
    if (inProgress > 0) {
      expect(screen.getAllByText('In Progress', { selector: 'span' })).toHaveLength(inProgress);
    } else {
      expect(screen.queryByText('In Progress', { selector: 'span' })).toBeNull();
    }
    expect(screen.getAllByText('Planned', { selector: 'span' })).toHaveLength(planned);
  });

  it('does not render PR links', () => {
    renderPage();
    expect(screen.queryAllByRole('link', { name: /Pull request #/ })).toHaveLength(0);
  });
});
