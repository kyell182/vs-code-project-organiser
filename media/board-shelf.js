// @ts-check
// The bookcase view: one shelf per status, a book per project in its own color with a ribbon per tag.
(function () {
  const hub = window.ProjectsHub;
  const { element, applyColor } = hub;
  const tooltip = /** @type {HTMLElement} */ (document.getElementById('tooltip'));
  const BOOK_HEIGHTS = [140, 148, 156, 164, 172];
  /** Three ribbons are all that fit on the top of a book. */
const MAX_TAG_RIBBONS = 3;

  function renderShelves(render) {
    return render.columns.map((column) => renderShelf(column, render));
  }

  function renderShelf(column, render) {
    const shelf = applyColor(element('section', 'shelf'), column.color);
    const header = element('div', 'shelf-header');
    header.append(element('span', 'dot'), element('span', '', column.label), element('span', 'count', String(column.cards.length)));
    const books = element('div', 'books');
    if (column.cards.length === 0) {
      books.classList.add('is-empty');
      books.append(element('div', 'shelf-empty', render.labels.dropHere));
    }
    books.append(...column.cards.map((card) => renderBook(card, column, render)));
    hub.makeDropZone(books, column.statusId, '.book', 'x');
    shelf.append(header, books, element('div', 'plank'));
    return shelf;
  }

  function renderBook(card, column, render) {
    const book = applyColor(element('div', 'book project'), card.bookColor, '--book');
    book.tabIndex = 0;
    book.setAttribute('role', 'button');
    book.setAttribute('aria-label', card.name);
    book.dataset.id = card.id;
    book.dataset.search = hub.searchText(card);
    book.style.height = `${BOOK_HEIGHTS[stableNumber(card.id) % BOOK_HEIGHTS.length]}px`;
    book.classList.toggle('current', card.isCurrent);
    book.classList.toggle('missing', card.isMissing);
    book.append(renderTagRibbons(card), element('span', 'spine-title', card.name));
    if (card.todos.total > 0) book.append(hub.progressBar(card.todos, 'book-progress'));
    if (card.isPinned) book.append(element('span', 'book-pin', '★'));
    addBookEvents(book, card, column, render);
    hub.makeDraggable(book, card);
    return book;
  }

  /**
   * The shelf already shows the status, so the bookmark ribbons show the tags instead:
   * one ribbon per tag, or a single striped ribbon with the count when there are too many.
   */
  function renderTagRibbons(card) {
    const ribbons = element('div', 'ribbons');
    if (card.tags.length > MAX_TAG_RIBBONS) {
      ribbons.append(groupRibbon(card.tags));
    } else {
      ribbons.append(...card.tags.map((tag) => applyColor(element('span', 'ribbon'), tag.color)));
    }
    return ribbons;
  }

  /** Stripes in the colors of all tags, with the number of tags on top. */
  function groupRibbon(tags) {
    const ribbon = element('span', 'ribbon ribbon-group');
    const width = 100 / tags.length;
    const stripes = tags.map((tag, index) => `${hub.colorValue(tag.color)} ${index * width}% ${(index + 1) * width}%`);
    ribbon.style.setProperty('--stripes', `linear-gradient(to right, ${stripes.join(', ')})`);
    ribbon.append(element('span', 'ribbon-count', String(tags.length)));
    return ribbon;
  }

  function tagChips(tags) {
    const chips = element('div', 'chips');
    chips.append(...tags.map((tag) => applyColor(element('span', 'chip', `#${tag.name}`), tag.color)));
    return chips;
  }

  function addBookEvents(book, card, column, render) {
    book.addEventListener('click', (event) => hub.open(card, hub.wantsNewWindow(event)));
    book.addEventListener('keydown', (event) => event.key === 'Enter' && hub.open(card, hub.wantsNewWindow(event)));
    book.addEventListener('contextmenu', (event) => {
      event.preventDefault();
      hub.vscode.postMessage({ type: 'setBookColor', projectId: card.id });
    });
    book.addEventListener('mouseenter', () => showTooltip(book, card, column, render));
    book.addEventListener('focus', () => showTooltip(book, card, column, render));
    book.addEventListener('mouseleave', hideTooltip);
    book.addEventListener('blur', hideTooltip);
    book.addEventListener('dragstart', hideTooltip);
    const group = book.querySelector('.ribbon-group');
    if (!group) return;
    group.addEventListener('mouseenter', () => showGroupedTags(group, card.tags, render));
    group.addEventListener('mouseleave', () => showTooltip(book, card, column, render));
  }

  function showGroupedTags(ribbon, tags, render) {
    tooltip.replaceChildren(element('strong', 'tip-title', render.labels.allTags.replace('{0}', String(tags.length))), tagChips(tags));
    placeTooltip(ribbon);
  }

  function showTooltip(book, card, column, render) {
    const status = applyColor(element('div', 'tip-status'), column.color);
    status.append(element('span', 'dot'), element('span', '', column.label));
    const rows = [
      tipRow(render.labels.group, card.group?.name),
      tipRow(render.labels.tags, card.tags.length > 0 ? tagChips(card.tags) : undefined),
      tipRow(render.labels.todos, todoSummary(card.todos)),
      tipRow(render.labels.type, card.projectType),
      tipRow(render.labels.branch, card.branch),
      tipRow(render.labels.lastOpened, hub.relativeTime(card.lastOpened, render)),
    ].filter(Boolean);
    const note = card.note ? [element('div', 'tip-note', `✎ ${card.note}`)] : [];
    const missing = card.isMissing ? [element('div', 'warning', `⚠ ${render.labels.missing}`)] : [];
    tooltip.replaceChildren(element('strong', 'tip-title', card.name), status, ...rows, ...note, ...missing, element('div', 'tip-hint', render.labels.bookHint));
    placeTooltip(book);
  }

  /** "2/5" with the next open to-dos underneath. */
  function todoSummary(todos) {
    if (todos.total === 0) return undefined;
    const block = element('div', 'tip-todos');
    block.append(element('span', '', `${todos.done}/${todos.total}`), ...todos.next.map((todo) => element('span', 'tip-todo', `☐ ${todo.text}`)));
    return block;
  }

  /** `value` is text or a ready-made element such as the tag chips. */
  function tipRow(label, value) {
    if (!value) return undefined;
    const row = element('div', 'tip-row');
    row.append(element('span', 'tip-label', label), typeof value === 'string' ? element('span', '', value) : value);
    return row;
  }

  /** Above the book when there is room, otherwise below it; never outside the window. */
  function placeTooltip(book) {
    tooltip.hidden = false;
    const box = book.getBoundingClientRect();
    const tip = tooltip.getBoundingClientRect();
    const left = Math.min(Math.max(8, box.left + box.width / 2 - tip.width / 2), window.innerWidth - tip.width - 8);
    const top = box.top - tip.height - 10 > 8 ? box.top - tip.height - 10 : box.bottom + 10;
    tooltip.style.left = `${left}px`;
    tooltip.style.top = `${top}px`;
  }

  function hideTooltip() {
    tooltip.hidden = true;
  }

  /** Gives every book its own height, the same each time. */
  function stableNumber(text) {
    let value = 0;
    for (const character of text) value = (value * 31 + character.charCodeAt(0)) >>> 0;
    return value;
  }

  hub.renderShelves = renderShelves;
  hub.hideTooltip = hideTooltip;
})();
