import { FontAwesome } from "@expo/vector-icons";
import { Linking, Text, View } from "react-native";

import { maskPhoneNumber } from "@/utils/helpers";

type Props = {
  phones: string[];
};

export default function PhoneActionSheet({ phones }: Props) {
  const callPhone = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  return (
    <View className="w-full p-4">
      <Text className="text-lg font-semibold mb-4">Телефоны клиента</Text>

      {phones.map((phone) => (
        <View key={phone} className="flex-row items-center gap-2">
          <FontAwesome name="phone" size={22} color="green" />
          <Text className="px-2 py-4 pl-0">{maskPhoneNumber(phone)}</Text>
        </View>
      ))}
    </View>
  );
}
