# Trope and Tell — Book Post Builder

A single-page tool for drafting and publishing Trope and Tell book review posts straight to Ghost.

It uses the Anthropic API to write the review and pick trope tags from an approved list, then publishes (or schedules) the post directly to the Ghost site via the Ghost Admin API.

## Using it

Open the live page (once hosted on GitHub Pages, the URL will look like `https://yourusername.github.io/trope-and-tell-poster/`) and:

1. Open **Settings** and enter:
   - Your Ghost site URL (e.g. `https://trope-and-tell.ghost.io`)
   - Your Ghost Admin API key
   - Your Anthropic API key
2. Fill in the book details, notes, rating, and links.
3. Click **Generate & Publish**.

Your keys are stored only in your own browser's local storage — they are never written into this file and never sent anywhere except directly to Ghost and Anthropic from your browser.

## Local development

No build step. Just serve the folder with any static file server, e.g.:

```
python3 -m http.server 8734
```

Then open `http://localhost:8734/`.
