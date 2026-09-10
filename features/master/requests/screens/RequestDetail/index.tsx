import { Accordion } from "@/components/ui/accordion";
import PhoneActionSheet from "@/components/ui/actionsheet/PhoneActionSheet";
import AnimatedButton from "@/components/ui/button/AnimatedButton";
import { Loader } from "@/components/ui/Loader";
import Layout from "@/components/ui/master/Layout";
import { ROUTES } from "@/constants/routes";
import { ColorKeys } from "@/constants/theme";
import { useActionSheet } from "@/providers/ActionSheetProvider";
import { RequestDetailParams } from "@/types/navigation.interface";
import { TypeFeatherIconNames } from "@/types/types";
import { router, useLocalSearchParams, useNavigation } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, Text, View } from "react-native";
import { ApplicationStatusId } from "../../constants/status";
import {
  useRequestDetail,
  useUpdateRequestStatus,
} from "../../hooks/useRequest";
import Client from "./components/Client";
import DeviceData from "./components/Device";
import { Service } from "./components/Service";

const MAIN_BUTTON_CONFIG: Record<
  ApplicationStatusId,
  {
    bg: ColorKeys;
    bgPressed: ColorKeys;
    icon: TypeFeatherIconNames;
    label: string;
  }
> = {
  [ApplicationStatusId.ASSIGNED]: {
    bg: "primary",
    bgPressed: "primaryDark",
    icon: "check",
    label: "Принять",
  },
  [ApplicationStatusId.ACCEPTED]: {
    bg: "blue",
    bgPressed: "blueDark",
    icon: "map-pin",
    label: "Прибыл",
  },
  [ApplicationStatusId.ARRIVED]: {
    bg: "blue",
    bgPressed: "blueDark",
    icon: "map-pin",
    label: "В работе",
  },
};

export default function RequestDetailScreen() {
  const navigation = useNavigation();
  const { openSheet } = useActionSheet();
  const { appNumber } = useLocalSearchParams<RequestDetailParams>();
  const { requestDetail, isLoadingReqDetail, refetchRequestDetail } =
    useRequestDetail(Number(appNumber));
  const { updateRequestStatus } = useUpdateRequestStatus();
  const [refreshing, setRefreshing] = useState(false);
  const [loadingType, setLoadingType] = useState<"main" | "cancel" | null>(
    null,
  );

  const phones =
    requestDetail?.fullPhone
      ?.split(/[;,]/)
      .map((phone: string) => phone.trim())
      .filter(Boolean) ?? [];

  useEffect(() => {
    if (appNumber) {
      navigation.setOptions({
        headerTitle: `Заявка №${appNumber}`,
      });
    }
  }, [navigation, appNumber]);

  useEffect(() => {
    if (requestDetail?.contractNumber) {
      router.setParams({
        contractNumber: requestDetail.contractNumber,
      });
    }
  }, [requestDetail?.contractNumber]);

  if (isLoadingReqDetail || !requestDetail) {
    return <Loader />;
  }

  const handleMainButton = async () => {
    setLoadingType("main");
    try {
      if (requestDetail.applicationStatusId === ApplicationStatusId.ASSIGNED) {
        await updateRequestStatus({
          reqId: requestDetail.applicationNumber,
          statusId: ApplicationStatusId.ACCEPTED,
        });
      } else if (
        requestDetail.applicationStatusId === ApplicationStatusId.ACCEPTED
      ) {
        await updateRequestStatus(
          {
            reqId: requestDetail.applicationNumber,
            statusId: ApplicationStatusId.ARRIVED,
          },
          {
            onSuccess: () => {
              router.push({
                pathname: ROUTES.WORK,
                params: { appNumber },
              });
            },
          },
        );
      } else if (
        requestDetail.applicationStatusId === ApplicationStatusId.ARRIVED
      ) {
        router.replace({
          pathname: ROUTES.WORK,
          params: {
            appNumber: String(appNumber),
            matnrId: String(requestDetail.matnrId),
          },
        });
      }
    } catch (error) {
      Alert.alert("Ошибка", (error as Error).message);
    } finally {
      setLoadingType(null);
    }
  };

  const request = {
    client: {
      name: requestDetail.customerFIO,
      address: requestDetail.addressName,
    },
    service: {
      type: requestDetail.applicationTypeName,
      info: requestDetail.info,
    },
    device: {
      id: requestDetail.tovarSn,
      productName: requestDetail.matnrName,
      contractNumber: requestDetail.contractNumber,
      contractDate: requestDetail.contractDate,
      filterState: {
        f1: requestDetail.f1MtLeft,
        f2: requestDetail.f2MtLeft,
        f3: requestDetail.f3MtLeft,
        f4: requestDetail.f4MtLeft,
        f5: requestDetail.f5MtLeft,
        f6: requestDetail.f6MtLeft,
      },
    },
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refetchRequestDetail();
    } finally {
      setRefreshing(false);
    }
  };

  const handleCancel = async () => {
    setLoadingType("cancel");
    try {
      await updateRequestStatus({
        reqId: requestDetail.applicationNumber,
        statusId: ApplicationStatusId.ASSIGNED,
      });
    } finally {
      setLoadingType(null);
    }
  };

  const onPressCall = () => {
    openSheet(<PhoneActionSheet phones={phones} />);
  };

  const isAssigned =
    requestDetail.applicationStatusId === ApplicationStatusId.ASSIGNED;

  const mainButtonConfig =
    MAIN_BUTTON_CONFIG[
      requestDetail.applicationStatusId as ApplicationStatusId
    ] ?? MAIN_BUTTON_CONFIG[ApplicationStatusId.ARRIVED];

  return (
    <Layout className="gap-3" refreshing={refreshing} onRefresh={onRefresh}>
      <Accordion
        type="multiple"
        defaultValue={["client", "service"]}
        className="rounded-2xl gap-3 bg-transparent"
      >
        <Client data={request.client} />
        <Service data={request.service} />
        <DeviceData data={request.device} />
      </Accordion>

      <View className="flex-row gap-3 ">
        <View className="flex-1">
          <AnimatedButton
            className="p-4"
            bg="white"
            bgPressed="grayLight"
            icon="message-circle"
            iconColor="blue"
            textColor="blue"
            onPress={() => {
              Alert.alert("Функция пока не реализована");
            }}
          >
            <Text style={{ lineHeight: 18 }}>{"Чат с\n клиентом"}</Text>
          </AnimatedButton>
        </View>
        <View className="flex-1">
          <AnimatedButton
            className="p-4"
            bg="white"
            bgPressed="grayLight"
            icon="phone"
            iconColor="primary"
            textColor="primary"
            onPress={onPressCall}
          >
            <Text style={{ lineHeight: 18 }}>{"Позвонить \n клиенту"}</Text>
          </AnimatedButton>
        </View>
      </View>

      <AnimatedButton
        className="h-20"
        bg={mainButtonConfig.bg}
        bgPressed={mainButtonConfig.bgPressed}
        icon={mainButtonConfig.icon}
        iconColor="white"
        onPress={handleMainButton}
        isLoading={loadingType === "main"}
      >
        {mainButtonConfig.label}
      </AnimatedButton>

      <View className="flex-row gap-3">
        <View className="flex-1">
          <AnimatedButton
            className="w-full h-20 p-4"
            bg="yellow"
            bgPressed="yellowDark"
            icon="corner-down-right"
            iconColor="black"
            textColor="black"
            onPress={() => {
              Alert.alert("Функция пока не реализована");
            }}
          >
            Перенос
          </AnimatedButton>
        </View>

        <View className="flex-1">
          <AnimatedButton
            className="w-full h-20 p-4"
            bg="red"
            bgPressed="redDark"
            icon="x-circle"
            iconColor="white"
            textColor="white"
            isLoading={loadingType === "cancel"}
            onPress={handleCancel}
            disabled={isAssigned}
          >
            <Text style={{ lineHeight: 18 }}>{"Отменить \n принятое"}</Text>
          </AnimatedButton>
        </View>
      </View>
    </Layout>
  );
}
