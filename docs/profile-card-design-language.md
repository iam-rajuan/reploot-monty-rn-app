# Reploot Profile-Card Design Language

## 1. Purpose and status

This document is the long-term design reference for selected Reploot card and widget redesigns. It is based on the first card on the Profile tab: the athlete card containing identity, tier, streak, level, global rank, badges, workout XP, achievements, and the Edit Profile action.

The client specifically values this card's dark blue surface, restrained cyan/violet gradients, layered widgets, visual depth, and premium information presentation. Future work explicitly requested “using the profile-card style” must preserve that visual identity while adapting the layout intelligently to the target content.

This is **not** an application-wide restyling mandate. It applies only when a page, section, card, or widget is explicitly selected for redesign. Existing UI outside that scope must remain unchanged. In particular, the first two cards on the main Progress page are approved and must not be changed unless explicitly requested later.

## 2. Reference implementation

Primary reference:

- `src/features/profile/components/TopProfileCard.tsx` — authoritative card structure and local style values.
- `app/(tabs)/profile.tsx` — placement, page background, horizontal gutters, and compact breakpoint context.
- `src/shared/components/ui/ProgressBar.tsx` — XP track and fill behavior.
- `src/theme/gradients.ts` — shared XP and action gradient definitions.
- `src/theme/colors.ts` — broader semantic palette for compatible accents.
- `src/theme/radius.ts`, `src/theme/spacing.ts`, and `src/theme/shadows.ts` — shared design tokens.
- `src/theme/typography.ts` and `src/shared/components/typography/` — mandatory application typography system.

The literal values in `TopProfileCard.tsx` are the source of truth for this reference language. Shared theme tokens are supporting context; similarly named tokens must not silently replace a reference value when their colors differ.

## 3. Design principles

The intended character is:

- premium, athletic, technical, and modern;
- dark and immersive without losing content separation;
- luminous through controlled accents rather than large areas of saturated color;
- information-dense but calm, scannable, and touch-friendly;
- clearly layered through surface color, translucent fills, borders, and limited glow;
- responsive and production-ready, not a static mockup.

The card succeeds because it combines one strong visual system with several distinct information zones. It does not make every element glow, use a different gradient, or compete for primary emphasis.

## 4. Mandatory visual DNA

The following requirements are consistent whenever this reference is explicitly applied. Layout is flexible; this visual identity is not.

### 4.1 Main surface

| Property | Reference value | Requirement |
|---|---:|---|
| Base background | `#111A25` | Primary selected-card surface |
| Overlay type | `expo-linear-gradient` | Use a real gradient layer, absolutely filling and clipped by the card |
| Gradient colors | `rgba(56,189,248,0.12)` → `rgba(139,92,246,0.07)` → `rgba(255,255,255,0.02)` | Preserve this restrained sky/violet/white wash |
| Direction | `start={{ x: 0, y: 0 }}` → `end={{ x: 1, y: 1 }}` | Diagonal, top-left to bottom-right |
| Stops | Not explicitly supplied | Expo distributes the three colors evenly: approximately `0`, `0.5`, `1` |
| Border | `1 px solid rgba(56,189,248,0.18)` | Quiet cyan edge; do not turn it into a bright outline |
| Radius | `24 px` standard; `20 px` compact | The surface must feel generous and soft |
| Clipping | `overflow: "hidden"` | Required so gradient and descendants respect the silhouette |
| Padding | `20 px` standard; `14 px` compact | Preserve equivalent density when adapting |
| Following separation | `20 px` bottom margin | May be expressed by parent gap in new implementations |

The page behind the reference uses `#090A10`. The card's `#111A25` base is therefore visibly elevated without relying on a heavy drop shadow.

### 4.2 Color roles

Use colors by role rather than distributing accents randomly:

| Role | Value |
|---|---:|
| Primary content | `#FFFFFF` |
| Secondary/caption content | `#94A3B8` |
| Sky action/accent | `#38BDF8` |
| Soft violet accent | `#C5C0FF` |
| Warm streak/accent | `#FFB68C` |
| Cyan glow/accent | `#22D3EE` |
| Hairline divider | `rgba(255,255,255,0.08)` |
| Stronger divider | `rgba(255,255,255,0.10)` |

White is for identity, primary values, and strong headings. Slate is for supporting labels. Sky blue communicates progress and action. Violet identifies achievement/collection content. Warm peach highlights streaks. Use one contextual accent per cluster wherever possible.

### 4.3 Nested widgets and chips

The main card contains translucent, tinted micro-surfaces rather than additional opaque cards:

- Dynamic tier chip: tier color at `0x18` alpha for the fill and `0x45` alpha for the border. Its text and icon use the solid tier color.
- Streak chip: `rgba(255,182,140,0.12)` fill and `rgba(255,182,140,0.24)` border.
- Achievement badge: `rgba(197,192,255,0.12)` fill and `rgba(197,192,255,0.24)` border.
- Additional-count badge: `rgba(56,189,248,0.12)` fill and `rgba(56,189,248,0.24)` border.
- Avatar frame: `#0D141E` fill with `rgba(34,211,238,0.55)` border.

These pairs establish a reusable rule: contextual micro-surfaces generally use about 12–14% accent opacity with a 24–27% border. They should remain subordinate to content and must not become solid neon blocks.

Pill chips use a fully rounded radius (`99` in the reference), a minimum height of `25 px`, and compact to `21 px`. Circular badges are `38 × 38 px` with a `19 px` radius, compacting to `34 × 34 px` with a `17 px` radius.

### 4.4 Borders, shadows, and depth

Depth comes primarily from nested surfaces and transparent borders. Avoid adding a generic strong shadow to the entire card.

The avatar is the deliberate exception:

- shadow color: `#22D3EE`;
- shadow opacity: `0.16`;
- shadow radius: `10`;
- Android elevation: `3`;
- shadow offset is not specified, so it remains a centered glow.

New glows must be rare, low-opacity, and tied to a meaningful focal element. Do not put cyan, violet, and warm glows on every child simultaneously.

### 4.5 Dividers

The stat band uses top and bottom `1 px` dividers at `rgba(255,255,255,0.08)`. Vertical separators are `1 × 30 px` at `rgba(255,255,255,0.10)`. Dividers organize content without creating visible boxes around every metric.

### 4.6 Progress treatment

The workout XP bar uses:

- height: `8 px` in the card;
- track: `rgba(255,255,255,0.08)`;
- fully rounded track and fill (`height / 2` radius);
- horizontal fill gradient: `#6366F1` → `#38BDF8` → `#22D3EE`;
- direction: `{ x: 0, y: 0.5 }` to `{ x: 1, y: 0.5 }`;
- clipped fill whose width is the clamped progress percentage.

Progress indicators in selected redesigns should retain this visual family unless the target has an established semantic color that must be preserved.

### 4.7 Primary action

The Edit Profile action is a full-width, `52 px` high control with a `16 px` radius and clipped horizontal gradient:

- colors: `#0284C7` → `#0EA5E9` → `#38BDF8`;
- direction: `{ x: 0, y: 0.5 }` to `{ x: 1, y: 0.5 }`;
- centered text/icon group with a `6 px` gap;
- white label and icon.

Use this treatment only for the card's primary action. Secondary and tertiary actions must be quieter so action priority remains obvious.

## 5. Reference composition analysis

The current composition is useful evidence, not a mandatory template:

1. **Identity row:** large avatar, flexible identity block, name, profile status, and compact metadata chips.
2. **Stat band:** three equally weighted metrics separated by hairlines.
3. **Progress cluster:** contextual label/icon, right-aligned value, then a full-width progress bar.
4. **Achievement cluster:** title/count, badge preview, empty-state fallback, and a text-level navigation action.
5. **Primary CTA:** clear full-width terminal action.

This sequence moves from identity → summary → progress → collection → action. It creates a natural reading order and progressively lower visual priority. Future layouts should establish an equally clear story, but may use a different arrangement when the target content requires it.

### 5.1 Reference spacing and proportions

- Identity avatar: `78 × 78 px`, `24 px` radius, `16 px` right gap.
- Compact avatar: `62 × 62 px`, `19 px` radius, `10 px` right gap.
- Identity-to-stat separation: `24 px`; compact `18 px`.
- Stat band vertical padding: `14 px`; compact `11 px`.
- XP section top spacing: `20 px`; shared compact section spacing `17 px`.
- Achievement section top spacing: `22 px`; compact `17 px`.
- Badge row gap: `9 px`; compact `6 px`.
- Badge row top spacing: `13 px`; compact `11 px`.
- Header micro-gaps: typically `5–8 px`.
- Primary CTA top spacing: `8 px`.

These values communicate the reference density. New compositions may change individual measurements, but should remain on the project's 4 px-oriented spacing rhythm and retain comparable breathing room.

## 6. Typography requirements

All redesign work must obey the Reploot typography system, even where the reference card currently contains local legacy font-size declarations.

- Montserrat is reserved for primary page/screen titles.
- Inter is required for all card titles, labels, metrics, body content, chips, buttons, inputs, and supporting text.
- Use semantic roles from `src/theme/typography.ts`; do not introduce another font or arbitrary font family.
- Favor high contrast, compact uppercase labels and strong numeric hierarchy without making every line bold.
- Preserve tabular numerals for changing metrics where supplied by the typography role.
- Allow meaningful content to wrap; use truncation only where the design has a defined fallback or drill-in path.

Recommended role mapping for a redesign:

| Content | Semantic role |
|---|---|
| Card heading | `cardTitle` or `sectionTitle`, according to hierarchy |
| Supporting sentence | `body`, `bodySmall`, or `subtitle` |
| Stat label | `overline` |
| Chip/status text | `badge` |
| Dominant value | `metricLarge` |
| Standard stat | `metric` |
| Unit | `metricUnit` |
| Primary action | `button` or `buttonLarge` |
| Text-level action | `buttonSmall` |

## 7. Creative layout freedom

The following may be redesigned freely when doing so better serves the selected component:

- grouping, order, and orientation of information;
- grid, row, stacked, asymmetric, or progressive-disclosure layouts;
- icon placement and metric emphasis;
- use of dividers versus negative space;
- placement of primary and secondary actions;
- use of a hero value, visualization, progress element, or contextual illustration;
- responsive reflow at compact widths;
- card height, provided it is content-driven and proportionate.

Creative freedom does **not** mean decorative randomness. Every layout must explain the target's purpose at a glance, make its most important content dominant, keep related data together, and make actions predictable.

Avoid copying the exact identity/stat/achievement structure onto unrelated content. A nutrition summary, workout schedule, achievement panel, and account widget should each have a composition suited to its task while sharing the documented surface and color identity.

## 8. Responsive, accessible, and interaction standards

The reference changes density at `width <= 430`. Future selected components must be checked at compact and regular phone widths rather than relying on a single screenshot.

Required behavior:

- prevent horizontal overflow and clipped text;
- preserve a logical reading order after reflow;
- keep primary tap targets at least approximately `44 × 44 px` where practical;
- provide accessibility roles and meaningful labels for icon-only and ambiguous controls;
- maintain text/background contrast; slate labels must remain legible at their rendered size;
- do not communicate state using color alone—pair color with text, icon, position, or shape;
- support dynamic content, zero/empty states, large values, localization growth, and loading states;
- retain existing haptics, navigation, analytics, state, and accessibility behavior;
- use restrained press feedback without causing layout shift;
- validate Android, iOS, and web behavior for gradient, shadow, font, and clipping differences.

## 9. Selective implementation rules

1. Modify only the component or section explicitly named by the requester.
2. Do not propagate this design language to neighboring cards merely for consistency.
3. Do not alter approved areas, including the first two Progress-page cards, without explicit instruction.
4. Preserve all existing content, data sources, actions, routes, state behavior, loading/error/empty states, and analytics unless the request explicitly changes them.
5. Do not perform an application-wide token migration as part of a local redesign.
6. Reuse existing shared components and tokens when their rendered values match the required reference; otherwise preserve the reference values locally or introduce narrowly scoped reusable tokens only when the selected work genuinely benefits.
7. Do not change unrelated files or “clean up” adjacent UI.
8. Before writing Expo-related implementation code, follow the repository instruction to consult the exact Expo SDK 57 documentation at `https://docs.expo.dev/versions/v57.0.0/`.

## 10. Redesign workflow

For every future selected redesign:

1. **Confirm scope.** Identify the exact route, component, and states included. List nearby components that must remain untouched.
2. **Inspect the target.** Read its implementation, styles, child components, data dependencies, navigation, interaction, and responsive behavior.
3. **Inspect the reference.** Re-read `TopProfileCard.tsx` and this document; do not work from memory or a screenshot alone.
4. **Inventory content.** Classify primary information, supporting information, metrics, statuses, actions, and exceptional states.
5. **Set hierarchy.** Decide what must be understood first, what supports it, and what can be progressively disclosed.
6. **Explore composition.** Consider at least two plausible arrangements mentally or in a small plan, then choose the one that best fits the content—not the one that most literally copies the profile card.
7. **Apply visual DNA.** Use the documented main surface, diagonal wash, border, depth, contextual micro-surfaces, and disciplined accent roles.
8. **Apply semantic typography.** Map every text element to an existing typography role and preserve the two-font policy.
9. **Implement narrowly.** Keep behavior intact and minimize the changed file set.
10. **Validate states.** Test regular/compact widths, long text, large values, zero/empty/loading/error states, touch behavior, and accessibility labels.
11. **Compare visually.** Confirm that the result belongs to the same family as the reference without being a clone.
12. **Run project checks.** Run TypeScript and relevant lint/test commands, then inspect the final diff for unrelated changes.

## 11. Quality gate

A redesign is complete only when all applicable statements are true:

### Visual identity

- The selected component uses the reference `#111A25` surface and documented diagonal gradient treatment.
- Border opacity, nested tint opacity, radii, and accent use feel consistent with the reference.
- Depth is created with layers and restrained effects; glow is not overused.
- The component remains recognizable as part of Reploot's premium dark UI.

### Composition

- The most important content is immediately identifiable.
- Related items are grouped and alignment is intentional.
- Spacing follows a coherent rhythm and the layout is not needlessly repetitive.
- The composition is tailored to the target's content rather than copied mechanically.
- Primary and secondary actions have unmistakable priority.

### Usability and resilience

- Existing behavior and important information are preserved.
- Compact phones, regular phones, content extremes, and non-happy states remain usable.
- Text is readable, does not unexpectedly clip, and follows the two-font semantic system.
- Interactive controls have appropriate touch targets, feedback, roles, and labels.
- No unrelated page or component changed.
- TypeScript and relevant project validation pass.

## 12. Reusable implementation prompt

Copy or reference the following prompt whenever a selected component should adopt this design language:

> Act as a senior mobile product designer and React Native/Expo engineer with 20 years of production UI/UX experience. Redesign only the component, card, widget, or section I explicitly identify.
>
> Before changing code, read `docs/profile-card-design-language.md`, inspect `src/features/profile/components/TopProfileCard.tsx`, and inspect the target component's full implementation, states, behavior, children, and surrounding layout. Follow the repository's Expo SDK 57 documentation requirement before writing Expo-related code.
>
> Treat the reference profile card's visual identity as mandatory: preserve its deep `#111A25` main surface; restrained sky-blue/violet/white diagonal overlay; quiet cyan border; layered translucent accent widgets; soft radii; subtle depth; disciplined white, slate, sky, violet, and warm accent roles; and premium dark athletic character. Use the exact documented values and techniques unless the target has a functional semantic state that requires a narrowly justified variation.
>
> Treat the profile card's layout as inspiration, not a template. Analyze the target's purpose and independently create the strongest content hierarchy and composition for it. You may reorganize information, change grouping, introduce an appropriate grid or asymmetric layout, reposition icons and actions, or use progressive disclosure when this improves clarity. Do not copy the identity/stat/achievement arrangement onto unrelated content. The result must feel intentionally designed, visually impressive, cohesive, and production-ready.
>
> Follow Reploot's typography policy: Montserrat only for the primary page title and Inter for every other user-visible text element. Use semantic roles from `src/theme/typography.ts`; do not introduce a third font or arbitrary typography.
>
> Preserve all existing content, data, routes, interactions, state behavior, loading/error/empty states, haptics, analytics, and accessibility unless I explicitly request otherwise. Maintain responsive behavior, handle compact phone widths and content extremes, provide adequate touch targets and accessibility labels, and avoid clipping or overflow.
>
> Do not modify neighboring components, approved areas, or unrelated files. In particular, do not change the first two cards on the main Progress page unless I explicitly name them.
>
> After implementation, visually inspect the selected result at regular and compact mobile widths, validate meaningful content states, run TypeScript and relevant project checks, and review the diff. Report the design rationale, exact files changed, validation performed, and any narrowly justified deviation from the guideline.

## 13. Interpretation rule for short future requests

Within this project's context, a request such as “update this card,” “redesign this widget,” “improve this section using our guidelines,” or “apply the profile-card design style” means:

- consult this document and the live reference implementation;
- change only the explicitly identified target;
- preserve the documented background, gradient, surface, border, and accent identity;
- exercise senior-level creative freedom in layout and information architecture;
- preserve functionality and important content;
- validate the result against the quality gate above.

If the target is ambiguous, identify it from the active file, supplied screenshot, or route context. Ask one concise question only when the ambiguity could cause the wrong component to be modified.
