import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminService } from '../services/admin.service';
import { DarkCard, PageHero, PageSection } from '../components/ui';
import { GameRequestStatus, type AdminGamePageRequest } from '../types';

const STATUS_LABELS: Record<GameRequestStatus, string> = {
  [GameRequestStatus.PENDING]: 'Pending',
  [GameRequestStatus.IN_PROGRESS]: 'In Progress',
  [GameRequestStatus.APPROVED]: 'Approved',
  [GameRequestStatus.REJECTED]: 'Rejected',
};

const STATUS_COLORS: Record<GameRequestStatus, string> = {
  [GameRequestStatus.PENDING]: '#eab308',
  [GameRequestStatus.IN_PROGRESS]: '#3b82f6',
  [GameRequestStatus.APPROVED]: '#22c55e',
  [GameRequestStatus.REJECTED]: '#ef4444',
};

const AdminGameRequestsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<GameRequestStatus | ''>('');
  const [noteInputs, setNoteInputs] = useState<Record<string, string>>({});

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin', 'game-requests', { page, search, statusFilter }],
    queryFn: () =>
      adminService.listGameRequests({
        page,
        limit: 20,
        search: search || undefined,
        status: statusFilter || undefined,
      }),
  });

  const reviewMutation = useMutation({
    mutationFn: ({ id, status, adminNote }: {
      id: string;
      status: GameRequestStatus.APPROVED | GameRequestStatus.REJECTED;
      adminNote?: string;
    }) => adminService.reviewGameRequest(id, { status, adminNote }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'game-requests'] }),
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const handleReview = (
    request: AdminGamePageRequest,
    status: GameRequestStatus.APPROVED | GameRequestStatus.REJECTED
  ) => {
    reviewMutation.mutate({
      id: request.id,
      status,
      adminNote: noteInputs[request.id] || undefined,
    });
  };

  const requests = data?.data ?? [];
  const meta = data?.meta;

  return (
    <>
      <PageHero
        title="Game Request Management"
        subtitle="Review, approve, and reject member-submitted game page requests."
      />
      <PageSection>
        <div className="admin-toolbar">
          <Link to="/admin/users" className="btn btn-secondary btn-sm">User Management</Link>
          <Link to="/admin/invites" className="btn btn-secondary btn-sm">Invite Requests</Link>
        </div>

        <DarkCard>
          <div className="admin-filters">
            <form onSubmit={handleSearch} className="admin-search-form">
              <input
                type="search"
                className="input-dark"
                aria-label="Search game requests"
                placeholder="Search by game, reason, or requester..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
              <button type="submit" className="btn btn-primary btn-sm">Search</button>
            </form>

            <select
              id="game-request-status-filter"
              className="input-dark admin-select"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as GameRequestStatus | '');
                setPage(1);
              }}
            >
              <option value="">All Statuses</option>
              {Object.values(GameRequestStatus).map((status) => (
                <option key={status} value={status}>
                  {STATUS_LABELS[status]}
                </option>
              ))}
            </select>
          </div>

          {isLoading && <p className="admin-loading">Loading game page requests…</p>}
          {isError && <p className="admin-error">Failed to load game page requests.</p>}

          {!isLoading && !isError && (
            <>
              {requests.length === 0 && (
                <p className="admin-empty">No game page requests found.</p>
              )}

              {requests.length > 0 && (
                <div className="admin-list">
                  {requests.map((request) => (
                    <div key={request.id} className="admin-card">
                      <div className="admin-card-header">
                        <div>
                          <div className="admin-card-row">
                            <span className="admin-name">{request.gameName}</span>
                            <span
                              className="status-chip"
                              style={{
                                backgroundColor: STATUS_COLORS[request.status] + '22',
                                color: STATUS_COLORS[request.status],
                                borderColor: STATUS_COLORS[request.status] + '44',
                              }}
                            >
                              {STATUS_LABELS[request.status]}
                            </span>
                          </div>
                          <div className="admin-meta">
                            Requested by {request.requester.discordUsername}
                            {request.requester.email ? ` (${request.requester.email})` : ''}
                            {' · '}
                            {new Date(request.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>

                      {request.description && (
                        <p className="admin-message">Description: {request.description}</p>
                      )}

                      <p className="admin-message">Reason: {request.reason}</p>

                      {request.status === GameRequestStatus.PENDING && (
                        <div className="admin-actions">
                          <div className="admin-actions-grow">
                            <input
                              type="text"
                              className="input-dark"
                              placeholder="Optional admin note…"
                              value={noteInputs[request.id] ?? ''}
                              onChange={(e) =>
                                setNoteInputs((prev) => ({ ...prev, [request.id]: e.target.value }))
                              }
                            />
                          </div>
                          <button
                            className="btn btn-success btn-sm"
                            onClick={() => handleReview(request, GameRequestStatus.APPROVED)}
                            disabled={reviewMutation.isPending}
                          >
                            Approve + Create Page
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleReview(request, GameRequestStatus.REJECTED)}
                            disabled={reviewMutation.isPending}
                          >
                            Reject
                          </button>
                        </div>
                      )}

                      {request.adminNote && (
                        <div className="admin-note-line">Admin note: {request.adminNote}</div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {meta && meta.totalPages > 1 && (
                <div className="admin-pagination">
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    Previous
                  </button>
                  <span className="admin-pagination-text">
                    Page {page} of {meta.totalPages}
                  </span>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
                    disabled={page === meta.totalPages}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </DarkCard>
      </PageSection>
    </>
  );
};

export default AdminGameRequestsPage;
