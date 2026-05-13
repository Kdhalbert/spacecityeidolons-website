import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '../services/admin.service';
import { PageHero, PageSection, DarkCard } from '../components/ui';
import { InviteStatus, Platform, type InviteRequest } from '../types';

const STATUS_LABELS: Record<InviteStatus, string> = {
  [InviteStatus.PENDING]: 'Pending',
  [InviteStatus.APPROVED]: 'Approved',
  [InviteStatus.REJECTED]: 'Rejected',
};

const STATUS_COLORS: Record<InviteStatus, string> = {
  [InviteStatus.PENDING]: 'var(--warning, #eab308)',
  [InviteStatus.APPROVED]: 'var(--success, #22c55e)',
  [InviteStatus.REJECTED]: 'var(--error, #ef4444)',
};

const AdminInvitesPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<InviteStatus | ''>('');
  const [noteInputs, setNoteInputs] = useState<Record<string, string>>({});

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin', 'invites', { page, statusFilter }],
    queryFn: () =>
      adminService.listInvites({
        page,
        limit: 20,
        status: statusFilter || undefined,
      }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, status, adminNote }: { id: string; status?: InviteStatus; adminNote?: string }) =>
      adminService.updateInvite(id, { status, adminNote }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'invites'] }),
  });

  const handleDecision = (invite: InviteRequest, status: InviteStatus) => {
    updateMutation.mutate({
      id: invite.id,
      status,
      adminNote: noteInputs[invite.id] || undefined,
    });
  };

  const invites = data?.data ?? [];
  const meta = data?.meta ?? undefined;

  return (
    <>
      <PageHero
        title="Invite Requests"
        subtitle="Review and process community invite requests."
      />
      <PageSection>
        <div className="admin-toolbar">
          <Link to="/admin/users" className="btn btn-secondary btn-sm admin-toolbar-right">
            User Management
          </Link>
        </div>

        <DarkCard>
          {/* Filter */}
          <div className="admin-filters">
            <label className="input-dark-label">
              Status:
            </label>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value as InviteStatus | ''); setPage(1); }}
              className="input-dark admin-select"
            >
              <option value="">All</option>
              {Object.values(InviteStatus).map((s) => (
                <option key={s} value={s}>{STATUS_LABELS[s]}</option>
              ))}
            </select>
          </div>

          {isLoading && <p className="admin-loading">Loading invite requests…</p>}
          {isError && <p className="admin-error">Failed to load invite requests.</p>}

          {!isLoading && !isError && (
            <>
              {invites.length === 0 && (
                <p className="admin-empty">
                  No invite requests found.
                </p>
              )}

              {invites.length > 0 && (
                <div className="admin-list">
                  {invites.map((invite) => (
                  <div key={invite.id} className="admin-card">
                    <div className="admin-card-header">
                      <div>
                        <div className="admin-card-row">
                          <span className="admin-name">
                            {invite.name}
                          </span>
                          <span
                            className="status-chip"
                            style={{
                              backgroundColor: STATUS_COLORS[invite.status] + '22',
                              color: STATUS_COLORS[invite.status],
                              borderColor: STATUS_COLORS[invite.status] + '44',
                            }}
                          >
                            {STATUS_LABELS[invite.status]}
                          </span>
                          <span className="platform-chip">
                            {invite.platform === Platform.DISCORD ? 'Discord' : 'Matrix'}
                          </span>
                        </div>
                        <div className="admin-meta">
                          {invite.email}
                          {' · '}
                          {new Date(invite.createdAt).toLocaleDateString()}
                        </div>
                        {invite.message && (
                          <p className="admin-message">
                            "{invite.message}"
                          </p>
                        )}
                      </div>
                    </div>

                    {invite.status === InviteStatus.PENDING && (
                      <div className="admin-actions">
                        <div className="admin-actions-grow">
                          <input
                            type="text"
                            className="input-dark"
                            placeholder="Optional admin note…"
                            value={noteInputs[invite.id] ?? ''}
                            onChange={(e) =>
                              setNoteInputs((prev) => ({ ...prev, [invite.id]: e.target.value }))
                            }
                          />
                        </div>
                        <button
                          className="btn btn-success btn-sm"
                          onClick={() => handleDecision(invite, InviteStatus.APPROVED)}
                          disabled={updateMutation.isPending}
                        >
                          Approve
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDecision(invite, InviteStatus.REJECTED)}
                          disabled={updateMutation.isPending}
                        >
                          Reject
                        </button>
                      </div>
                    )}

                    {invite.adminNote && (
                      <div className="admin-note-line">
                        Admin note: {invite.adminNote}
                      </div>
                    )}
                  </div>
                  ))}
                </div>
              )}

              {/* Pagination */}
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

export default AdminInvitesPage;
