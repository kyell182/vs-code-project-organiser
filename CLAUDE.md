# Projects Hub – VS Code extension

Saves projects, organizes them in virtual groups and colored tags, shows a status color, opens with one click.
Meant for publishing on the Marketplace: all code, UI text and names are in English; UI strings go through `vscode.l10n.t`.

## Architectuur
- `src/extension.ts` – startpunt en composition root: maakt alle onderdelen aan en koppelt ze.
- `storage/` – `OrganizerState` (opgeslagen model), `StateStore`-abstractie, `GlobalStateStore` (VS Code global state + Settings Sync).
- `projects/` – projecten opslaan/openen, notities, status/groep/tags toewijzen. Gebruikt `statuses/`, `groups/` en `tags/`.
- `statuses/` – ingebouwde en eigen statussen (`StatusCatalog`), `StatusResolver` (automatisch of handmatig), statuskiezer en -beheer.
- `groups/` – virtuele groepen met kleur (nooit mappen op schijf). Hangt af van `storage/`.
- `tags/` – tags met kleur en de tagkiezer. Hangt af van `storage/`.
- `sidebar/` – TreeView: `layouts/` (strategieën per groep/tag/status, pure logica), items, tooltips, kleur-decoraties, drag & drop.
- `board/` – projectbord (webview): `BoardModel` (pure logica), map-inspectie (projecttype, git-branch), paneel. Pagina in `media/board.js` + `board.css`.
- `switcher/` – snel wisselen (`Ctrl+Alt+P`) en statusbalk.
- `colors/` – kleurmodel (`Color` = themakleur uit het palet óf hexcode, met tests), weergave (themakleur of gegenereerd SVG-icoon),
  `ColorPicker` (keuzelijst) en `CustomColorPanel` (webview-kleurkiezer, pagina in `media/color-picker.*`), recente kleuren.
  Labels en statusbalk aanvaarden enkel themakleuren: een hexkleur valt daar terug op de dichtstbijzijnde paletkleur.
- `shared/` – foutafhandeling, naamvalidatie, padvergelijking, instellingen, contracten voor boom-doelen.

Domeinlogica (services, `StatusCatalog`, `StatusResolver`, layouts, `BoardModel`) importeert geen `vscode` en wordt met mocha getest.
Repo: https://github.com/kyell182/vs-code-project-organiser

## Starten, bouwen, testen
- `npm install`
- F5 in VS Code → "Run Extension" (start een Extension Development Host).
- `npm test` – compileert en draait de unit tests.
- `npm run test:integration` – rooktest in een echte VS Code. Zet `VSCODE_EXECUTABLE` op een geïnstalleerde `Code.exe`
  om downloaden te vermijden. VS Code splitst paden op spaties: draai het vanuit een junction zonder spaties.
- `npm run package` – maakt een `.vsix` (vereist eerst een echte `publisher` in `package.json`).
