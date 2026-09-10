import { getStatusMeta } from "@/utils/status.helper";
import { Feather } from "@expo/vector-icons";
import cn from "clsx";
import { router } from "expo-router";
import { FC } from "react";
import { Text, View } from "react-native";

import AnimatedBlock from "@/components/ui/button/AnimatedBlock";
import { ROUTES } from "@/constants/routes";
import { COLORS } from "@/constants/theme";
import { formatDayMonth } from "@/utils/date";
import { CalendarDays, Clock } from "lucide-react-native";
import { ApplicationStatusId } from "../../constants/status";
import { IRequest } from "../../types";

type AssignedRequestCardProps = {
  item: IRequest;
};

const AssignedRequestCard: FC<AssignedRequestCardProps> = ({ item }) => {
  const handlePress = () => {
    router.push({
      pathname:
        item.applicationStatusId === ApplicationStatusId.ARRIVED
          ? ROUTES.WORK
          : ROUTES.REQUEST_ASSIGNED,
      params: { appNumber: item.applicationNumber },
    });
  };

  return (
    <AnimatedBlock item={item} onPress={handlePress}>
      <View className="flex-row items-center justify-between mb-3 border-b border-grayLight pb-2">
        <View className="bg-primary h-6 justify-center flex rounded px-3">
          <Text className="text-white text-sm">{item.applicationTypeName}</Text>
        </View>
        <View>
          <Text className="text-sm font-semibold">
            ЗАЯВКА № {item.applicationNumber}
          </Text>
        </View>
      </View>
      <View className="flex-row justify-between">
        <View className="flex-row items-start gap-3 pl-3 border-l-4 border-primary flex-1">
          <View className="gap-2 flex-1">
            <View className="gap-2">
              <View className="flex-row items-center gap-2">
                <CalendarDays size={18} color={COLORS.grayDark} />
                <Text>{formatDayMonth(item.applicationDate)}</Text>
              </View>
              <View className="flex-row items-center gap-2">
                <Clock size={18} color={COLORS.grayDark} />
                <Text>{item.applicationDate.split(" ")[1]}</Text>
              </View>
            </View>
            <View className="flex-row items-start gap-2 flex-1">
              <Feather name="map-pin" size={18} color={COLORS.grayDark} />
              <Text style={{ flex: 1, flexWrap: "wrap" }}>
                {item.fullAddress}
              </Text>
            </View>
          </View>
        </View>
        <View className="flex-col-reverse">
          <View className="flex-row items-center">
            <Text className={cn("text-sm mr-2", getStatusMeta(item).text)}>
              {getStatusMeta(item).label}
            </Text>
            <View
              className={cn(
                "w-6 h-6 rounded-full justify-center items-center ml-2",
                getStatusMeta(item).bgOuter,
              )}
            >
              <View
                className={cn(
                  "w-4 h-4 rounded-full",
                  getStatusMeta(item).bgInner,
                )}
              />
            </View>
          </View>
        </View>
      </View>
    </AnimatedBlock>
  );
};

export default AssignedRequestCard;
