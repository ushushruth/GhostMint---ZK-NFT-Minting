# CLI Usage Examples

This file shows how to format terminal and CLI commands properly in a README using Markdown.
Everything below uses fenced code blocks so it renders like a terminal on GitHub.

---

## Basic Commands

```bash
git clone https://github.com/username/project.git
cd project
npm install
npm run dev
```

---

## Commands With Prompt Style

```bash
$ git status
$ anchor build
$ anchor deploy
```

---

## Showing Command Output

```bash
$ npm run dev
> next dev
> ready - started server on 0.0.0.0:3000
```

---

## Single Inline Command

Use `npm install` before running the application.

---

## Multi-Step Setup Example

```bash
git clone https://github.com/username/project.git
cd project
anchor build
anchor deploy
sh generate_all_proofs.sh
cd frontend
npm install
npm run dev
```

---

## Notes

- Do not add explanations inside code blocks
- Keep commands copy-paste friendly
- Use bash/sh language tags for best rendering
