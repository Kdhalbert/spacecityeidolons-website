import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '../services/admin.service';
import { PageHero, PageSection, DarkCard } from '../components/ui';
import { Role, UserStatus, type AdminUserListItem } from '../types';

const ROLE_LABELS: Record<Role, string> = {
  [Role.GUEST]: 'Guest',
  [Role.MEMBER]: 'Member',
  [Role.ADMIN]: 'Admin',
};

const STATUS_LABELS: Record<UserStatus, string> = {
  [UserStatus.PENDING]: 'Pending',
  [UserStatus.ACTIVE]: 'Active',
  [UserStatus.SUSPENDED]: 'Suspended',
  [UserStatus.BANNED]: 'Banned',
};

const STATUS_COLORS: Record<UserStatus, string> = {
  [UserStatus.ACTIVE]: 'var(--success, #22c55e)',
  [UserStatus.PENDING]: 'var(--warning, #eab308)',
  [UserStatus.SUSPENDED]: 'var(--orange, #f97316)',
  [UserStatus.BANNED]: 'var(--error, #ef4444)',
};

const AdminUsersPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [roleFilter, setRoleFilter] = useState<Role | ''>('');
  const [statusFilter, setStatusFilter] = useState<UserStatus | ''>('');

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin', 'users', { page, search, roleFilter, statusFilter }],
    queryFn: () =>
      adminService.listUsers({
        page,
        limit: 20,
        search: search || undefined,
        role: roleFilter || undefined,
        status: statusFilter || undefined,
      }),
  });

  const roleMutation = useMutation({
    mutationFn: ({ id, role }: { id: string; role: Role }) =>
      adminService.updateUserRole(id, role),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'users'] }),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: UserStatus }) =>
      adminService.updateUserStatus(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'users'] }),
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const handleRoleChange = (user: AdminUserListItem, newRole: Role) => {
    if (newRole === user.role) return;
    roleMutation.mutate({ id: user.id, role: newRole });
  };

  const handleStatusChange = (user: AdminUserListItem, newStatus: UserStatus) => {
    if (newStatus === user.status) return;
    statusMutation.mutate({ id: user.id, status: newStatus });
  };

  const users = data?.data ?? [];
  const meta = data?.meta;

  return (
    <>
      <PageHero
        title="User Management"
        subtitle="New users join as Guests by default. Promote to Member when they are approved for full community access."
      />
      <PageSection>
        <div className="admin-toolbar">
          <Link to="/admin/invites" className="btn btn-secondary btn-sm admin-toolbar-right">
            Invite Requests
          </Link>
        </div>

        <DarkCard>
          {/* Filters */}
          <div className="admin-filters">
            <form onSubmit={handleSearch} className="admin-search-form">
              <input
                type="search"
                className="input-dark"
                aria-label="Search users by username or email"
                placeholder="Search by username or email…"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
              <button type="submit" className="btn btn-primary btn-sm">Search</button>
            </form>

            <select
              className="input-dark admin-select"
              value={roleFilter}
              onChange={(e) => { setRoleFilter(e.target.value as Role | ''); setPage(1); }}
            >
              <option value="">All Roles</option>
              {Object.values(Role).map((r) => (
                <option key={r} value={r}>{ROLE_LABELS[r]}</option>
              ))}
            </select>

            <select
              className="input-dark admin-select"
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value as UserStatus | ''); setPage(1); }}
            >
              <option value="">All Statuses</option>
              {Object.values(UserStatus).map((s) => (
                <option key={s} value={s}>{STATUS_LABELS[s]}</option>
              ))}
            </select>
          </div>

          <div className="admin-note">
            Guests have restricted profile visibility and should be promoted to Member only after admin review.
          </div>

          {/* Table */}
          {isLoading && <p className="admin-loading">Loading users…</p>}
          {isError && <p className="admin-error">Failed to load users.</p>}

          {!isLoading && !isError && (
            <>
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      {['User', 'Email', 'Status', 'Role', 'Joined', 'Actions'].map((col) => (
                        <th key={col}>
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {users.length === 0 && (
                      <tr>
                        <td colSpan={6} className="admin-empty">
                          No users found.
                        </td>
                      </tr>
                    )}
                    {users.map((user) => (
                      <tr key={user.id}>
                        <td>
                          <div className="admin-avatar-row">
                            {user.discordAvatar && user.discordId && (
                              <img
                                src={`https://cdn.discordapp.com/avatars/${user.discordId}/${user.discordAvatar}.png`}
                                alt={user.discordUsername}
                                className="admin-avatar"
                              />
                            )}
                            <span className="admin-name">{user.discordUsername}</span>
                          </div>
                        </td>
                        <td className="admin-cell-muted">
                          {user.email ?? '—'}
                        </td>
                        <td>
                          <span
                            className="status-chip"
                            style={{
                              backgroundColor: STATUS_COLORS[user.status] + '22',
                              color: STATUS_COLORS[user.status],
                              borderColor: STATUS_COLORS[user.status] + '44',
                            }}
                          >
                            {STATUS_LABELS[user.status]}
                          </span>
                        </td>
                        <td>
                          <select
                            className="input-dark"
                            value={user.role}
                            onChange={(e) => handleRoleChange(user, e.target.value as Role)}
                            style={{ padding: '4px 8px', fontSize: '0.85rem' }}
                            disabled={roleMutation.isPending}
                          >
                            {Object.values(Role).map((r) => (
                              <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                            ))}
                          </select>
                        </td>
                        <td className="admin-cell-muted" style={{ whiteSpace: 'nowrap' }}>
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                        <td>
                          <div className="admin-actions-inline">
                            {user.status !== UserStatus.ACTIVE && (
                              <button
                                className="btn btn-success btn-sm"
                                onClick={() => handleStatusChange(user, UserStatus.ACTIVE)}
                                disabled={statusMutation.isPending}
                              >
                                Activate
                              </button>
                            )}
                            {user.status !== UserStatus.SUSPENDED && (
                              <button
                                className="btn btn-warning btn-sm"
                                onClick={() => handleStatusChange(user, UserStatus.SUSPENDED)}
                                disabled={statusMutation.isPending}
                              >
                                Suspend
                              </button>
                            )}
                            {user.status !== UserStatus.BANNED && (
                              <button
                                className="btn btn-danger btn-sm"
                                onClick={() => handleStatusChange(user, UserStatus.BANNED)}
                                disabled={statusMutation.isPending}
                              >
                                Ban
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

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

export default AdminUsersPage;
