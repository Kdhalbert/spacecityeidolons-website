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
        subtitle="View and manage community members, assign roles, and update account status."
      />
      <PageSection>
        <div style={{ display: 'flex', gap: '16px', marginBottom: '16px', alignItems: 'center' }}>
          <Link to="/admin/invites" style={{ marginLeft: 'auto' }} className="btn btn-secondary btn-sm">
            Invite Requests
          </Link>
        </div>

        <DarkCard>
          {/* Filters */}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '20px' }}>
            <form onSubmit={handleSearch} style={{ display: 'flex', gap: '8px', flexGrow: 1 }}>
              <input
                type="search"
                className="input-dark"
                placeholder="Search by username or email…"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                style={{ flexGrow: 1 }}
              />
              <button type="submit" className="btn btn-primary btn-sm">Search</button>
            </form>

            <select
              className="input-dark"
              value={roleFilter}
              onChange={(e) => { setRoleFilter(e.target.value as Role | ''); setPage(1); }}
              style={{ minWidth: '120px' }}
            >
              <option value="">All Roles</option>
              {Object.values(Role).map((r) => (
                <option key={r} value={r}>{ROLE_LABELS[r]}</option>
              ))}
            </select>

            <select
              className="input-dark"
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value as UserStatus | ''); setPage(1); }}
              style={{ minWidth: '130px' }}
            >
              <option value="">All Statuses</option>
              {Object.values(UserStatus).map((s) => (
                <option key={s} value={s}>{STATUS_LABELS[s]}</option>
              ))}
            </select>
          </div>

          {/* Table */}
          {isLoading && <p style={{ color: 'var(--text-muted)' }}>Loading users…</p>}
          {isError && <p style={{ color: 'var(--error, #ef4444)' }}>Failed to load users.</p>}

          {!isLoading && !isError && (
            <>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'sans-serif', fontSize: '0.9rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-color, #333)' }}>
                      {['User', 'Email', 'Status', 'Role', 'Joined', 'Actions'].map((col) => (
                        <th
                          key={col}
                          style={{ padding: '8px 12px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600 }}
                        >
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {users.length === 0 && (
                      <tr>
                        <td colSpan={6} style={{ padding: '24px 12px', textAlign: 'center', color: 'var(--text-muted)' }}>
                          No users found.
                        </td>
                      </tr>
                    )}
                    {users.map((user) => (
                      <tr key={user.id} style={{ borderBottom: '1px solid var(--border-color, #222)' }}>
                        <td style={{ padding: '10px 12px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {user.discordAvatar && user.discordId && (
                              <img
                                src={`https://cdn.discordapp.com/avatars/${user.discordId}/${user.discordAvatar}.png`}
                                alt={user.discordUsername}
                                style={{ width: '28px', height: '28px', borderRadius: '50%' }}
                              />
                            )}
                            <span style={{ color: 'var(--text-primary)' }}>{user.discordUsername}</span>
                          </div>
                        </td>
                        <td style={{ padding: '10px 12px', color: 'var(--text-muted)' }}>
                          {user.email ?? '—'}
                        </td>
                        <td style={{ padding: '10px 12px' }}>
                          <span style={{
                            display: 'inline-block',
                            padding: '2px 8px',
                            borderRadius: '4px',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            backgroundColor: STATUS_COLORS[user.status] + '22',
                            color: STATUS_COLORS[user.status],
                            border: `1px solid ${STATUS_COLORS[user.status]}44`,
                          }}>
                            {STATUS_LABELS[user.status]}
                          </span>
                        </td>
                        <td style={{ padding: '10px 12px' }}>
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
                        <td style={{ padding: '10px 12px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                        <td style={{ padding: '10px 12px' }}>
                          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                            {user.status !== UserStatus.ACTIVE && (
                              <button
                                className="btn btn-sm"
                                style={{ backgroundColor: 'var(--success, #22c55e)22', color: 'var(--success, #22c55e)', border: '1px solid var(--success, #22c55e)44' }}
                                onClick={() => handleStatusChange(user, UserStatus.ACTIVE)}
                                disabled={statusMutation.isPending}
                              >
                                Activate
                              </button>
                            )}
                            {user.status !== UserStatus.SUSPENDED && (
                              <button
                                className="btn btn-sm"
                                style={{ backgroundColor: 'var(--orange, #f97316)22', color: 'var(--orange, #f97316)', border: '1px solid var(--orange, #f97316)44' }}
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

export default AdminUsersPage;
