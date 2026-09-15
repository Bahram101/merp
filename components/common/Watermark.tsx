import React, { PropsWithChildren } from "react";
import { StyleSheet, Text, View } from "react-native";

import { useAuth } from "@/features/auth/hooks/useAuth";

const TILE_COUNT = 24;

// Reads the current user's identifying label for the watermark. Call this
// from a component in the normal screen tree and pass the result down as
// the `label` prop when <Watermark> ends up rendered inside a gluestack
// overlay/portal (e.g. an Actionsheet) — AuthContext doesn't reach there,
// so Watermark's own useAuth() fallback would resolve to nothing.
export const useWatermarkLabel = () => {
  const { user } = useAuth();
  return user?.userInfo?.werks?.[0]?.userName || String(user?.user_id ?? "");
};

interface WatermarkProps {
  label?: string;
}

const Watermark: React.FC<PropsWithChildren<WatermarkProps>> = ({
  children,
  label,
}) => {
  const fallbackLabel = useWatermarkLabel();
  const resolvedLabel = label ?? fallbackLabel;
  const timestamp = new Date().toLocaleString("ru-RU", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <View style={{ position: "relative", width: "100%" }}>
      {children}

      <View
        pointerEvents="none"
        style={[StyleSheet.absoluteFill, { overflow: "hidden" }]}
      >
        <View style={{ flexDirection: "row", flexWrap: "wrap", opacity: 0.1 }}>
          {Array.from({ length: TILE_COUNT }).map((_, index) => (
            <View
              key={index}
              style={{
                width: "33%",
                paddingVertical: 14,
                alignItems: "center",
                transform: [{ rotate: "-20deg" }],
              }}
            >
              <Text style={{ fontSize: 11, color: "#000" }}>
                {resolvedLabel}
              </Text>
              <Text style={{ fontSize: 8, color: "#000" }}>{timestamp}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

export default Watermark;
