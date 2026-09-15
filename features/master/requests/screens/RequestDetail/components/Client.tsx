import React, { FC } from "react";
import { Text, View } from "react-native";

import BaseAccordion from "@/components/ui/accordion/BaseAccordion";
import Watermark from "@/components/common/Watermark";
import { ClientType } from "@/features/master/requests/types";
import { formatFullName } from "@/utils/helpers";

type ClientAccordionProps = {
  data: ClientType;
};

const Client: FC<ClientAccordionProps> = ({ data }) => {
  return (
    <Watermark>
      <BaseAccordion title="Данные клиента" icon="user" value="client">
        <View className="flex-row gap-2">
          <Text className="text-gray-500">Имя:</Text>
          <Text className="font-semibold">{formatFullName(data.name)}</Text>
        </View>
        <View className="flex-row gap-2">
          <Text className="text-gray-500">Адрес:</Text>
          <Text className="font-semibold">{data.address}</Text>
        </View>
      </BaseAccordion>
    </Watermark>
  );
};
export default Client;
