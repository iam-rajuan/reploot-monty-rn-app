# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v57.0.0/ before writing any code.

# Typography policy (permanent)

Reploot uses only Montserrat for primary page titles and Inter for all other user-visible text. No additional text font families may be introduced in current or future features.

- Import `Text` / `TextInput` from `@/shared/components/typography`, never from `react-native`.
- Style text with the semantic roles in `src/theme/typography.ts` (`<AppText variant="…">` or `...typography.role`). Never write a raw `fontFamily`.
- `typography.pageTitle` (or `pageTitleHero` / `pageTitleCompact`) is only for the one title that identifies a screen. Section and card headings use Inter roles.
- Use only loaded weights (Inter 400–800, Montserrat 800) and sizes from the type scale. Do not use italics.
- If a design needs a new kind of text, add a role to `typography.ts`. Never add a font.
- Run `npm run lint:typography` and `npm run typecheck` before finishing.
