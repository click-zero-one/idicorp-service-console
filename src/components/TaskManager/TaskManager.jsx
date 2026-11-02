import { useEffect, useState } from "react";

import { useLanguage } from "../../i18n/useLanguage";

import "./TaskManager.css";

const STORAGE_KEY = "idicorp-demo-tasks";

const emptyForm = {
  title: "",
  description: "",
  completed: false,
};

function loadSavedTasks() {
  try {
    const savedTasks = localStorage.getItem(STORAGE_KEY);

    if (!savedTasks) return [];

    const parsedTasks = JSON.parse(savedTasks);

    return Array.isArray(parsedTasks) ? parsedTasks : [];
  } catch {
    return [];
  }
}

function createTaskId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function TaskManager({ onLogout }) {
  const { t, language } = useLanguage();

  const [tasks, setTasks] = useState(loadSavedTasks);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [formError, setFormError] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch {
      // The demo continues to work if browser storage is unavailable.
    }
  }, [tasks]);

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

  function handleSubmit(event) {
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

    const taskData = {
      title,
      description,
      completed: form.completed,
    };

    if (editingId !== null) {
      setTasks((current) =>
        current.map((task) =>
          task.id === editingId
            ? { ...task, ...taskData }
            : task
        )
      );

      setNotice(t.taskUpdated);
    } else {
      setTasks((current) => [
        {
          id: createTaskId(),
          ...taskData,
        },
        ...current,
      ]);

      setNotice(t.taskCreated);
    }

    closeForm();
  }

  function handleToggleCompleted(task) {
    setTasks((current) =>
      current.map((item) =>
        item.id === task.id
          ? { ...item, completed: !item.completed }
          : item
      )
    );

    setNotice(t.taskUpdated);
  }

  function handleDelete(task) {
    const confirmed = window.confirm(t.confirmDelete);

    if (!confirmed) return;

    setTasks((current) =>
      current.filter((item) => item.id !== task.id)
    );

    setNotice(t.taskDeleted);
  }

  const normalizedSearch = search.trim().toLocaleLowerCase(
    language === "fa" ? "fa" : "en"
  );

  const visibleTasks = tasks.filter((task) => {
    const matchesSearch =
      !normalizedSearch ||
      `${task.title} ${task.description}`
        .toLocaleLowerCase(language === "fa" ? "fa" : "en")
        .includes(normalizedSearch);

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "completed" && task.completed) ||
      (statusFilter === "pending" && !task.completed);

    return matchesSearch && matchesStatus;
  });

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
          <span aria-hidden="true">+</span>
          {t.addTask}
        </button>
      </div>

      <div className="task-manager__toolbar">
        <label className="task-manager__search">
          <span className="task-manager__visually-hidden">
            {t.searchTasks}
          </span>

          <span aria-hidden="true">⌕</span>

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

      {formOpen && (
        <form className="task-form" onSubmit={handleSubmit}>
          <div className="task-form__heading">
            <h3>{editingId !== null ? t.editTask : t.createTask}</h3>

            <button
              className="task-form__close"
              type="button"
              onClick={closeForm}
              aria-label={t.cancel}
            >
              ×
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
            />
            {t.markCompleted}
          </label>

          {formError && (
            <p className="task-manager__error" role="alert">
              {formError}
            </p>
          )}

          <div className="task-form__actions">
            <button className="task-form__save" type="submit">
              {editingId !== null ? t.saveChanges : t.createTask}
            </button>

            <button
              className="task-form__cancel"
              type="button"
              onClick={closeForm}
            >
              {t.cancel}
            </button>
          </div>
        </form>
      )}

      <div className="task-manager__list" aria-live="polite">
        {visibleTasks.length === 0 ? (
          <div className="task-manager__empty">
            <span className="task-manager__empty-mark" aria-hidden="true">
              ✳
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
          visibleTasks.map((task, index) => (
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
                {task.completed ? "✓" : ""}
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