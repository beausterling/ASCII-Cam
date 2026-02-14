Deploy the current project to Netlify.

## Steps

1. Check if the project is linked to a Netlify site:

   ```bash
   cat .netlify/state.json 2>/dev/null
   ```

2. If NOT linked, run `netlify init` to create and link a new site:
   - Use manual deploy (no build command needed — this is a static site)
   - Publish directory: `.` (root — index.html is at project root)

3. Deploy to Netlify with a production deploy:

   ```bash
   netlify deploy --prod --dir .
   ```

4. Report the live URL back to the user.

## Notes

- This is a static site (no build step). The publish directory is the project root (`.`).
- Always use `--prod` for production deploys. If the user wants a preview/draft deploy, they can pass `--draft` as an argument.
- The site serves over HTTPS automatically, which is required for webcam access (getUserMedia).
