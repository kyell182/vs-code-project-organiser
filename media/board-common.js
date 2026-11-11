// @ts-check
// Helpers shared by the board (columns) and the shelf view. All user text goes through textContent.
(function () {
  const vscode = acquireVsCodeApi();
  const DRAG_TYPE = 'application/x-project-id';
  const GRAY_VARIABLE = 'var(--vscode-descriptionForeground)';

  function element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  /** Palette names follow the theme; custom hex colors are used as they are. */
  function colorValue(color) {
    if (color.startsWith('#')) return color;
    return color === 'gray' ? GRAY_VARIABLE : `var(--vscode-charts-${color})`;
  }

  function applyColor(node, color, variable = '--accent') {
    node.style.setProperty(variable, colorValue(color));
    return node;
  }

  function relativeTime(timestamp, render) {
    if (timestamp === undefined || timestamp === null) return render.labels.never;
    const format = new Intl.RelativeTimeFormat(render.locale, { numeric: 'auto' });
    const steps = [[60, 'minute'], [24, 'hour'], [30, 'day'], [12, 'month'], [Infinity, 'year']];
    let value = Math.round((timestamp - Date.now()) / 60000);
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

  /** Alt+click opens in a new window; Ctrl/Cmd+click does too, as people expect from links. */
  function wantsNewWindow(event) {
    return event.altKey || event.ctrlKey || event.metaKey;
  }

  function open(card, newWindow) {
    vscode.postMessage({ type: 'open', projectId: card.id, newWindow });
  }

  function makeDraggable(node, card) {
    node.draggable = true;
    node.addEventListener('dragstart', (event) => {
      event.dataTransfer.setData(DRAG_TYPE, card.id);
      event.dataTransfer.effectAllowed = 'move';
      node.classList.add('dragging');
    });
    node.addEventListener('dragend', () => node.classList.remove('dragging'));
  }

  /** The item the pointer is in front of, along the list's direction; undefined means "at the end". */
  function itemAfterPointer(container, selector, event, axis) {
    const items = Array.from(container.querySelectorAll(selector)).filter((item) => !item.classList.contains('dragging'));
    return items.find((item) => {
      const box = item.getBoundingClientRect();
      return axis === 'x' ? event.clientX < box.left + box.width / 2 : event.clientY < box.top + box.height / 2;
    });
  }

  function clearMarkers(container) {
    container.querySelectorAll('.insert-before').forEach((item) => item.classList.remove('insert-before'));
  }

  /** Dropping sets the status of the container and the position in front of the item under the pointer. */
  function makeDropZone(container, statusId, selector, axis) {
    container.addEventListener('dragover', (event) => {
      if (!event.dataTransfer?.types.includes(DRAG_TYPE)) return;
      event.preventDefault();
      container.classList.add('drop-target');
      clearMarkers(container);
      itemAfterPointer(container, selector, event, axis)?.classList.add('insert-before');
    });
    container.addEventListener('dragleave', (event) => {
      if (container.contains(/** @type {Node} */ (event.relatedTarget))) return;
      container.classList.remove('drop-target');
      clearMarkers(container);
    });
    container.addEventListener('drop', (event) => {
      event.preventDefault();
      const before = itemAfterPointer(container, selector, event, axis);
      container.classList.remove('drop-target');
      clearMarkers(container);
      const projectId = event.dataTransfer?.getData(DRAG_TYPE);
      if (projectId) vscode.postMessage({ type: 'move', projectId, statusId, beforeId: before?.dataset.id });
    });
  }

  window.ProjectsHub = { vscode, element, colorValue, applyColor, relativeTime, searchText, open, wantsNewWindow, makeDraggable, makeDropZone };
})();
