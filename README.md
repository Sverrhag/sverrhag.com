# sverrhag.com

Plain HTML/CSS/JS site for Sverrhag Consulting, deployed to GitHub Pages.

## Structure

```
index.html              Homepage
assets/css/style.css     All styles
assets/js/main.js        Renders the projects grid, sets footer year
assets/img/              Images (favicon, hero photo, headshot)
projects/projects.js     Project list shown on the homepage
projects/<slug>/         Each individual project lives in its own folder
CNAME                    Custom domain for GitHub Pages
```

## Adding a new project

1. Create a folder under `projects/`, e.g. `projects/my-tool/`, with its own
   `index.html` (and any assets it needs).
2. Add an entry to `projects/projects.js`:

   ```js
   {
     title: "My Tool",
     description: "One sentence describing what it does.",
     url: "projects/my-tool/",
     tags: ["JS", "demo"],
   }
   ```

The homepage picks up the list automatically — no other changes needed.

## Local preview

No build step. Serve the folder with any static server, e.g.:

```
python3 -m http.server 8000
```

## Deployment

Pushing to `main` triggers `.github/workflows/deploy.yml`, which publishes the
site to GitHub Pages. In the repo's Settings → Pages, set the source to
"GitHub Actions".

The `CNAME` file points the site at `sverrhag.com`. To finish going live,
update your DNS (currently pointed at one.com) so that:

- an `A` record (or `ALIAS`/`ANAME`) for `sverrhag.com` points at GitHub
  Pages' IPs, and
- `www` (if used) is a `CNAME` to `<your-github-username>.github.io`

See GitHub's "Managing a custom domain for your GitHub Pages site" docs for
the current IP addresses and record details.
