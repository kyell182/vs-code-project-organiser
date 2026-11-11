// @ts-check
// Entry point of the board page: receives renders, switches between board and shelf, filters.
(function () {
  const hub = window.ProjectsHub;
  const board = /** @type {HTMLElement} */ (document.getElementById('board'));
  const search = /** @type {HTMLInputElement} */ (document.getElementById('search'));
  const summary = /** @type {HTMLElement} */ (document.getElementById('summary'));
  const viewButtons = Array.from(document.querySelectorAll('[data-view]'));
  const VIEWS = { board: (render) => hub.renderColumns(render), shelf: (render) => hub.renderShelves(render) };

  /** The bookcase is the default; a chosen view survives reloads of the page thanks to the webview state. */
  let view = hub.vscode.getState()?.view ?? 'shelf';
  /** @type {any} */
  let lastRender;

  window.addEventListener('message', (event) => {
    if (event.data.type !== 'render') return;
    lastRender = event.data;
    render();
  });
  search.addEventListener('input', applyFilter);
  viewButtons.forEach((button) => button.addEventListener('click', () => switchView(button.dataset.view)));
  hub.vscode.postMessage({ type: 'ready' });

  function switchView(next) {
    view = next;
    hub.vscode.setState({ view });
    render();
  }

  function render() {
    if (!lastRender) return;
    hub.hideTooltip();
    search.placeholder = lastRender.labels.search;
    viewButtons.forEach((button) => {
      button.textContent = button.dataset.view === 'board' ? `🗂 ${lastRender.labels.board}` : `📚 ${lastRender.labels.shelf}`;
      button.setAttribute('aria-pressed', String(button.dataset.view === view));
    });
    board.className = view === 'shelf' ? 'bookcase' : 'board';
    board.replaceChildren(...VIEWS[view](lastRender));
    applyFilter();
  }

  function applyFilter() {
    const terms = search.value.toLowerCase().split(/\s+/).filter(Boolean);
    const items = Array.from(board.querySelectorAll('.project'));
    let visible = 0;
    for (const item of items) {
      const text = item instanceof HTMLElement ? item.dataset.search ?? '' : '';
      const matches = terms.every((term) => text.includes(term));
      item.classList.toggle('hidden', !matches);
      visible += matches ? 1 : 0;
    }
    summary.textContent = `${visible} / ${items.length} ${lastRender?.labels.projects ?? ''}`;
  }
})();
