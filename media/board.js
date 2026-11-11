// @ts-check
// Renders the project board from 'render' messages. All user text goes through textContent, never innerHTML.
(function () {
  const vscode = acquireVsCodeApi();
  const board = /** @type {HTMLElement} */ (document.getElementById('board'));
  const search = /** @type {HTMLInputElement} */ (document.getElementById('search'));
  const summary = /** @type {HTMLElement} */ (document.getElementById('summary'));
  const DRAG_TYPE = 'application/x-project-id';

  /** @type {any} */
  let lastRender;

  window.addEventListener('message', (event) => {
    if (event.data.type === 'render') {
      lastRender = event.data;
      render();
    }
  });
  search.addEventListener('input', applyFilter);
  vscode.postMessage({ type: 'ready' });

  function render() {
    search.placeholder = lastRender.labels.search;
    board.replaceChildren(...lastRender.columns.map(renderColumn));
    applyFilter();
  }

  function element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  /** Palette colors use a theme-aware class; custom hex colors are set directly. */
  function applyColor(node, color) {
    if (color.startsWith('#')) {
      node.style.setProperty('--accent', color);
    } else {
      node.classList.add(`c-${color}`);
    }
    return node;
  }

  function renderColumn(column) {
    const section = applyColor(element('section', 'column'), column.color);
    const header = element('div', 'column-header');
    header.append(element('span', 'dot'), element('span', '', column.label), element('span', 'count', String(column.cards.length)));
    section.append(header);
    if (column.cards.length === 0) {
      section.append(element('div', 'empty', lastRender.labels.dropHere));
    }
    section.append(...column.cards.map((card) => renderCard(card, column.color)));
    makeDropTarget(section, column.statusId);
    return section;
  }

  function renderCard(card, statusColor) {
    const node = applyColor(element('article', 'card'), statusColor);
    node.tabIndex = 0;
    node.draggable = true;
    node.classList.toggle('current', card.isCurrent);
    node.classList.toggle('missing', card.isMissing);
    node.dataset.search = searchText(card);
    node.title = card.path;
    node.append(renderTitle(card), ...renderOptional(card), renderMeta(card));
    node.addEventListener('click', (event) => open(card, event.ctrlKey || event.metaKey));
    node.addEventListener('keydown', (event) => event.key === 'Enter' && open(card, event.ctrlKey || event.metaKey));
    node.addEventListener('dragstart', (event) => startDrag(event, node, card));
    node.addEventListener('dragend', () => node.classList.remove('dragging'));
    return node;
  }

  function renderTitle(card) {
    const title = element('div', 'card-title');
    if (card.isPinned) title.append(element('span', 'pin', '★'));
    if (card.isMissing) title.append(element('span', 'warning', '⚠'));
    title.append(element('span', 'name', card.name));
    if (card.isCurrent) title.append(element('span', 'badge-current', `● ${lastRender.labels.current}`));
    title.append(renderActions(card));
    return title;
  }

  function renderActions(card) {
    const actions = element('div', 'actions');
    actions.append(
      actionButton('✎', lastRender.labels.editNote, () => vscode.postMessage({ type: 'editNote', projectId: card.id })),
      actionButton('⧉', lastRender.labels.newWindow, () => open(card, true)),
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
    const chips = [card.group ? { ...card.group, name: `▣ ${card.group.name}` } : undefined, ...card.tags.map((tag) => ({ ...tag, name: `#${tag.name}` }))]
      .filter(Boolean);
    if (chips.length > 0) {
      const row = element('div', 'chips');
      row.append(...chips.map((chip) => applyColor(element('span', 'chip', chip.name), chip.color)));
      parts.push(row);
    }
    if (card.note) parts.push(element('div', 'note', `✎ ${card.note}`));
    return parts;
  }

  function renderMeta(card) {
    const meta = element('div', 'meta');
    if (card.isMissing) meta.append(element('span', 'warning', lastRender.labels.missing));
    if (card.projectType) meta.append(element('span', '', `◆ ${card.projectType}`));
    if (card.branch) meta.append(element('span', '', `⎇ ${card.branch}`));
    meta.append(element('span', '', `⏱ ${relativeTime(card.lastOpened)}`));
    return meta;
  }

  function relativeTime(timestamp) {
    if (timestamp === undefined || timestamp === null) return lastRender.labels.never;
    const format = new Intl.RelativeTimeFormat(lastRender.locale, { numeric: 'auto' });
    const minutes = Math.round((timestamp - Date.now()) / 60000);
    const steps = [[60, 'minute'], [24, 'hour'], [30, 'day'], [12, 'month'], [Infinity, 'year']];
    let value = minutes;
    for (const [size, unit] of steps) {
      if (Math.abs(value) < size) return format.format(value, unit);
      value = Math.round(value / size);
    }
    return format.format(value, 'year');
  }

  function searchText(card) {
    return [card.name, card.path, card.note, card.group?.name, card.projectType, ...card.tags.map((tag) => `#${tag.name}`)]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();
  }

  function applyFilter() {
    const terms = search.value.toLowerCase().split(/\s+/).filter(Boolean);
    const cards = Array.from(board.querySelectorAll('.card'));
    let visible = 0;
    for (const card of cards) {
      const matches = terms.every((term) => (card instanceof HTMLElement ? card.dataset.search ?? '' : '').includes(term));
      card.classList.toggle('hidden', !matches);
      visible += matches ? 1 : 0;
    }
    summary.textContent = `${visible} / ${cards.length} ${lastRender.labels.projects}`;
  }

  function open(card, newWindow) {
    vscode.postMessage({ type: 'open', projectId: card.id, newWindow });
  }

  function startDrag(event, node, card) {
    event.dataTransfer.setData(DRAG_TYPE, card.id);
    event.dataTransfer.effectAllowed = 'move';
    node.classList.add('dragging');
  }

  function makeDropTarget(section, statusId) {
    section.addEventListener('dragover', (event) => {
      if (!event.dataTransfer?.types.includes(DRAG_TYPE)) return;
      event.preventDefault();
      section.classList.add('drop-target');
    });
    section.addEventListener('dragleave', () => section.classList.remove('drop-target'));
    section.addEventListener('drop', (event) => {
      event.preventDefault();
      section.classList.remove('drop-target');
      const projectId = event.dataTransfer?.getData(DRAG_TYPE);
      if (projectId) vscode.postMessage({ type: 'setStatus', projectId, statusId });
    });
  }
})();
