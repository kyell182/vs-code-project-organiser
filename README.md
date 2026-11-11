# Projects Hub

Save your projects, organize them in groups, label them with colored tags and see at a glance which ones are active. Open any project with one click.

## Features

- **One-click open** – click a project in the sidebar, or press `Ctrl+Alt+P` to search all projects.
- **Project board** – a kanban board with a column per status. Drag cards between columns to change the status. Each card shows its group, colored tags, note, project type (TypeScript, .NET, Java, Python...), git branch and when you last opened it.
- **Groups** – create your own colored groups (School, Work, Side projects...) and drag projects into them. Groups only exist inside VS Code; your folders on disk are never moved or created.
- **Colored tags** – create, rename, recolor and delete tags. Type a new name in the tag picker to create one on the spot.
- **Status colors** – every project shows its status in color:
  - 🟢 Active · 🟠 Paused · 🔴 Inactive · ⚪ Archived
  - The status is automatic (not opened for 30 days = inactive), or set it yourself.
  - Add your own statuses with their own color, such as "Waiting for feedback".
- **Notes** – give every project a short note or next step, shown in the sidebar, tooltip and board.
- **Your own colors** – pick one of the standard colors (they adapt to light and dark themes) or choose any color with the built-in color picker. Recently used colors are remembered.
- **Three views** – organize the sidebar by group, by tag or by status.
- **Pinned projects** always on top, and the project of the current window highlighted.
- **Rich tooltips** with path, group, tags and when you last opened it.
- **Missing folders** are flagged instead of failing silently.
- **Settings Sync** – your projects follow you to every machine.

## Settings

| Setting | Default | Description |
|---|---|---|
| `projectsHub.openInNewWindow` | `false` | Open projects in a new window. |
| `projectsHub.inactiveAfterDays` | `30` | Days without opening before a project becomes inactive. |
