# tolkium.net

Personal portfolio of Marek Šípoš – live at [tolkium.net](https://tolkium.net).

Built with Angular 20 (standalone components, signals), NgRx, Tailwind CSS and SCSS.

## Development

```bash
npm ci
npm start          # dev server on http://localhost:4200
npm run build      # production build -> dist/
npm run lint
npm test
```

## Project structure

```
src/app/
  core/       services (search, animation, physics) and NgRx UI store
  features/   routed pages (about-me, projects, gallery, snippet-vault, ...)
  layout/     side menu, search, dark-mode toggle
  models/     shared TypeScript types
src/assets/   images and logos
```

The experience timeline on the About page is generated from `EXPERIENCES` in
`src/app/features/about-me/about-me.data.ts`; its colors are CSS custom properties
(`--tl-*`) at the top of the timeline section in `about-me.component.scss`.

## Deployment

Every push to `main` is built and published to GitHub Pages by
`.github/workflows/deploy.yml`. The custom domain is set in `src/CNAME`.
