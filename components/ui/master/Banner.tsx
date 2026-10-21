import cn from "clsx";
import React, { FC } from "react";
import { Dimensions, Text, View } from "react-native";

import { getStatusColor, StatusText } from "@/utils/status.helper";
import { Loader } from "../Loader";

type Scheme = "red" | "blue" | "green";
type StatId = "assigned" | "done" | "completed";

type StatItem = {
  id: StatId;
  title: string;
  scheme: Scheme;
};

type Props = {
  className?: string;
  style?: object;
  assigned: number;
  isAssignedLoading: boolean;
  done: number;
  completed: number;
};

const Banner: FC<Props> = ({
  className,
  style,
  assigned,
  isAssignedLoading,
  done,
  completed,
}) => {
  const DATA: StatItem[] = [
    {
      id: "assigned",
      title: "Распределенные заявки",
      scheme: "red",
    },
    {
      id: "done",
      title: "Выпол. заявки на сегодня",
      scheme: "blue",
    },
    {
      id: "completed",
      title: "Завершенные заявки на месяц",
      scheme: "green",
    },
  ];
  const { width } = Dimensions.get("window");
  const H_PADDING = 16;
  const GAP = 12;
  const CARD_WIDTH = (width - H_PADDING * 2 - GAP * 1) / 3;
  const valueMap: Record<StatId, number> = {
    assigned,
    done,
    completed,
  };

  return (
    <View
      className={cn("px-4", className)}
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
        elevation: 6,
      }}
      {...style}
    >
      <View className="flex-row justify-between bg-white rounded-2xl pt-4 pb-4 ">
        {DATA.map((item, index) => (
          <View
            key={item.id}
            style={{ width: CARD_WIDTH }}
            className={cn(
              `px-3 items-center justify-center border-grayLight`,
              index !== 2 && "border-r",
            )}
          >
            <Text
              className="text-xs mb-2 text-center items-center"
              numberOfLines={2}
            >
              {item.title}
            </Text>
            <Text
              className={cn(
                "font-bold mt-1 text-5xl",
                getStatusColor(item.id as StatusText),
              )}
            >
              {isAssignedLoading ? <Loader /> : valueMap[item.id]}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

export default Banner;
