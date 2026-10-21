import { formatCurrency } from "@/utils/helpers";
import React, { FC } from "react";
import { Text, View } from "react-native";

type CompletedRequestCardProps = {
  item: any;
};

const CompletedRequestCard: FC<CompletedRequestCardProps> = ({ item }) => {
  return (
    <View className="bg-white rounded-2xl px-4 py-3 mb-2">
      <View className="flex-row items-center justify-between">
        <Text
          className="flex-1 text-base text-gray-800 font-semibold"
          numberOfLines={1}
        >
          {item.serviceTypeName}
        </Text>

        <View className="flex-row items-center gap-4">
          <Text className="w-[60px] text-right text-sm text-gray-700">
            {item.serviceCount} шт
          </Text>

          <Text className="w-[90px] text-right text-sm ">
            {formatCurrency(item.masterPremium)}
          </Text>
        </View>
      </View>
    </View>
  );
};

export default CompletedRequestCard;
