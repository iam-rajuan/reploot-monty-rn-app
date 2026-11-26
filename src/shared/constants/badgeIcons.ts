/**
 * 3D badge art: Microsoft Fluent Emoji (MIT) — see assets/badges/LICENSE-fluent-emoji.txt.
 * Keys match the achievement `iconType` values used across the app.
 */
export const BADGE_ICONS = {
  medal: require("../../../assets/badges/medal.png"),
  lightning: require("../../../assets/badges/lightning.png"),
  drop: require("../../../assets/badges/drop.png"),
  flame: require("../../../assets/badges/flame.png"),
  arm: require("../../../assets/badges/arm.png"),
  salad: require("../../../assets/badges/salad.png"),
  ribbon: require("../../../assets/badges/ribbon.png"),
  trophy: require("../../../assets/badges/trophy.png"),
} as const;

export type BadgeIconType = keyof typeof BADGE_ICONS;

/** Falls back to the medal for unknown icon names. */
export const badgeIconFor = (type?: string | null): number =>
  (type && (BADGE_ICONS as Record<string, number>)[type]) || BADGE_ICONS.medal;
