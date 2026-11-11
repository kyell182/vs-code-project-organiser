// @ts-check
// Color picker page: native color input + hex field + live preview. User text only via textContent.
(function () {
  const vscode = acquireVsCodeApi();
  const HEX = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i;
  const byId = (id) => /** @type {HTMLElement} */ (document.getElementById(id));
  const wheel = /** @type {HTMLInputElement} */ (byId('wheel'));
  const hex = /** @type {HTMLInputElement} */ (byId('hex'));
  const use = /** @type {HTMLButtonElement} */ (byId('use'));
  let labels = {};

  window.addEventListener('message', (event) => {
    if (event.data.type === 'init') init(event.data);
  });
  wheel.addEventListener('input', () => setColor(wheel.value));
  hex.addEventListener('input', onHexTyped);
  use.addEventListener('click', submit);
  byId('cancel').addEventListener('click', () => vscode.postMessage({ type: 'cancel' }));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') submit();
    if (event.key === 'Escape') vscode.postMessage({ type: 'cancel' });
  });
  vscode.postMessage({ type: 'ready' });

  function init(data) {
    labels = data.labels;
    byId('title').textContent = labels.title.replace('{0}', data.subject);
    byId('hex-label').textContent = labels.hex;
    byId('recent-label').textContent = labels.recent;
    byId('preview-label').textContent = labels.preview;
    byId('cancel').textContent = labels.cancel;
    use.textContent = labels.use;
    byId('sample-name').textContent = labels.sampleProject;
    byId('sample-card-name').textContent = labels.sampleProject;
    byId('sample-chip').textContent = `#${data.subject}`;
    byId('sample-card-chip').textContent = `#${data.subject}`;
    renderRecent(data.recent);
    setColor(data.color);
    hex.focus();
    hex.select();
  }

  function renderRecent(colors) {
    byId('recent-block').hidden = colors.length === 0;
    byId('recent').replaceChildren(...colors.map(swatch));
  }

  function swatch(color) {
    const button = document.createElement('button');
    button.className = 'swatch';
    button.style.background = color;
    button.title = color.toUpperCase();
    button.setAttribute('aria-label', color);
    button.addEventListener('click', () => setColor(color));
    return button;
  }

  function normalize(value) {
    const match = HEX.exec(value.trim());
    if (!match) return undefined;
    const digits = match[1].length === 3 ? [...match[1]].map((digit) => digit + digit).join('') : match[1];
    return `#${digits.toLowerCase()}`;
  }

  /** Keeps the wheel, the hex field and the preview in sync. */
  function setColor(value) {
    const color = normalize(value);
    if (!color) return;
    wheel.value = color;
    hex.value = color.toUpperCase();
    showValid(true);
    document.documentElement.style.setProperty('--chosen', color);
  }

  function onHexTyped() {
    const color = normalize(hex.value);
    showValid(Boolean(color));
    if (color) {
      wheel.value = color;
      document.documentElement.style.setProperty('--chosen', color);
    }
  }

  function showValid(isValid) {
    hex.classList.toggle('invalid', !isValid);
    byId('error').textContent = isValid ? '' : labels.invalid;
    use.disabled = !isValid;
  }

  function submit() {
    const color = normalize(hex.value);
    if (color) vscode.postMessage({ type: 'pick', color });
  }
})();
