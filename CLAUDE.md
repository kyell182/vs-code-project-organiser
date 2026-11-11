# Project Organizer – VS Code extension

Saves projects, organizes them in virtual groups and colored tags, shows a status color, opens with one click.
Meant for publishing on the Marketplace: all code, UI text and names are in English; UI strings go through `vscode.l10n.t`.

## Architectuur
- `src/extension.ts` – startpunt en composition root: maakt alle onderdelen aan en koppelt ze.
- `storage/` – `OrganizerState` (opgeslagen model), `StateStore`-abstractie, `GlobalStateStore` (VS Code global state + Settings Sync).
- `projects/` – projecten opslaan/openen, status (`StatusResolver`, automatisch of handmatig), statuskleuren. Gebruikt `groups/` en `tags/` via hun pickers.
- `groups/` – virtuele groepen (nooit mappen op schijf). Hangt af van `storage/`.
- `tags/` – tags met kleur, tag- en kleurkiezer. Hangt af van `storage/`.
- `sidebar/` – TreeView: `layouts/` (strategieën per groep/tag/status, pure logica), items, tooltips, kleur-decoraties, drag & drop.
- `switcher/` – snel wisselen (`Ctrl+Alt+P`) en statusbalk.
- `shared/` – foutafhandeling, naamvalidatie, padvergelijking, instellingen, contracten voor boom-doelen.

Domeinlogica (services, `StatusResolver`, layouts) importeert geen `vscode` en wordt met mocha getest.

## Starten, bouwen, testen
- `npm install`
- F5 in VS Code → "Run Extension" (start een Extension Development Host).
- `npm test` – compileert en draait de unit tests.
- `npm run test:integration` – rooktest in een echte VS Code. Zet `VSCODE_EXECUTABLE` op een geïnstalleerde `Code.exe`
  om downloaden te vermijden. VS Code splitst paden op spaties: draai het vanuit een junction zonder spaties.
- `npm run package` – maakt een `.vsix` (vereist eerst een echte `publisher` in `package.json`).
