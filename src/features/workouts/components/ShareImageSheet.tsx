import * as Haptics from "expo-haptics";
import { X } from "lucide-react-native";
import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Platform,
  Share,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
// Type-only: erased at build time, so the native module still loads lazily.
import type { Social as RNSocial } from "react-native-share";
import { Text } from "@/shared/components/typography";
import { typography } from "@/theme/typography";
import { loadShareModules } from "../utils/shareNative";
import { SHARE_TARGET_LABELS, ShareTarget, ShareTargetIcon } from "./ShareTargetIcon";
import {
  SHARE_CARD_HEIGHT,
  SHARE_CARD_THEMES,
  SHARE_CARD_WIDTH,
  ShareCardTheme,
} from "./WorkoutShareCard";

const ACCENT_SOFT = "#7DD3FC";

const SHARE_TARGETS: ShareTarget[] = ["instagram", "whatsapp", "messenger", "facebook", "more"];

/** Android package names, used to check the app is installed first. */
const ANDROID_PACKAGES: Partial<Record<ShareTarget, string>> = {
  instagram: "com.instagram.android",
  whatsapp: "com.whatsapp",
  messenger: "com.facebook.orca",
  facebook: "com.facebook.katana",
};

const isCancel = (error: unknown) =>
  /cancel|did not share|dismiss/i.test(String((error as Error)?.message ?? error));

export interface ShareImageSheetProps {
  visible: boolean;
  onClose: () => void;
  /** Sheet heading, e.g. "Your workout card". */
  title: string;
  /** Caption for chat apps and the text fallback. */
  shareText: string;
  /** File name for the exported PNG (no extension). */
  filename: string;
  /** Renders the 320×400 card; attach `ref` to its root view. */
  renderCard: (ref: React.RefObject<View | null>, theme: ShareCardTheme) => React.ReactNode;
}

/**
 * Bottom sheet that previews a designed 4:5 card, lets the user pick a theme
 * and shares it as a 1080×1350 PNG to Instagram, WhatsApp, Messenger,
 * Facebook or the system share sheet.
 */
export function ShareImageSheet({
  visible,
  onClose,
  title,
  shareText,
  filename,
  renderCard,
}: ShareImageSheetProps) {
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();
  const cardRef = useRef<View>(null);
  const [theme, setTheme] = useState<ShareCardTheme>("midnight");
  const [busyTarget, setBusyTarget] = useState<ShareTarget | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const previewScale = Math.min(1, (windowWidth - 48) / SHARE_CARD_WIDTH);

  const close = () => {
    setNotice(null);
    onClose();
  };

  const shareTo = async (target: ShareTarget) => {
    if (busyTarget) return;
    setBusyTarget(target);
    setNotice(null);
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }

    try {
      if (Platform.OS === "web" || !cardRef.current) {
        await Share.share({ message: shareText });
        return;
      }

      // Only loads libraries whose native code is in this build; an older
      // build shares text instead of showing red errors.
      const { captureRef, Sharing, RNShare } = loadShareModules();
      if (!captureRef) {
        setNotice("Image sharing turns on after the next app build — shared as text.");
        await Share.share({ message: shareText });
        return;
      }

      const captured = await captureRef(cardRef, {
        format: "png",
        quality: 1,
        width: 1080,
        height: 1350,
        result: "tmpfile",
      });
      const fileUri = captured.startsWith("file://") ? captured : `file://${captured}`;

      const openSystemSheet = async () => {
        if (Sharing && (await Sharing.isAvailableAsync())) {
          await Sharing.shareAsync(fileUri, {
            mimeType: "image/png",
            dialogTitle: title,
            UTI: "public.png",
          });
        } else if (RNShare) {
          await RNShare.default.open({ url: fileUri, type: "image/png", message: shareText });
        } else {
          await Share.share({ url: fileUri, message: shareText });
        }
      };

      if (target === "more" || !RNShare) {
        await openSystemSheet();
        return;
      }

      const pkg = ANDROID_PACKAGES[target];
      if (Platform.OS === "android" && pkg) {
        const { isInstalled } = await RNShare.default.isPackageInstalled(pkg);
        if (!isInstalled) {
          setNotice(`${SHARE_TARGET_LABELS[target]} isn't installed — pick another app.`);
          await openSystemSheet();
          return;
        }
      }

      const { Social } = RNShare;
      const socialByTarget: Record<
        Exclude<ShareTarget, "more">,
        Exclude<RNSocial, RNSocial.FacebookStories | RNSocial.InstagramStories>
      > = {
        instagram: Social.Instagram as RNSocial.Instagram,
        whatsapp: Social.Whatsapp as RNSocial.Whatsapp,
        messenger: Social.Messenger as RNSocial.Messenger,
        facebook: Social.Facebook as RNSocial.Facebook,
      };

      try {
        await RNShare.default.shareSingle({
          social: socialByTarget[target],
          url: fileUri,
          type: "image/png",
          filename,
          // Chat apps keep the caption; Instagram and Facebook ignore it.
          message: target === "whatsapp" || target === "messenger" ? shareText : undefined,
        });
      } catch (error) {
        if (isCancel(error)) return;
        setNotice(`Couldn't open ${SHARE_TARGET_LABELS[target]} — pick another app.`);
        await openSystemSheet();
      }
    } catch (error) {
      if (!isCancel(error)) {
        setNotice("Couldn't create the image. Please try again.");
      }
    } finally {
      setBusyTarget(null);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={close}
    >
      <View style={styles.backdrop}>
        <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom + 16, 24) }]}>
          <View style={styles.header}>
            <View>
              <Text style={styles.kicker}>SHARE</Text>
              <Text style={styles.title}>{title}</Text>
            </View>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={close}
              style={styles.close}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Close"
            >
              <X size={16} color="#CBD5E1" strokeWidth={2.6} />
            </TouchableOpacity>
          </View>

          <View
            style={{
              width: SHARE_CARD_WIDTH * previewScale,
              height: SHARE_CARD_HEIGHT * previewScale,
              alignSelf: "center",
            }}
          >
            <View
              style={{
                position: "absolute",
                left: (SHARE_CARD_WIDTH * previewScale - SHARE_CARD_WIDTH) / 2,
                top: (SHARE_CARD_HEIGHT * previewScale - SHARE_CARD_HEIGHT) / 2,
                transform: [{ scale: previewScale }],
              }}
            >
              {renderCard(cardRef, theme)}
            </View>
          </View>

          <View style={styles.themeRow}>
            {(Object.keys(SHARE_CARD_THEMES) as ShareCardTheme[]).map((key) => {
              const spec = SHARE_CARD_THEMES[key];
              const active = key === theme;
              return (
                <TouchableOpacity
                  key={key}
                  activeOpacity={0.75}
                  onPress={() => setTheme(key)}
                  style={[styles.themeChip, active && styles.themeChipActive]}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: active }}
                  accessibilityLabel={`${spec.label} theme`}
                >
                  <View style={[styles.themeSwatch, { backgroundColor: spec.swatch }]} />
                  <Text style={[styles.themeText, active && styles.themeTextActive]}>
                    {spec.label.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.targetsBlock}>
            <Text style={styles.targetsLabel}>SHARE TO</Text>
            <View style={styles.targetsRow}>
              {SHARE_TARGETS.map((target) => {
                const busy = busyTarget === target;
                return (
                  <TouchableOpacity
                    key={target}
                    activeOpacity={0.75}
                    onPress={() => shareTo(target)}
                    disabled={busyTarget !== null}
                    style={[styles.target, busyTarget && !busy && styles.targetDimmed]}
                    accessibilityRole="button"
                    accessibilityLabel={`Share to ${SHARE_TARGET_LABELS[target]}`}
                  >
                    <View>
                      <ShareTargetIcon target={target} />
                      {busy ? (
                        <View style={styles.targetBusy}>
                          <ActivityIndicator color="#FFFFFF" size="small" />
                        </View>
                      ) : null}
                    </View>
                    <Text
                      style={styles.targetText}
                      numberOfLines={1}
                      adjustsFontSizeToFit
                      minimumFontScale={0.85}
                    >
                      {SHARE_TARGET_LABELS[target]}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            {notice ? <Text style={styles.notice}>{notice}</Text> : null}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(2,4,10,0.78)",
  },
  sheet: {
    paddingTop: 18,
    paddingHorizontal: 20,
    gap: 16,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    backgroundColor: "#0D1420",
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: "rgba(56,189,248,0.2)",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  kicker: {
    ...typography.overline,
    color: ACCENT_SOFT,
  },
  title: {
    ...typography.cardTitle,
    color: "#F8FAFC",
  },
  close: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  themeRow: {
    flexDirection: "row",
    gap: 8,
  },
  themeChip: {
    flex: 1,
    height: 38,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    backgroundColor: "rgba(255,255,255,0.03)",
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.18)",
  },
  themeChipActive: {
    backgroundColor: "rgba(56,189,248,0.12)",
    borderColor: "rgba(56,189,248,0.5)",
  },
  themeSwatch: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  themeText: {
    ...typography.badge,
    color: "#94A3B8",
  },
  themeTextActive: {
    color: ACCENT_SOFT,
  },
  targetsBlock: {
    gap: 10,
  },
  targetsLabel: {
    ...typography.overline,
    color: "#7C8BA1",
  },
  targetsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  target: {
    width: 64,
    alignItems: "center",
    gap: 6,
  },
  targetDimmed: {
    opacity: 0.45,
  },
  targetBusy: {
    ...StyleSheet.absoluteFill,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(5,7,14,0.55)",
  },
  targetText: {
    ...typography.caption,
    color: "#CBD5E1",
  },
  notice: {
    ...typography.caption,
    color: "#FCA5A5",
    textAlign: "center",
  },
});
