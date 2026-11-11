# Projects Hub

[![Version](https://img.shields.io/visual-studio-marketplace/v/kyell182.projects-hub?label=Marketplace)](https://marketplace.visualstudio.com/items?itemName=kyell182.projects-hub)
[![Installs](https://img.shields.io/visual-studio-marketplace/i/kyell182.projects-hub)](https://marketplace.visualstudio.com/items?itemName=kyell182.projects-hub)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

**All your projects in one place.** Save them, sort them into groups, label them with colored tags and see at a glance which ones are active. Open any project with one click.

---

## Contents

- [Features](#features)
- [Getting started](#getting-started)
- [How to use it](#how-to-use-it)
- [Commands](#commands)
- [Settings](#settings)
- [FAQ](#faq)
- [Contributing](#contributing)

---

## Features

| | Feature | What it does |
|---|---|---|
| 🖱️ | **One-click open** | Click a project to open it in this window. **Alt+click** on the board or bookcase, or the ⧉ button, opens a new window. `Ctrl+Alt+P` searches all projects. |
| 📁 | **Groups** | Your own colored groups (School, Work, Side projects…). Drag projects into them. |
| 🏷️ | **Colored tags** | Create, rename, recolor and delete tags. Projects can have as many as you like. |
| 🟢 | **Status at a glance** | Active, Paused, Inactive, Archived, or your own statuses with their own color. |
| 🗂️ | **Project board** | A kanban board with a column per status. Drag a card to change its status. |
| 📚 | **Bookcase** | Every project is a book in its own color, on the shelf of its status. Drag books between shelves. |
| ☑️ | **To-dos** | Next steps per project that you tick off, with progress on the card, the book and in the tooltip. |
| 📝 | **Notes** | A full markdown note per project that opens in a normal editor tab. |
| 🎨 | **Any color** | Standard colors that follow your theme, or any color with the built-in color picker. |
| 📌 | **Pinned projects** | Your favorites always on top. |
| 🔄 | **Settings Sync** | Your projects follow you to every machine. |

Your folders on disk are **never moved, renamed or created**. Groups, tags and statuses only exist inside VS Code.

---

## Getting started

1. Install **Projects Hub** from the Extensions view (`Ctrl+Shift+X`).
2. Click the **Projects Hub** icon in the activity bar.
3. Open a folder and click **💾 Save Current Project**, or use **Add Project Folder…** to pick any folder.
4. Right-click the project to give it a group, tags, a status or a note.
5. Click the project any time to open it.

---

## How to use it

### The sidebar

| Button | Action |
|---|---|
| 🗂️ | Open the project board |
| 🔍 | Quick switch (`Ctrl+Alt+P`) |
| 💾 | Save the folder of this window as a project |
| 📁➕ | Create a group |
| ☰ | Show the projects **by group**, **by tag** or **by status** |

Every project row stays short: its **status color** (icon) and its name. The project of the current window is marked with **● open**. **Hover** a project for everything else: path, group and tags as colored chips, note, when you last opened it and quick actions (open, new window, tags, status, note).

### Groups

- **Create:** the 📁➕ button, or *Move to Group… → New group…* on a project.
- **Assign:** drag projects onto a group, or right-click → *Move to Group…*. Drop them on *Ungrouped* to remove the group.
- **Edit:** right-click a group to rename it, change its color or delete it. Deleting a group keeps its projects; they become ungrouped.

### Tags

- **Create:** right-click a project → *Edit Tags…*, type a new name and press `Enter`. You pick a color right away.
- **Edit:** switch the sidebar to **by tag**, then right-click a tag to rename it, change its color or delete it.

### Statuses

| Status | Color | When |
|---|---|---|
| Active | 🟢 green | Opened in the last 30 days (automatic) |
| Inactive | 🔴 red | Not opened for 30 days, or never opened (automatic) |
| Paused | 🟠 orange | Set by you |
| Archived | ⚪ gray | Set by you |
| *Your own* | any color | Made with **Manage Custom Statuses…** |

A status you set yourself always wins. Choose **Automatic** to hand it back to the 30-day rule. The number of days is a [setting](#settings).

### The project board

Open it with 🗂️ or **Projects Hub: Open Project Board**.

- One **column per status**. **Drag a card** to another column to change its status.
- Each card shows its **group and tags** as colored chips, the **note**, the **project type** (TypeScript, .NET, Java, Python…), the **git branch** and when you **last opened** it.
- **Search** by name, group, `#tag` or note.
- **Click** a card or book to open the project in this window, **Alt+click** to open it in a new window.

### To-dos

Right-click a project → **To-dos…**, or use ☑ on a board card or *To-dos* in the tooltip.

- **Tick off** what is done and press `Enter`.
- **Type** a new to-do and press `Enter` to add it; the list stays open for the next one.
- **Edit** or **delete** a to-do with the buttons on its row; the button at the top removes all finished ones.
- Progress shows as a bar on board cards and books (2/5), and the next open to-dos appear on the card and in the tooltips. Tick one off right on the card.

### Notes

Right-click a project → **Open Note**, or use ✎ on a board card. The note opens as a markdown file in a normal editor tab: headings, lists, links, preview and `Ctrl+S` all work. It is stored in Projects Hub (not in your project folder) and follows Settings Sync. Its first line is shown as a summary in the tooltip, on the card and in the quick switcher.

### The bookcase

The project board opens as a bookcase (**📚 Shelf**). Switch to **🗂 Board** for kanban columns; the board remembers your choice while it is open.

- Every **shelf is a status**: Active, Paused, Inactive, Archived and your own statuses.
- Every **book is a project** in its own color. Right-click a book, or right-click the project in the sidebar → *Change Book Color…*, to pick a color. Books without a chosen color get a fixed color of their own.
- **Ribbons** hang out of the top of a book like bookmarks, one per tag in the tag color. With more than three tags they are grouped into one striped ribbon with the number of tags; hover it to see them all. The shelf already tells the status.
- **Hover** a book for its group, tags, note, type, branch and when you last opened it.
- **Drag** a book to another shelf to change its status, or within a shelf to put it in your own order. The order is the same on the board.

### Colors

Every color menu starts with the **standard colors**. They adapt to light and dark themes. Below them you find your **recent colors** and **Custom color…**, which opens a color picker with a hex field and a live preview.

> VS Code only allows theme colors in a few places (the project name in the status bar, tag dots in the sidebar). There a custom color shows as the closest standard color. Icons and the board always use the exact color.

---

## Commands

All commands are in the Command Palette (`Ctrl+Shift+P`) under **Projects Hub**, or in the right-click menus of the sidebar.

| Command | Where |
|---|---|
| Quick Switch Project (`Ctrl+Alt+P`) | Palette, sidebar, status bar |
| Open Project Board | Palette, sidebar |
| Save Current Project · Add Project Folder… | Palette, sidebar |
| Create Group · Create Tag · Manage Custom Statuses… | Palette, sidebar |
| Switch View (Group / Tag / Status) | Sidebar |
| To-dos… · Open Note · Set Status… · Move to Group… · Edit Tags… | Right-click a project |
| Pin / Unpin · Rename · Remove · Open in New Window | Right-click a project |
| Change Book Color… | Right-click a project, or a book on the shelf |
| Rename · Change Color · Delete | Right-click a group or tag |

---

## Settings

| Setting | Default | Description |
|---|---|---|
| `projectsHub.openInNewWindow` | `false` | Open projects in a new window instead of the current one. |
| `projectsHub.inactiveAfterDays` | `30` | Days without opening before a project becomes *Inactive*. |

---

## FAQ

**Does Projects Hub change my folders?**
No. Removing a project, group or tag only removes it from Projects Hub. Nothing on disk is touched.

**Where is my data stored?**
In VS Code's own storage. With Settings Sync turned on, it follows you to your other machines.

**A project shows ⚠ and "folder not found".**
The folder was moved or deleted. Opening it offers to remove it from your list.

**Can I use it next to Project Manager?**
Yes. The two extensions do not share data or commands.

---

## Contributing

Issues and pull requests are welcome on [GitHub](https://github.com/kyell182/vs-code-project-organiser).

```bash
npm install
npm test            # unit tests
```

Press `F5` in VS Code to start the extension in a development window. See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for how the code is organized, with diagrams.

## License

[MIT](LICENSE) © kyell182
