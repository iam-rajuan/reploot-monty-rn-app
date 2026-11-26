import { useAppSelector } from "@/store/hooks";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Camera } from "lucide-react-native";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { Text } from "@/shared/components/typography";
import { typography } from "@/theme/typography";

const defaultAvatar = require("../../../../assets/avatar/sample-athlete-profile.png");

export const EditProfileBanner = ({ onChangePhoto }: { onChangePhoto?: () => void }) => {
  const user = useAppSelector((state) => state.auth.user);

  return (
    <View style={styles.container}>
      <View style={styles.banner}>
        <Image
          source={require("../../../../assets/editProfileBg.png")}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
        />
        <LinearGradient
          colors={["rgba(6,8,16,0.1)", "rgba(6,8,16,0.8)"]}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />
      </View>

      <View style={styles.identityRow}>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={onChangePhoto}
          style={styles.avatarRing}
          accessibilityRole="button"
          accessibilityLabel="Change profile photo"
        >
          {/* Clip the gradient to a circle; the camera badge stays unclipped. */}
          <View style={styles.ringClip} pointerEvents="none">
            <LinearGradient
              colors={["#7DD3FC", "#38BDF8", "#6366F1"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
          </View>
          <View style={styles.avatarInner}>
            <Image
              source={user?.avatarUrl ? { uri: user.avatarUrl } : defaultAvatar}
              style={styles.avatar}
              contentFit="cover"
            />
          </View>
          <View style={styles.cameraBadge}>
            <Camera size={12} color="#FFFFFF" strokeWidth={2.4} />
          </View>
        </TouchableOpacity>
        <View style={styles.identityCopy}>
          <Text style={styles.name} numberOfLines={1}>
            {user?.fullName || "Athlete"}
          </Text>
          <Text style={styles.hint}>Tap the photo to change it</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 18,
  },
  banner: {
    height: 110,
    borderRadius: 22,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(56,189,248,0.2)",
    backgroundColor: "#111A25",
  },
  identityRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 12,
    marginTop: -40,
    paddingHorizontal: 14,
  },
  avatarRing: {
    width: 84,
    height: 84,
    borderRadius: 42,
    padding: 3,
  },
  ringClip: {
    ...StyleSheet.absoluteFill,
    borderRadius: 42,
    overflow: "hidden",
  },
  avatarInner: {
    flex: 1,
    borderRadius: 40,
    overflow: "hidden",
    borderWidth: 3,
    borderColor: "#0B1220",
    backgroundColor: "#0D141E",
  },
  avatar: {
    width: "100%",
    height: "100%",
  },
  cameraBadge: {
    position: "absolute",
    right: 0,
    bottom: 2,
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0EA5E9",
    borderWidth: 2,
    borderColor: "#0B1220",
  },
  identityCopy: {
    flex: 1,
    minWidth: 0,
    paddingBottom: 6,
  },
  name: {
    ...typography.cardTitle,
    color: "#F8FAFC",
  },
  hint: {
    ...typography.caption,
    color: "#7C8BA1",
  },
});
