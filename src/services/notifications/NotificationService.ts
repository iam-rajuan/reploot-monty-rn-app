import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

// ── Rest reminder design ─────────────────────────────────────────────────────
const BRAND_COLOR = "#38BDF8";
const REST_VIBRATION = [0, 220, 120, 220];
export const REST_REMINDER_KIND = "rest-reminder";
// Android channels can't be edited after creation, so the id is versioned.
export const REST_REMINDER_CHANNEL = "workout-reminders-v2";
export const REST_REMINDER_CATEGORY = "rest-reminder";
export const REST_ACTION_START = "start-next";
export const REST_ACTION_EXTEND = "extend-rest";

let restSetupPromise: Promise<void> | null = null;

/** Creates the Android channel and the action-button category once. */
function ensureRestReminderSetup(): Promise<void> {
  if (!restSetupPromise) {
    restSetupPromise = (async () => {
      if (Platform.OS === "android") {
        // Remove the first version of the channel (it had a broken sound setting).
        await Notifications.deleteNotificationChannelAsync("workout-reminders").catch(
          () => {},
        );
        await Notifications.setNotificationChannelAsync(REST_REMINDER_CHANNEL, {
          name: "Workout reminders",
          description: "Tells you when your rest is over.",
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: REST_VIBRATION,
          lightColor: BRAND_COLOR,
          enableLights: true,
          enableVibrate: true,
          // No `sound` key: omitting it uses the phone's default notification
          // sound. Passing "default" is treated as a custom file name.
          lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
          showBadge: false,
        });
      }
      await Notifications.setNotificationCategoryAsync(REST_REMINDER_CATEGORY, [
        {
          identifier: REST_ACTION_START,
          buttonTitle: "Start next",
          options: { opensAppToForeground: true },
        },
        {
          identifier: REST_ACTION_EXTEND,
          buttonTitle: "+30 sec rest",
          options: { opensAppToForeground: false },
        },
      ]);
    })().catch(() => {
      restSetupPromise = null;
    });
  }
  return restSetupPromise;
}

/**
 * Push & Local Notifications Architecture
 */
export const notificationPermissionService = {
  async getPermission(): Promise<boolean> {
    if (Platform.OS === "web") return false;
    try {
      const { status } = await Notifications.getPermissionsAsync();
      return status === "granted";
    } catch {
      return false;
    }
  },

  async requestPermission(): Promise<boolean> {
    if (Platform.OS === "web") return false;
    try {
      const { status } = await Notifications.requestPermissionsAsync({
        ios: {
          allowAlert: true,
          allowBadge: true,
          allowSound: true,
        },
      });
      return status === "granted";
    } catch {
      return false;
    }
  },
};

export const notificationService = {
  async configureHandler(): Promise<void> {
    if (Platform.OS === "web") return;
    Notifications.setNotificationHandler({
      // Rest reminders get a designed in-app banner while the app is open,
      // so the system banner is only used when the app is in the background.
      handleNotification: async (notification) =>
        notification.request.content.data?.kind === REST_REMINDER_KIND
          ? {
              shouldPlaySound: false,
              shouldSetBadge: false,
              shouldShowBanner: false,
              shouldShowList: false,
            }
          : {
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
            },
    });
  },

  /**
   * Rest-over reminder: high-priority channel, brand colour, iOS subtitle and
   * two action buttons ("Start next" / "+30 sec").
   */
  async scheduleRestReminder(options: {
    title: string;
    subtitle?: string;
    body: string;
    seconds: number;
  }): Promise<string | null> {
    if (Platform.OS === "web") return null;
    const hasPerm = await notificationPermissionService.getPermission();
    if (!hasPerm) return null;
    await ensureRestReminderSetup();

    return Notifications.scheduleNotificationAsync({
      content: {
        title: options.title,
        subtitle: options.subtitle,
        body: options.body,
        // Android takes the sound from the channel; naming one here makes
        // expo-notifications look for a custom file called "default".
        sound: Platform.OS === "ios" ? true : undefined,
        color: BRAND_COLOR,
        priority: Notifications.AndroidNotificationPriority.MAX,
        vibrate: REST_VIBRATION,
        categoryIdentifier: REST_REMINDER_CATEGORY,
        interruptionLevel: "timeSensitive",
        autoDismiss: true,
        data: { kind: REST_REMINDER_KIND },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: Math.max(1, Math.round(options.seconds)),
        repeats: false,
        channelId: REST_REMINDER_CHANNEL,
      },
    });
  },

  async dismiss(notificationId: string): Promise<void> {
    if (Platform.OS === "web") return;
    await Notifications.dismissNotificationAsync(notificationId);
  },

  async scheduleReminder(title: string, body: string, triggerSeconds: number): Promise<string | null> {
    if (Platform.OS === "web") return null;
    const hasPerm = await notificationPermissionService.getPermission();
    if (!hasPerm) return null;

    return await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: triggerSeconds,
        repeats: false,
      },
    });
  },

  async cancelScheduled(notificationId: string): Promise<void> {
    if (Platform.OS === "web") return;
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  },
};
