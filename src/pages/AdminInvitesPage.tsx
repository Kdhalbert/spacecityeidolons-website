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
        <div style={{ display: 'flex', gap: '16px', marginBottom: '16px', alignItems: 'center' }}>
          <Link to="/admin/users" style={{ marginLeft: 'auto' }} className="btn btn-secondary btn-sm">
            User Management
          </Link>
        </div>

        <DarkCard>
          {/* Filter */}
          <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', alignItems: 'center' }}>
            <label style={{ color: 'var(--text-muted)', fontFamily: 'sans-serif', fontSize: '0.9rem' }}>
              Status:
            </label>
            <select
              className="input-dark"
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value as InviteStatus | ''); setPage(1); }}
              style={{ minWidth: '130px' }}
            >
              <option value="">All</option>
              {Object.values(InviteStatus).map((s) => (
                <option key={s} value={s}>{STATUS_LABELS[s]}</option>
              ))}
            </select>
          </div>

          {isLoading && <p style={{ color: 'var(--text-muted)' }}>Loading invite requests…</p>}
          {isError && <p style={{ color: 'var(--error, #ef4444)' }}>Failed to load invite requests.</p>}

          {!isLoading && !isError && (
            <>
              {invites.length === 0 && (
                <p style={{ color: 'var(--text-muted)', fontFamily: 'sans-serif', textAlign: 'center', padding: '24px 0' }}>
                  No invite requests found.
                </p>
              )}

              {invites.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {invites.map((invite) => (
                  <div
                    key={invite.id}
                    style={{
                      padding: '16px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color, #333)',
                      backgroundColor: 'var(--bg-card-inner, rgba(255,255,255,0.03))',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                          <span style={{ color: 'var(--text-primary)', fontFamily: 'sans-serif', fontWeight: 600 }}>
                            {invite.name}
                          </span>
                          <span style={{
                            padding: '2px 8px',
                            borderRadius: '4px',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            backgroundColor: STATUS_COLORS[invite.status] + '22',
                            color: STATUS_COLORS[invite.status],
                            border: `1px solid ${STATUS_COLORS[invite.status]}44`,
                          }}>
                            {STATUS_LABELS[invite.status]}
                          </span>
                          <span style={{ color: 'var(--purple-lighter)', fontSize: '0.8rem', fontFamily: 'sans-serif' }}>
                            {invite.platform === Platform.DISCORD ? 'Discord' : 'Matrix'}
                          </span>
                        </div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontFamily: 'sans-serif' }}>
                          {invite.email}
                          {' · '}
                          {new Date(invite.createdAt).toLocaleDateString()}
                        </div>
                        {invite.message && (
                          <p style={{ color: 'var(--text-secondary)', fontFamily: 'sans-serif', fontSize: '0.9rem', marginTop: '8px', fontStyle: 'italic' }}>
                            "{invite.message}"
                          </p>
                        )}
                      </div>
                    </div>

                    {invite.status === InviteStatus.PENDING && (
                      <div style={{ marginTop: '12px', display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                        <div style={{ flexGrow: 1 }}>
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
                          className="btn btn-sm"
                          style={{ backgroundColor: 'var(--success, #22c55e)22', color: 'var(--success, #22c55e)', border: '1px solid var(--success, #22c55e)44' }}
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
                      <div style={{ marginTop: '8px', color: 'var(--text-muted)', fontSize: '0.85rem', fontFamily: 'sans-serif' }}>
                        Admin note: {invite.adminNote}
                      </div>
                    )}
                  </div>
                  ))}
                </div>
              )}

              {/* Pagination */}
              {meta && meta.totalPages > 1 && (
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '16px', alignItems: 'center' }}>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    Previous
                  </button>
                  <span style={{ color: 'var(--text-muted)', fontFamily: 'sans-serif', fontSize: '0.9rem' }}>
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
