import { AppBottomSheetRef } from "@/components/ui/bottom-sheet/AppBottomSheet";
import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";
import AuthProvider from "@/features/auth/components/AuthProvider";
import "@/global.css";
import ActionSheetProvider from "@/providers/ActionSheetProvider";
import AppBottomSheetProvider from "@/providers/BottomSheet/AppBottomSheetProvider";
import { ReactQueryProvider } from "@/providers/ReactQueryProvider";
import { usePreventScreenCapture } from "expo-screen-capture";
import { useEffect, useRef } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-reanimated";
import RootLayout from "./RootLayout";

export default function RootlayoutWrapper() {
  const modalRef = useRef<AppBottomSheetRef>(null);

  usePreventScreenCapture();

  useEffect(() => {
    modalRef.current?.open?.();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <GluestackUIProvider mode="light">
        <AuthProvider>
          <ReactQueryProvider>
            <ActionSheetProvider>
              <AppBottomSheetProvider>
                <RootLayout />
              </AppBottomSheetProvider>
            </ActionSheetProvider>
          </ReactQueryProvider>
        </AuthProvider>
      </GluestackUIProvider>
    </GestureHandlerRootView>
  );
}
