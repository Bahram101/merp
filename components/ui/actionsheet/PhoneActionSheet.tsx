import { FontAwesome } from "@expo/vector-icons";
import { Linking, Pressable, Text, View } from "react-native";

import Watermark from "@/components/common/Watermark";
import { maskPhoneNumber } from "@/utils/helpers";

type Props = {
  phones: string[];
  watermarkLabel?: string;
};

export default function PhoneActionSheet({ phones, watermarkLabel }: Props) {
  const callPhone = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  return (
    <Watermark label={watermarkLabel}>
      <View className="w-full p-4">
        <Text className="text-lg font-semibold mb-4">Телефоны клиента</Text>
        {phones.map((phone) => (
          <Pressable key={phone} onPress={() => callPhone(phone)}>
            <View key={phone} className="flex-row items-center gap-2">
              <FontAwesome name="phone" size={22} color="green" />
              <Text className="px-2 py-4 pl-0">{maskPhoneNumber(phone)}</Text>
            </View>
          </Pressable>
        ))}
      </View>
    </Watermark>
  );
}
