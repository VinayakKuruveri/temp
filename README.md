```markdown
# Tarkasangraha — Static viewer

This is a simple static website to view the contents of the file:

https://github.com/ashtadhyayi-com/data/blob/c763a0d917ac16cbd85ba1caa938de642ec73071/tarkasangraha/data.txt

What I created
- index.html — main UI
- css/styles.css — styling
- js/app.js — loads the raw JSON-like text from the repository at the pinned commit and renders entries, with search and category filters.

How it works
- The app fetches the raw file from:
  https://raw.githubusercontent.com/ashtadhyayi-com/data/c763a0d917ac16cbd85ba1caa938de642ec73071/tarkasangraha/data.txt
- It parses the file as JSON and displays each entry (id, category, topic, text, teeka).
- You can search (topic/text/teeka), filter by category, and show only entries that have a टीका.

To run locally
- Place the files on any static web server (or open `index.html` directly in a browser). The app fetches the raw GitHub URL, so an internet connection is required.
- If you want to bundle the data with the site (no external fetch), download the `tarkasangraha/data.txt` file into a `data/` folder and modify `RAW_URL` in `js/app.js` to point to the local file (e.g. `data/data.txt`).

Notes & next steps
- This is a minimal viewer. Possible improvements:
  - Add pagination or lazy loading for large files.
  - Better category parsing to show hierarchies (e.g. split by `>`).
  - Add copy/share buttons and permalink support for entries.
  - Add client-side rendering of Devanagari fonts or font selection.
```