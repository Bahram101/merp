import { BottomSheetType } from "@/providers/BottomSheet/AppBottomSheetProvider";
import BottomSheet, { BottomSheetBackdropProps } from "@gorhom/bottom-sheet";
import cn from "clsx";
import { BlurView } from "expo-blur";
import { X } from "lucide-react-native";
import React, {
  forwardRef,
  startTransition,
  useImperativeHandle,
  useRef,
} from "react";
import {
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import Animated, {
  interpolate,
  useAnimatedStyle,
} from "react-native-reanimated";
import { Input, InputField } from "../input";

export type AppBottomSheetRef = {
  open: () => void;
  close: () => void;
};

type Props = {
  title?: string;
  children?: React.ReactNode;
  snapPoints?: string[];
  search: string;
  modalType: BottomSheetType;
  setSearch: (value: string) => void;
};

const AppBottomSheet = forwardRef<AppBottomSheetRef, Props>(
  (
    { title, snapPoints = ["75%"], children, search, modalType, setSearch },
    ref,
  ) => {
    const bottomSheetRef = useRef<BottomSheet>(null);

    useImperativeHandle(ref, () => ({
      open: () => bottomSheetRef.current?.expand(),
      close: () => bottomSheetRef.current?.close(),
    }));

    const CustomBackdrop = ({
      animatedIndex,
      style,
    }: BottomSheetBackdropProps) => {
      const animatedStyle = useAnimatedStyle(() => {
        const opacity = interpolate(animatedIndex.value, [-1, 0], [0, 1]);

        return { opacity };
      });

      return (
        <Animated.View
          pointerEvents="none"
          style={[
            style,
            animatedStyle,
            {
              position: "absolute",
              left: 0,
              right: 0,
              top: 0,
              bottom: 0,
            },
          ]}
        >
          <TouchableWithoutFeedback
            onPress={() => {
              bottomSheetRef.current?.close();
            }}
          >
            <View style={{ flex: 1 }}>
              <BlurView
                tint="dark"
                intensity={35}
                style={{
                  flex: 1,
                  backgroundColor: "rgba(0,0,0,0.2)",
                }}
              />
            </View>
          </TouchableWithoutFeedback>
        </Animated.View>
      );
    };

    return (
      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={snapPoints}
        backdropComponent={CustomBackdrop}
        enablePanDownToClose
        animateOnMount={false}
        enableDynamicSizing={false}
      >
        <View style={{ flex: 1 }}>
          {/* fixed header */}
          <View
            className={cn(
              "flex-row justify-between items-center px-4 pb-4 border-b border-gray-200",
              modalType === "policy" ? "pt-2" : "pt-8",
            )}
          >
            <Text className="text-lg font-semibold">{title}</Text>
            <TouchableOpacity onPress={() => bottomSheetRef.current?.close()}>
              <X />
            </TouchableOpacity>
          </View>

          {/* Search */}
          {modalType === "materials" && (
            <View className="px-4 pt-3 pb-1">
              <Input>
                <InputField
                  placeholder="Поиск"
                  value={search}
                  onChangeText={setSearch}
                />
              </Input>
              {search.length > 0 && (
                <TouchableOpacity
                  onPress={() =>
                    startTransition(() => {
                      setSearch("");
                    })
                  }
                  className="absolute right-7 top-6"
                >
                  <X size={18} color="#999" />
                </TouchableOpacity>
              )}
            </View>
          )}
          {children}
        </View>
      </BottomSheet>
    );
  },
);

AppBottomSheet.displayName = "AppBottomSheet";

export default AppBottomSheet;
