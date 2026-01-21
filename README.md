# ![Page Limiter](docs/banner-1650.png)

A simple Chrome extension for setting time limits on websites. No ads, no data sharing, and no analytics. The only server involved is [Chrome Sync](https://support.google.com/chrome/a/answer/13616205?hl=en) when syncing is enabled.

## Development

This extension is mostly written in Typescript and React.

-   Run dev with `npm run watch`
-   Run a production build with `npm run build`
-   Run a production build and package it in a zip for distribution with `npm run package`
-   Bump the current version with `./scripts/bump-version <patch|minor|major>`
