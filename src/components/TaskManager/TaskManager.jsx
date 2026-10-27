
import { useCallback, useEffect, useState } from "react";

import { useLanguage } from "../../i18n/useLanguage";
import {
  createTask,
  deleteTask,
  getTasks,
  patchTask,
  updateTask,
} from "../../services/api";

import "./TaskManager.css";

const emptyForm = {
  title: "",
  description: "",
  completed: false,
};

function TaskManager({ accessToken, onLogout }) {
  const { t } = useLanguage();

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [notice, setNotice] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [formError, setFormError] = useState("");
  const [formOpen, setFormOpen] = useState(false);

  const loadTasks = useCallback(async () => {
    setLoading(true);
    setErrorMessage("");

    try {
      const filters = {
        q: search,
        completed:
          statusFilter === "all"
            ? ""
            : statusFilter === "completed",
      };

      const result = await getTasks(accessToken, filters);
      const taskList = Array.isArray(result)
        ? result
        : result?.tasks ?? result?.items ?? [];

      setTasks(taskList);
 } catch (error) {
  if (error.status === 401 || error.status === 403) {
    setErrorMessage(
      "Ù†Ø´Ø³Øª ÙˆØ±ÙˆØ¯ Ù…Ø¹ØªØ¨Ø± Ù†ÛŒØ³Øª. Ø¯ÙˆØ¨Ø§Ø±Ù‡ ÙˆØ§Ø±Ø¯ Ø­Ø³Ø§Ø¨ Ø´Ùˆ."
    );
  } else {
    setErrorMessage(t.taskLoadError);
  }
} finally {
      setLoading(false);
    }
  }, [accessToken, search, statusFilter, t.taskLoadError]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  function openCreateForm() {
    setForm({ ...emptyForm });
    setEditingId(null);
    setFormError("");
    setNotice("");
    setFormOpen(true);
  }

  function openEditForm(task) {
    setForm({
      title: task.title || "",
      description: task.description || "",
      completed: Boolean(task.completed),
    });

    setEditingId(task.id);
    setFormError("");
    setNotice("");
    setFormOpen(true);
  }

  function closeForm() {
    setFormOpen(false);
    setEditingId(null);
    setForm({ ...emptyForm });
    setFormError("");
  }

  function handleFormChange(event) {
    const { name, value, checked, type } = event.target;

    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const title = form.title.trim();
    const description = form.description.trim();

    if (!title) {
      setFormError(t.titleRequired);
      return;
    }

    if (title.length > 120) {
      setFormError(t.titleTooLong);
      return;
    }

    if (description.length > 2000) {
      setFormError(t.descriptionTooLong);
      return;
    }

    setSaving(true);
    setFormError("");
    setNotice("");

    const taskData = {
      title,
      description,
      completed: form.completed,
    };

    try {
      if (editingId !== null) {
        await updateTask(accessToken, editingId, taskData);
        setNotice(t.taskUpdated);
      } else {
        await createTask(accessToken, taskData);
        setNotice(t.taskCreated);
      }

      closeForm();
      await loadTasks();
    } catch {
      setFormError(t.taskSaveError);
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleCompleted(task) {
    setNotice("");
    setErrorMessage("");

    try {
      await patchTask(accessToken, task.id, {
        completed: !task.completed,
      });

      setTasks((current) =>
        current.map((item) =>
          item.id === task.id
            ? { ...item, completed: !item.completed }
            : item
        )
      );

      setNotice(
        !task.completed ? t.taskUpdated : t.taskUpdated
      );
    } catch {
      setErrorMessage(t.taskSaveError);
    }
  }

  async function handleDelete(task) {
    const confirmed = window.confirm(t.confirmDelete);

    if (!confirmed) {
      return;
    }

    setNotice("");
    setErrorMessage("");

    try {
      await deleteTask(accessToken, task.id);

      setTasks((current) =>
        current.filter((item) => item.id !== task.id)
      );

      setNotice(t.taskDeleted);
    } catch {
      setErrorMessage(t.taskDeleteError);
    }
  }

  const completedCount = tasks.filter(
    (task) => task.completed
  ).length;

  return (
    <section className="task-manager" aria-labelledby="tasks-title">
      <div className="task-manager__heading">
        <div>
          <span className="task-manager__eyebrow">
            {t.tasksEyebrow}
          </span>

          <h2 id="tasks-title" className="task-manager__title">
            {t.tasksTitle}
          </h2>

          <p className="task-manager__description">
            {t.tasksDescription}
          </p>
        </div>

        <button
          className="task-manager__logout"
          type="button"
          onClick={onLogout}
        >
          {t.logout}
        </button>
      </div>

      <div className="task-manager__stats">
        <div className="task-manager__stat">
          <span>{t.taskCount}</span>
          <strong>{tasks.length}</strong>
        </div>

        <div className="task-manager__stat task-manager__stat--accent">
          <span>{t.completedTasks}</span>
          <strong>{completedCount}</strong>
        </div>

        <button
          className="task-manager__add"
          type="button"
          onClick={openCreateForm}
        >
          <span aria-hidden="true">ï¼‹</span>
          {t.addTask}
        </button>
      </div>

      <div className="task-manager__toolbar">
        <label className="task-manager__search">
          <span className="task-manager__visually-hidden">
            {t.searchTasks}
          </span>

          <span aria-hidden="true">âŒ•</span>

          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={t.searchTasks}
          />
        </label>

        <div className="task-manager__filters" aria-label={t.tasksTitle}>
          {[
            { value: "all", label: t.allTasks },
            { value: "pending", label: t.pendingTasks },
            { value: "completed", label: t.completedTasks },
          ].map((filter) => (
            <button
              key={filter.value}
              type="button"
              className={
                statusFilter === filter.value
                  ? "task-manager__filter task-manager__filter--active"
                  : "task-manager__filter"
              }
              aria-pressed={statusFilter === filter.value}
              onClick={() => setStatusFilter(filter.value)}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {notice && (
        <p className="task-manager__notice" role="status">
          {notice}
        </p>
      )}

      {errorMessage && (
        <p className="task-manager__error" role="alert">
          {errorMessage}
          <button type="button" onClick={loadTasks}>
            â†»
          </button>
        </p>
      )}

      {formOpen && (
        <form className="task-form" onSubmit={handleSubmit}>
          <div className="task-form__heading">
            <h3>{editingId !== null ? t.editTask : t.createTask}</h3>

            <button
              className="task-form__close"
              type="button"
              onClick={closeForm}
              aria-label={t.cancel}
              disabled={saving}
            >
              Ã—
            </button>
          </div>

          <div className="task-form__field">
            <label htmlFor="task-title">{t.taskTitle}</label>
            <input
              id="task-title"
              name="title"
              value={form.title}
              onChange={handleFormChange}
              placeholder={t.taskTitlePlaceholder}
              maxLength={120}
              required
              disabled={saving}
            />
            <span className="task-form__counter">
              {form.title.length}/120
            </span>
          </div>

          <div className="task-form__field">
            <label htmlFor="task-description">
              {t.taskDescription}
            </label>
            <textarea
              id="task-description"
              name="description"
              value={form.description}
              onChange={handleFormChange}
              placeholder={t.taskDescriptionPlaceholder}
              maxLength={2000}
              rows={3}
              disabled={saving}
            />
            <span className="task-form__counter">
              {form.description.length}/2000
            </span>
          </div>

          <label className="task-form__checkbox">
            <input
              type="checkbox"
              name="completed"
              checked={form.completed}
              onChange={handleFormChange}
              disabled={saving}
            />
            {t.markCompleted}
          </label>

          {formError && (
            <p className="task-manager__error" role="alert">
              {formError}
            </p>
          )}

          <div className="task-form__actions">
            <button
              className="task-form__save"
              type="submit"
              disabled={saving}
            >
              {saving
                ? "â€¦"
                : editingId !== null
                  ? t.saveChanges
                  : t.createTask}
            </button>

            <button
              className="task-form__cancel"
              type="button"
              onClick={closeForm}
              disabled={saving}
            >
              {t.cancel}
            </button>
          </div>
        </form>
      )}

      <div className="task-manager__list" aria-live="polite">
        {loading ? (
          <div className="task-manager__empty">
            <span className="task-manager__loader" aria-hidden="true" />
            <p>{t.loadingTasks}</p>
          </div>
        ) : tasks.length === 0 ? (
          <div className="task-manager__empty">
            <span className="task-manager__empty-mark" aria-hidden="true">
              âœ³
            </span>
            <p>
              {search.trim() || statusFilter !== "all"
                ? t.noSearchResults
                : t.emptyTasks}
            </p>
            {!search.trim() && statusFilter === "all" && (
              <button type="button" onClick={openCreateForm}>
                {t.addTask}
              </button>
            )}
          </div>
        ) : (
          tasks.map((task, index) => (
            <article
              className={
                task.completed
                  ? "task-card task-card--completed"
                  : "task-card"
              }
              key={task.id}
            >
              <div className="task-card__index" aria-hidden="true">
                {String(index + 1).padStart(2, "0")}
              </div>

              <button
                className="task-card__check"
                type="button"
                onClick={() => handleToggleCompleted(task)}
                aria-label={
                  task.completed ? t.markPending : t.markDone
                }
                title={task.completed ? t.markPending : t.markDone}
              >
                {task.completed ? "âœ“" : ""}
              </button>

              <div className="task-card__content">
                <div className="task-card__topline">
                  <h3>{task.title}</h3>

                  <span
                    className={
                      task.completed
                        ? "task-card__status task-card__status--completed"
                        : "task-card__status"
                    }
                  >
                    {task.completed
                      ? t.completedLabel
                      : t.pendingLabel}
                  </span>
                </div>

                {task.description && (
                  <p className="task-card__description">
                    {task.description}
                  </p>
                )}

                <div className="task-card__actions">
                  <button
                    type="button"
                    onClick={() => openEditForm(task)}
                  >
                    {t.edit}
                  </button>

                  <button
                    className="task-card__delete"
                    type="button"
                    onClick={() => handleDelete(task)}
                  >
                    {t.delete}
                  </button>
                </div>
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
}

export default TaskManager;

