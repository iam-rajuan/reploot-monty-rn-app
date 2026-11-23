import { WorkoutHeader } from "@/features/workouts";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Camera } from "lucide-react-native";
import React, { useState } from "react";
import { Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const coachArtwork = require("../../assets/figma/nutrition/ai-nutrition-coach-figma.jpeg");
const waterRing = require("../../assets/figma/nutrition/water-ring.svg");
const waterCenterDrop = require("../../assets/figma/nutrition/water-center-drop.svg");
const waterQuickDrop = require("../../assets/figma/nutrition/water-quick-drop.svg");
const coachSparkles = require("../../assets/figma/nutrition/coach-sparkles.svg");
const mealUtensils = require("../../assets/figma/nutrition/meal-utensils.svg");
const chevronRight = require("../../assets/figma/nutrition/chevron-right.svg");
const macros = [
  ["PROTEIN", "120g", "#A983FF", "rgba(197,192,255,0.3)"],
  ["CARBS", "180g", "#EA9744", "#EA9744"],
  ["FAT", "55g", "#F93E3E", "rgba(249,62,62,0.3)"],
] as const;

export default function NutritionTabRoute() {
  const insets = useSafeAreaInsets();
  const [water, setWater] = useState(1.8);
  const [input, setInput] = useState("");
  const tap = (strength = Haptics.ImpactFeedbackStyle.Light) => {
    if (Platform.OS !== "web") Haptics.impactAsync(strength).catch(() => {});
  };
  const addWater = (amount: number) => { tap(); setWater((value) => Math.min(3, +(value + amount / 1000).toFixed(2))); };
  const saveWater = () => {
    const value = Number.parseFloat(input);
    if (value > 0) { tap(Haptics.ImpactFeedbackStyle.Medium); addWater(value); setInput(""); }
  };
  return <View style={s.screen}>
    <StatusBar style="light" />
    <WorkoutHeader showBorderBottom />
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[s.content, { paddingBottom: Math.max(insets.bottom + 128, 150) }]}>
      <View style={s.hero}>
        <Text style={s.heroTitle} numberOfLines={1}>FUEL YOURSELF</Text>
        <Text style={s.subtitle}>Eat smarter with AI-powered{"\n"}nutrition tracking.</Text>
      </View>

      <View style={s.macroCard}>
        <Text style={s.budgetLabel}>DAILY BUDGET</Text>
        <View style={s.budgetRow}><Text style={s.budget}>1,850</Text><Text style={s.total}>/ 2,300</Text></View>
        <Text style={s.remaining}>KCAL REMAINING</Text>
        <View style={s.macroRow}>{macros.map(([label, value, color, border]) => <View key={label} style={[s.macro, { borderColor: border }]}><Text style={[s.macroLabel, { color }]}>{label}</Text><Text style={s.macroValue}>{value}</Text></View>)}</View>
        <LinearGradient colors={["#0F4C77", "#3385C0"]} start={{ x: 0, y: .5 }} end={{ x: 1, y: .5 }} style={s.roundButton}>
          <View pointerEvents="none" style={s.buttonContent}><Camera color="#fff" size={20} /><Text style={s.buttonText}>SCAN TODAY'S MEAL</Text></View>
          <Pressable accessibilityRole="button" accessibilityLabel="Scan today's meal" onPress={() => { tap(Haptics.ImpactFeedbackStyle.Medium); router.push("/scan-meal"); }} style={({ pressed }) => [s.buttonOverlay, pressed && s.pressed]} />
        </LinearGradient>
      </View>

      <View style={s.waterCard}>
        <View style={s.waterHeader}><Text style={s.waterTitle}>WATER INTAKE</Text><View style={s.status}><Text style={s.statusText}>HYDRATED</Text></View></View>
        <View style={s.ringWrap}>
          <Image source={waterRing} contentFit="contain" style={s.ringAsset} />
          <View style={s.ringCopy} pointerEvents="none"><Image source={waterCenterDrop} contentFit="contain" style={s.centerDrop} /><View style={s.litres}><Text style={s.litresValue}>{water.toFixed(1)}</Text><Text style={s.litresUnit}>L</Text></View><Text style={s.goal}>GOAL: 3.0 L</Text></View>
        </View>
        <View style={s.quickRow}>{[250, 500, 750].map((amount) => <View key={amount} style={s.quick}><View pointerEvents="none" style={s.quickContent}><Image source={waterQuickDrop} contentFit="contain" style={s.quickDrop} /><Text style={s.quickText}>+{amount}ML</Text></View><Pressable accessibilityRole="button" accessibilityLabel={`Add ${amount} millilitres of water`} onPress={() => addWater(amount)} style={({ pressed }) => [s.buttonOverlay, pressed && s.pressed]} /></View>)}</View>
        <View style={s.inputRow}><Image source={waterQuickDrop} contentFit="contain" style={s.inputDrop} /><TextInput style={s.input} value={input} onChangeText={(value) => setInput(value.replace(/[^0-9]/g, ""))} placeholder="0" placeholderTextColor="#64748B" keyboardType="number-pad" maxLength={5} /><Text style={s.ml}>ML</Text></View>
        <LinearGradient colors={["#0F4C77", "#3385C0"]} start={{ x: 0, y: .5 }} end={{ x: 1, y: .5 }} style={s.save}><View pointerEvents="none" style={s.buttonContent}><Text style={s.buttonText}>SAVE WATER</Text></View><Pressable accessibilityRole="button" accessibilityLabel="Save water intake" onPress={saveWater} style={({ pressed }) => [s.buttonOverlay, pressed && s.pressed]} /></LinearGradient>
      </View>

      <LinearGradient colors={["rgba(108,92,255,0.3)", "#34343A", "#121318"]} locations={[0, .5, 1]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.coachCard}>
        <Image source={coachSparkles} contentFit="contain" style={s.coachDecor} />
        <View style={s.coachTop}><View style={s.avatarShell}><View style={s.avatarGlow} /><View style={s.avatarPanel}><Image source={coachArtwork} contentFit="cover" style={s.avatar} /></View></View><View style={s.coachCopy}><View style={s.coachLabelRow}><Text style={s.coachLabel}>AI NUTRITION COACH</Text></View><Text style={s.coachText}>"You still need <Text style={s.protein}>24g of{"\n"}protein</Text> today."</Text></View></View>
        <View style={s.lunch}><View style={s.lunchLabelRow}><Image source={mealUtensils} contentFit="contain" style={s.mealIcon} /><Text style={s.lunchLabel}>RECOMMENDED NEXT LUNCH</Text></View><Text style={s.lunchText}>Grilled Chicken with Brown Rice</Text></View>
        <View style={s.plan}><View pointerEvents="none" style={s.planContent}><Text style={s.planText}>VIEW AI MEAL PLAN</Text><Image source={chevronRight} contentFit="contain" style={s.planChevron} /></View><Pressable accessibilityRole="button" accessibilityLabel="View AI meal plan" onPress={() => { tap(); router.push("/ai-meal-plan"); }} style={({ pressed }) => [s.buttonOverlay, pressed && s.pressed]} /></View>
      </LinearGradient>
    </ScrollView>
  </View>;
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#1E2731" }, content: { paddingHorizontal: 24, paddingTop: 34, gap: 32 },
  hero: { gap: 0 }, heroTitle: { color: "#fff", fontSize: 32, lineHeight: 38, fontWeight: "900", letterSpacing: -1.1, textShadowColor: "rgba(95,255,215,.42)", textShadowRadius: 14 }, subtitle: { color: "#C8C4D8", fontSize: 16, lineHeight: 24, marginTop: 10 },
  macroCard: { borderRadius: 36, borderWidth: 1, borderColor: "rgba(255,255,255,.1)", backgroundColor: "#252B35", padding: 32, gap: 12, shadowColor: "#6C5CFF", shadowOpacity: .12, shadowRadius: 18, elevation: 0 }, budgetLabel: { color: "#C8C4D8", fontFamily: "JetBrainsMono_700Bold", fontSize: 12, letterSpacing: 1.2, textAlign: "center" }, budgetRow: { flexDirection: "row", justifyContent: "center", alignItems: "baseline" }, budget: { color: "#fff", fontSize: 48, lineHeight: 52, fontWeight: "900", letterSpacing: -1.2 }, total: { color: "#918EA1", fontSize: 24, fontWeight: "700", marginLeft: 5 }, remaining: { color: "#44EAC3", fontSize: 14, fontWeight: "800", letterSpacing: .35, textAlign: "center", marginBottom: 12 },
  macroRow: { flexDirection: "row", gap: 12, paddingTop: 8, marginBottom: 12 }, macro: { flex: 1, minHeight: 78, borderWidth: 1, borderRadius: 16, backgroundColor: "rgba(255,255,255,.05)", alignItems: "center", justifyContent: "center", padding: 8 }, macroLabel: { fontFamily: "JetBrainsMono_700Bold", fontSize: 9, letterSpacing: .45, marginBottom: 4 }, macroValue: { color: "#E3E1E9", fontSize: 23, lineHeight: 28, fontWeight: "900" },
  roundButton: { width: "100%", alignSelf: "stretch", height: 64, borderRadius: 32, overflow: "hidden", shadowColor: "#6C5CFF", shadowOpacity: .3, shadowOffset: { width: 0, height: 10 }, shadowRadius: 15, elevation: 0 }, buttonContent: { position: "absolute", inset: 0, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 12 }, buttonOverlay: { position: "absolute", inset: 0 }, buttonText: { color: "#fff", fontFamily: "JetBrainsMono_700Bold", fontSize: 18, lineHeight: 28, letterSpacing: 0 },
  waterCard: { borderRadius: 24, borderWidth: 1, borderColor: "#6C5CFF", backgroundColor: "rgba(255,255,255,.03)", padding: 25, gap: 16 }, waterHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingBottom: 8 }, waterTitle: { color: "#44CCEA", fontSize: 16, lineHeight: 24, fontStyle: "italic", fontWeight: "400" }, status: { borderRadius: 20, borderWidth: 1, borderColor: "rgba(68,234,195,.2)", backgroundColor: "rgba(68,234,195,.1)", paddingHorizontal: 13, paddingTop: 9, paddingBottom: 7 }, statusText: { color: "#44CCEA", fontFamily: "JetBrainsMono_700Bold", fontSize: 10, lineHeight: 15, letterSpacing: 1 },
  ringWrap: { height: 256, width: 256, alignItems: "center", justifyContent: "center" }, ringAsset: { width: 256, height: 256 }, ringCopy: { position: "absolute", alignItems: "center" }, centerDrop: { width: 14, height: 18 }, litres: { flexDirection: "row", alignItems: "baseline", marginTop: 8 }, litresValue: { color: "#E3E1E9", fontSize: 36, lineHeight: 36 }, litresUnit: { color: "#918EA1", fontSize: 20, lineHeight: 28, marginLeft: 4 }, goal: { color: "#918EA1", fontFamily: "JetBrainsMono_700Bold", fontSize: 12, lineHeight: 18, letterSpacing: 1.2, marginTop: 4 },
  quickRow: { width: "100%", flexDirection: "row", justifyContent: "space-between", paddingTop: 16 }, quick: { position: "relative", width: 89, height: 66, borderRadius: 16, borderWidth: 1, borderColor: "#46505C", backgroundColor: "#2B333D", overflow: "hidden" }, quickContent: { position: "absolute", inset: 0, alignItems: "center", justifyContent: "center", gap: 8 }, quickDrop: { width: 14, height: 18 }, quickText: { color: "#C8C4D8", fontFamily: "JetBrainsMono_700Bold", fontSize: 10, lineHeight: 15 }, inputRow: { height: 58, borderRadius: 16, backgroundColor: "rgba(255,255,255,.05)", borderWidth: 1, borderColor: "rgba(255,255,255,.1)", paddingHorizontal: 5, flexDirection: "row", alignItems: "center", marginTop: 16 }, inputDrop: { width: 14, height: 18, marginHorizontal: 10 }, input: { color: "#E3E1E9", fontSize: 24, flex: 1, marginLeft: 0, paddingVertical: 0 }, ml: { color: "#44CCEA", fontFamily: "JetBrainsMono_700Bold", fontSize: 16, letterSpacing: 1.6, paddingRight: 24 }, save: { width: "100%", height: 64, borderRadius: 32, overflow: "hidden", marginTop: 8 },
  coachCard: { width: "100%", borderRadius: 24, borderWidth: 1, borderColor: "#6C5CFF", padding: 25, gap: 16, overflow: "hidden", shadowColor: "#6C5CFF", shadowOpacity: .25, shadowRadius: 20, elevation: 0 }, coachDecor: { position: "absolute", width: 22, height: 28, right: -16, top: -16, opacity: .1 }, coachTop: { flexDirection: "row", alignItems: "center", gap: 16 }, avatarShell: { width: 64, height: 64, position: "relative", alignItems: "center", justifyContent: "center" }, avatarGlow: { position: "absolute", inset: 0, borderRadius: 32, backgroundColor: "rgba(197,192,255,.3)", opacity: .65 }, avatarPanel: { width: 64, height: 64, borderRadius: 16, padding: 1, alignItems: "center", justifyContent: "center", overflow: "hidden", backgroundColor: "rgba(30,31,37,.6)", borderWidth: 1, borderColor: "rgba(255,255,255,.1)" }, avatar: { width: 48, height: 48, borderRadius: 0 }, coachCopy: { flex: 1 }, coachLabelRow: { flexDirection: "row", alignItems: "center" }, coachLabel: { color: "#C5C0FF", fontFamily: "JetBrainsMono_700Bold", fontSize: 10, lineHeight: 15, letterSpacing: 2 }, coachText: { color: "#E3E1E9", fontSize: 16, fontWeight: "800", fontStyle: "italic", lineHeight: 20, marginTop: 0 }, protein: { color: "#44EAC3", fontWeight: "400" }, lunch: { backgroundColor: "rgba(0,0,0,.4)", borderRadius: 16, borderWidth: 1, borderColor: "rgba(255,255,255,.1)", padding: 17 }, lunchLabelRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 }, mealIcon: { width: 15, height: 20 }, lunchLabel: { color: "#C8C4D8", fontFamily: "JetBrainsMono_700Bold", fontSize: 10, lineHeight: 15, letterSpacing: .5 }, lunchText: { color: "#E3E1E9", fontSize: 16, lineHeight: 24, fontWeight: "700" }, plan: { position: "relative", width: "100%", alignSelf: "stretch", height: 44, borderRadius: 12, borderWidth: 1, borderColor: "rgba(255,255,255,.1)", backgroundColor: "rgba(255,255,255,.05)", overflow: "hidden" }, planContent: { position: "absolute", inset: 0, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 }, planText: { color: "#E3E1E9", fontFamily: "JetBrainsMono_700Bold", fontSize: 12, lineHeight: 16, letterSpacing: 1.2 }, planChevron: { width: 7.4, height: 12 }, pressed: { opacity: .82, transform: [{ scale: .985 }] },
});
