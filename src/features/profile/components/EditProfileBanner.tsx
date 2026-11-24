import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Camera } from "lucide-react-native";
import React from "react";
import { StyleSheet, View } from "react-native";

export const EditProfileBanner = () => {
  return (
    <View style={styles.bannerContainer}>
      <Image
        source={require("../../../../assets/editProfileBg.png")}
        style={styles.bannerImage}
        contentFit="cover"
      />
      <LinearGradient
        colors={["rgba(7, 10, 17, 0.08)", "rgba(7, 10, 17, 0.76)"]}
        style={styles.bannerOverlay}
      />
      <View style={styles.avatarWrapper}>
        <Image
          source={{ uri: "https://i.pravatar.cc/150?img=11" }}
          style={styles.avatarImage}
        />
        <View style={styles.editIconBadge}>
          <Camera size={12} color="#071018" strokeWidth={2.4} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  bannerContainer: {
    position: "relative",
    marginBottom: 48,
  },
  bannerImage: {
    width: "100%",
    height: 124,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(86, 130, 166, 0.28)",
  },
  bannerOverlay: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    borderRadius: 18,
  },
  avatarWrapper: {
    position: "absolute",
    bottom: -34,
    left: 18,
    width: 78,
    height: 78,
    borderRadius: 39,
    borderWidth: 3,
    borderColor: "#25D7E8",
    backgroundColor: "#101A29",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  avatarImage: {
    width: "100%",
    height: "100%",
    borderRadius: 36,
  },
  editIconBadge: {
    position: "absolute",
    bottom: -4,
    right: -4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#25D7E8",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#070A11",
  },
});
