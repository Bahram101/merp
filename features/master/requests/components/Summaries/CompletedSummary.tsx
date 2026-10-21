import React from "react";
import { Text, View } from "react-native";

type Props = {
  completedSummaryData?: any;
};

const CompletedSummary = ({ completedSummaryData }: Props) => {
  return (
    <View className="bg-white rounded-2xl flex-col gap-4 p-5 mt-2">
      <View className="flex-row justify-center border-grayLight font-bold">
        <Text className="font-bold text-grayDark"> ЗАВЕРЩЕНО: </Text>
        <Text className="font-bold text-primary">
          {completedSummaryData.length} ЗАЯВОК
        </Text>
      </View>
    </View>
  );
};

export default CompletedSummary;
