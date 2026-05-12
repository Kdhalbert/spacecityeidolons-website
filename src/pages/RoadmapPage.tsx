import React from 'react';
import { PageHero, PageSection, DarkCard } from '../components/ui';
import { ROADMAP_REPO_URL, roadmapStories, type RoadmapStatus } from '../data/roadmap';

const STATUS_LABEL: Record<RoadmapStatus, string> = {
  completed: 'Complete',
  'in-progress': 'In Progress',
  planned: 'Planned',
};

const STATUS_COLOR: Record<RoadmapStatus, string> = {
  completed: 'var(--gold)',
  'in-progress': '#7ec8e3',
  planned: 'var(--text-muted)',
};

const SECTION_ORDER: RoadmapStatus[] = ['completed', 'in-progress', 'planned'];

const SECTION_TITLE: Record<RoadmapStatus, string> = {
  completed: 'Completed',
  'in-progress': 'In Progress',
  planned: 'Planned',
};

const Badge: React.FC<{ status: RoadmapStatus }> = ({ status }) => (
  <span
    style={{
      display: 'inline-block',
      padding: '2px 10px',
      borderRadius: '12px',
      fontSize: '0.75rem',
      fontFamily: 'sans-serif',
      fontWeight: 600,
      border: `1px solid ${STATUS_COLOR[status]}`,
      color: STATUS_COLOR[status],
      marginLeft: '10px',
      verticalAlign: 'middle',
    }}
  >
    {STATUS_LABEL[status]}
  </span>
);

const RoadmapPage: React.FC = () => {
  const byStatus = (status: RoadmapStatus) =>
    roadmapStories.filter((s) => s.status === status);

  return (
    <>
      <PageHero
        title="Roadmap"
        subtitle="Development Progress"
        description="Track what we've built, what we're building, and what's coming next."
      />
      <PageSection>
        {SECTION_ORDER.map((status) => {
          const stories = byStatus(status);
          if (stories.length === 0) return null;
          return (
            <div key={status} style={{ marginBottom: '40px' }}>
              <h2
                style={{
                  fontFamily: "'Cinzel', serif",
                  color: STATUS_COLOR[status],
                  fontSize: '1.25rem',
                  marginBottom: '16px',
                  letterSpacing: '1px',
                }}
              >
                {SECTION_TITLE[status]}
                <span
                  style={{
                    fontFamily: 'sans-serif',
                    fontSize: '0.85rem',
                    color: 'var(--text-muted)',
                    fontWeight: 400,
                    marginLeft: '8px',
                  }}
                >
                  ({stories.length})
                </span>
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {stories.map((story) => (
                  <DarkCard key={story.id}>
                    <div style={{ padding: '20px 24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', marginBottom: '8px' }}>
                        <span
                          style={{
                            fontFamily: "'Cinzel', serif",
                            fontSize: '0.8rem',
                            color: 'var(--text-muted)',
                            marginRight: '8px',
                          }}
                        >
                          {story.id}
                        </span>
                        <h3
                          style={{
                            fontFamily: "'Cinzel', serif",
                            fontSize: '1rem',
                            margin: 0,
                            color: 'var(--gold)',
                          }}
                        >
                          {story.title}
                        </h3>
                        <Badge status={story.status} />
                        {story.pr && (
                          <a
                            href={`${ROADMAP_REPO_URL}/pull/${story.pr}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              marginLeft: '10px',
                              fontFamily: 'sans-serif',
                              fontSize: '0.75rem',
                              color: 'var(--text-muted)',
                              textDecoration: 'none',
                              border: '1px solid var(--purple-lighter)',
                              borderRadius: '4px',
                              padding: '1px 6px',
                            }}
                            aria-label={`Pull request #${story.pr}`}
                          >
                            PR #{story.pr}
                          </a>
                        )}
                      </div>
                      <p
                        style={{
                          fontFamily: 'sans-serif',
                          fontSize: '0.9rem',
                          color: 'var(--text-light)',
                          margin: 0,
                          lineHeight: '1.6',
                        }}
                      >
                        {story.description}
                      </p>
                    </div>
                  </DarkCard>
                ))}
              </div>
            </div>
          );
        })}
      </PageSection>
    </>
  );
};

export default RoadmapPage;
