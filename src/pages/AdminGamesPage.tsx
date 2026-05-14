import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminService } from '../services/admin.service';
import { gameService } from '../services/games.service';
import { DarkCard, PageHero, PageSection } from '../components/ui';

type GameFormState = {
  name: string;
  description: string;
  category: string;
  imageUrl: string;
  tags: string;
};

const EMPTY_FORM: GameFormState = {
  name: '',
  description: '',
  category: '',
  imageUrl: '',
  tags: '',
};

const AdminGamesPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<GameFormState>(EMPTY_FORM);
  const [editingGameId, setEditingGameId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin', 'games'],
    queryFn: () => gameService.getGames(undefined, 200, 0),
  });

  const createMutation = useMutation({
    mutationFn: () =>
      adminService.createGame({
        name: form.name,
        description: form.description || undefined,
        category: form.category || undefined,
        imageUrl: form.imageUrl || undefined,
        tags: form.tags
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean),
      }),
    onSuccess: () => {
      setForm(EMPTY_FORM);
      setErrorMessage(null);
      queryClient.invalidateQueries({ queryKey: ['admin', 'games'] });
    },
    onError: (error) => {
      const responseMessage = (error as { response?: { data?: { message?: string } } })
        ?.response?.data?.message;
      setErrorMessage(responseMessage ?? 'Failed to create game page.');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Parameters<typeof adminService.updateGame>[1] }) =>
      adminService.updateGame(id, payload),
    onSuccess: () => {
      setForm(EMPTY_FORM);
      setEditingGameId(null);
      setErrorMessage(null);
      queryClient.invalidateQueries({ queryKey: ['admin', 'games'] });
    },
    onError: (error) => {
      const responseMessage = (error as { response?: { data?: { message?: string } } })
        ?.response?.data?.message;
      setErrorMessage(responseMessage ?? 'Failed to update game page.');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminService.deleteGame(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'games'] });
    },
    onError: () => {
      setErrorMessage('Failed to delete game page.');
    },
  });

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const games = useMemo(() => data?.data ?? [], [data]);

  const startEdit = (game: {
    id: string;
    name: string;
    description?: string | null;
    category?: string | null;
    imageUrl?: string | null;
    tags?: string[];
  }) => {
    setEditingGameId(game.id);
    setForm({
      name: game.name,
      description: game.description || '',
      category: game.category || '',
      imageUrl: game.imageUrl || '',
      tags: (game.tags || []).join(', '),
    });
    setErrorMessage(null);
  };

  const cancelEdit = () => {
    setEditingGameId(null);
    setForm(EMPTY_FORM);
    setErrorMessage(null);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!form.name.trim()) {
      setErrorMessage('Game name is required.');
      return;
    }

    if (editingGameId) {
      updateMutation.mutate({
        id: editingGameId,
        payload: {
          name: form.name,
          description: form.description || undefined,
          category: form.category || undefined,
          imageUrl: form.imageUrl || undefined,
          tags: form.tags
            .split(',')
            .map((tag) => tag.trim())
            .filter(Boolean),
        },
      });
      return;
    }

    createMutation.mutate();
  };

  const handleDelete = (id: string, name: string) => {
    const confirmed = window.confirm(`Delete game page "${name}"? This cannot be undone.`);
    if (!confirmed) {
      return;
    }
    deleteMutation.mutate(id);
  };

  return (
    <>
      <PageHero
        title="Game Page Management"
        subtitle="Create and maintain game pages directly from the admin area."
      />
      <PageSection>
        <div className="admin-toolbar">
          <Link to="/admin/events" className="btn btn-secondary btn-sm">Events</Link>
          <Link to="/admin/users" className="btn btn-secondary btn-sm">User Management</Link>
          <Link to="/admin/invites" className="btn btn-secondary btn-sm">Invite Requests</Link>
          <Link to="/admin/game-requests" className="btn btn-secondary btn-sm">Game Requests</Link>
        </div>

        <DarkCard>
          <h3 className="form-intro-title">
            {editingGameId ? 'Edit Game Page' : 'Create Game Page'}
          </h3>

          <form onSubmit={submit} className="form-stack" style={{ marginTop: '12px' }}>
            <div className="input-field-wrapper">
              <label htmlFor="admin-game-name" className="input-dark-label">Game Name</label>
              <input
                id="admin-game-name"
                className="input-dark"
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="e.g. Final Fantasy XIV"
                disabled={isSubmitting}
              />
            </div>

            <div className="input-field-wrapper">
              <label htmlFor="admin-game-description" className="input-dark-label">Description</label>
              <textarea
                id="admin-game-description"
                className="input-dark"
                value={form.description}
                onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Short summary for the public games list"
                disabled={isSubmitting}
              />
            </div>

            <div className="admin-filters">
              <div className="input-field-wrapper" style={{ flex: 1 }}>
                <label htmlFor="admin-game-category" className="input-dark-label">Category</label>
                <input
                  id="admin-game-category"
                  className="input-dark"
                  value={form.category}
                  onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
                  placeholder="RPG, Shooter, MMO..."
                  disabled={isSubmitting}
                />
              </div>

              <div className="input-field-wrapper" style={{ flex: 1 }}>
                <label htmlFor="admin-game-image" className="input-dark-label">Image URL</label>
                <input
                  id="admin-game-image"
                  className="input-dark"
                  value={form.imageUrl}
                  onChange={(e) => setForm((prev) => ({ ...prev, imageUrl: e.target.value }))}
                  placeholder="https://..."
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="input-field-wrapper">
              <label htmlFor="admin-game-tags" className="input-dark-label">Tags (comma separated)</label>
              <input
                id="admin-game-tags"
                className="input-dark"
                value={form.tags}
                onChange={(e) => setForm((prev) => ({ ...prev, tags: e.target.value }))}
                placeholder="coop, pve, raid"
                disabled={isSubmitting}
              />
            </div>

            {errorMessage && <p className="admin-error">{errorMessage}</p>}

            <div className="admin-actions-inline">
              <button type="submit" className="btn btn-primary btn-sm" disabled={isSubmitting}>
                {editingGameId ? 'Save Changes' : 'Create Game'}
              </button>
              {editingGameId && (
                <button type="button" className="btn btn-secondary btn-sm" onClick={cancelEdit} disabled={isSubmitting}>
                  Cancel Edit
                </button>
              )}
            </div>
          </form>
        </DarkCard>

        <DarkCard>
          <h3 className="form-intro-title">Existing Game Pages</h3>

          {isLoading && <p className="admin-loading">Loading games…</p>}
          {isError && <p className="admin-error">Failed to load games.</p>}

          {!isLoading && !isError && games.length === 0 && (
            <p className="admin-empty">No game pages exist yet.</p>
          )}

          {!isLoading && !isError && games.length > 0 && (
            <div className="admin-list">
              {games.map((game) => (
                <div key={game.id} className="admin-card">
                  <div className="admin-card-row" style={{ justifyContent: 'space-between' }}>
                    <div>
                      <p className="admin-name">{game.name}</p>
                      <p className="admin-cell-muted">/{game.slug}</p>
                      {game.category && <p className="admin-meta">Category: {game.category}</p>}
                      {game.description && <p className="admin-message">{game.description}</p>}
                    </div>

                    <div className="admin-actions-inline">
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => startEdit(game)}
                        disabled={isSubmitting}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDelete(game.id, game.name)}
                        disabled={deleteMutation.isPending}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </DarkCard>
      </PageSection>
    </>
  );
};

export default AdminGamesPage;
