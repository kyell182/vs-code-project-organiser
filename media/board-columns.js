// @ts-check
// The kanban view: one column per status with a card per project.
(function () {
  const hub = window.ProjectsHub;
  const { element, applyColor } = hub;

  function renderColumns(render) {
    return render.columns.map((column) => renderColumn(column, render));
  }

  function renderColumn(column, render) {
    const section = applyColor(element('section', 'column'), column.color);
    const header = element('div', 'column-header');
    header.append(element('span', 'dot'), element('span', '', column.label), element('span', 'count', String(column.cards.length)));
    section.append(header);
    if (column.cards.length === 0) section.append(element('div', 'empty', render.labels.dropHere));
    section.append(...column.cards.map((card) => renderCard(card, column.color, render)));
    hub.makeDropZone(section, column.statusId, '.card', 'y');
    return section;
  }

  function renderCard(card, statusColor, render) {
    const node = applyColor(element('article', 'card project'), statusColor);
    node.tabIndex = 0;
    node.dataset.id = card.id;
    node.dataset.search = hub.searchText(card);
    node.title = card.path;
    node.classList.toggle('current', card.isCurrent);
    node.classList.toggle('missing', card.isMissing);
    node.append(renderTitle(card, render), ...renderOptional(card), ...renderTodos(card), renderMeta(card, render));
    node.addEventListener('click', (event) => hub.open(card, hub.wantsNewWindow(event)));
    node.addEventListener('keydown', (event) => event.key === 'Enter' && hub.open(card, hub.wantsNewWindow(event)));
    hub.makeDraggable(node, card);
    return node;
  }

  function renderTitle(card, render) {
    const title = element('div', 'card-title');
    if (card.isPinned) title.append(element('span', 'pin', '★'));
    if (card.isMissing) title.append(element('span', 'warning', '⚠'));
    title.append(element('span', 'name', card.name));
    if (card.isCurrent) title.append(element('span', 'badge-current', `● ${render.labels.current}`));
    title.append(renderActions(card, render));
    return title;
  }

  function renderActions(card, render) {
    const actions = element('div', 'actions');
    actions.append(
      actionButton('☑', render.labels.todos, () => hub.vscode.postMessage({ type: 'manageTodos', projectId: card.id })),
      actionButton('✎', render.labels.editNote, () => hub.vscode.postMessage({ type: 'editNote', projectId: card.id })),
      actionButton('🎨', render.labels.bookColor, () => hub.vscode.postMessage({ type: 'setBookColor', projectId: card.id })),
      actionButton('⧉', render.labels.newWindow, () => hub.open(card, true)),
    );
    return actions;
  }

  function actionButton(symbol, label, onClick) {
    const button = element('button', '', symbol);
    button.title = label;
    button.setAttribute('aria-label', label);
    button.addEventListener('click', (event) => {
      event.stopPropagation();
      onClick();
    });
    return button;
  }

  /** Chips and note only appear when there is something to show. */
  function renderOptional(card) {
    const parts = [];
    const group = card.group ? [{ ...card.group, name: `▣ ${card.group.name}` }] : [];
    const chips = [...group, ...card.tags.map((tag) => ({ ...tag, name: `#${tag.name}` }))];
    if (chips.length > 0) {
      const row = element('div', 'chips');
      row.append(...chips.map((chip) => applyColor(element('span', 'chip', chip.name), chip.color)));
      parts.push(row);
    }
    if (card.note) parts.push(element('div', 'note', `✎ ${card.note}`));
    return parts;
  }

  /** Progress and the next open to-dos; ticking one off works right on the card. */
  function renderTodos(card) {
    if (card.todos.total === 0) return [];
    const block = element('div', 'todos');
    const header = element('div', 'todos-header');
    header.append(hub.progressBar(card.todos, 'progress'), element('span', 'todos-count', `${card.todos.done}/${card.todos.total}`));
    block.append(header, ...card.todos.next.map((todo) => renderTodo(card, todo)));
    return [block];
  }

  function renderTodo(card, todo) {
    const row = element('button', 'todo');
    row.append(element('span', 'todo-box', '☐'), element('span', 'todo-text', todo.text));
    row.addEventListener('click', (event) => {
      event.stopPropagation();
      row.classList.add('is-done');
      hub.vscode.postMessage({ type: 'toggleTodo', projectId: card.id, todoId: todo.id });
    });
    return row;
  }

  function renderMeta(card, render) {
    const meta = element('div', 'meta');
    if (card.isMissing) meta.append(element('span', 'warning', render.labels.missing));
    if (card.projectType) meta.append(element('span', '', `◆ ${card.projectType}`));
    if (card.branch) meta.append(element('span', '', `⎇ ${card.branch}`));
    meta.append(element('span', '', `⏱ ${hub.relativeTime(card.lastOpened, render)}`));
    return meta;
  }

  hub.renderColumns = renderColumns;
})();
