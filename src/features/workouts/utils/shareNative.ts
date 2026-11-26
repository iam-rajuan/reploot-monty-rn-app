import { requireOptionalNativeModule } from "expo";
import { NativeModules, TurboModuleRegistry } from "react-native";

type ViewShot = typeof import("react-native-view-shot");
type RNShareModule = typeof import("react-native-share");
type ExpoSharing = typeof import("expo-sharing");

/** True when a React Native native module is compiled into this build. */
function hasReactNativeModule(name: string): boolean {
  try {
    // `get` (unlike `getEnforcing`) returns null instead of throwing/logging.
    return Boolean(TurboModuleRegistry.get(name) ?? (NativeModules as Record<string, unknown>)[name]);
  } catch {
    return false;
  }
}

/**
 * Loads the image-sharing libraries only if their native code exists in the
 * running build. Requiring them in an older build would log red errors, so
 * each one comes back as null and callers fall back to a text share.
 */
export function loadShareModules(): {
  captureRef: ViewShot["captureRef"] | null;
  RNShare: RNShareModule | null;
  Sharing: ExpoSharing | null;
} {
  const captureRef = hasReactNativeModule("RNViewShot")
    ? (require("react-native-view-shot") as ViewShot).captureRef
    : null;
  const RNShare = hasReactNativeModule("RNShare")
    ? (require("react-native-share") as RNShareModule)
    : null;
  const Sharing = requireOptionalNativeModule("ExpoSharing")
    ? (require("expo-sharing") as ExpoSharing)
    : null;
  return { captureRef, RNShare, Sharing };
}
