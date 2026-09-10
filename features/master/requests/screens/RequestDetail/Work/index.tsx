import AnimatedButton from "@/components/ui/button/AnimatedButton";
import { Loader } from "@/components/ui/Loader";
import Layout from "@/components/ui/master/Layout";
import { ROUTES } from "@/constants/routes";
import { usePreventBack } from "@/hooks/usePreventBack";
// import { request } from "@/services/api/request";
import { useQueryClient } from "@tanstack/react-query";
import { router, useLocalSearchParams, useNavigation } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, View } from "react-native";
import { ApplicationStatusId } from "../../../constants/status";
import { useMatnr } from "../../../hooks/useMatnr";
import { useUpdateRequestStatus } from "../../../hooks/useRequest";
import {
  useCheckServices,
  useServiceApplication,
  useServices,
} from "../../../hooks/useService";
import { SelectedMatnrItem, ServiceItem } from "../../../types";
import Cartridges from "./components/Cartridges";
import Services from "./components/Services";
import SpareParts from "./components/SpareParts";

const RequestWorkScreen = () => {
  const queryClient = useQueryClient();
  const { appNumber } = useLocalSearchParams();
  const navigation = useNavigation();
  const { serviceApplication } = useServiceApplication(Number(appNumber));
  const { updateRequestStatus, isLoading: loading } = useUpdateRequestStatus();

  const { services, isLoading } = useServices();
  const [selectedServiceItems, setSelectedServiceItems] = useState<
    ServiceItem[]
  >([]);
  const [selectedSpareItems, setSelectedSpareItems] = useState<
    SelectedMatnrItem[]
  >([]);
  const [selectedCartridgeItems, setSelectedCartridgeItems] = useState<
    SelectedMatnrItem[]
  >([]);

  const { checkServiceAsync, isLoading: isLoadingCheckService } =
    useCheckServices();
  const [filteredServList, setFilteredServList] = useState<ServiceItem[]>([]);
  const { data: matnrList } = useMatnr(3, serviceApplication.tovarId);
  const { data: cartridgeList } = useMatnr(1, serviceApplication.tovarId);

  useEffect(() => {
    if (services.length > 0) {
      setFilteredServList(
        services.filter((item) => !["1", "3", "4", "7"].includes(item.id)),
      );
    }
  }, [services, setFilteredServList]);

  useEffect(() => {
    if (appNumber) {
      navigation.setOptions({
        headerTitle: `Заявка №${String(appNumber)}`,
      });
    }
  }, [navigation, appNumber]);

  useEffect(() => {
    navigation.setOptions({
      gestureEnabled: false,
    });
  }, [navigation]);

  usePreventBack(ROUTES.REQUESTS);

  // console.log("serviceApplication", serviceApplication);

  if (isLoading) {
    return <Loader />;
  }

  const handleCheck = async () => {
    // if (!request) return;

    const mapServiceItem = (item: any) => {
      return {
        currencyId: 3,
        currencyName: "KZT",
        fno: null,
        id: null,
        matnrId: null,
        matnrName: null,
        matnrPrice: null,
        operationId: null,
        operationName: null,
        quantity: null,
        serviceId: null,
        servicePackageId: null,
        servicePackageName: null,
        serviceTypeId: Number(item.id),
        serviceTypeName: null,
        sum: item.price || 0,
        warranty: item.warranty || false,
      };
    };

    const mapSpareItem = (item: any) => ({
      currencyId: 3,
      currencyName: "KZT",
      fno: item.fno,
      id: null,
      matnrId: item.matnrId,
      matnrName: item.matnrName,
      matnrPrice: item.price,
      operationId: item.operationId,
      operationName: item.operationName,
      quantity: item.selectedQty,
      serviceId: null,
      servicePackageId: null,
      servicePackageName: null,
      serviceTypeId: Number(item.serviceTypeId),
      serviceTypeName: item.name,
      sum: item.totalPrice,
      warranty: item.warranty,
    });

    const spareItems = [...selectedSpareItems, ...selectedCartridgeItems];

    const payload = {
      ...serviceApplication,
      positions: [
        ...selectedServiceItems.map(mapServiceItem),
        ...spareItems.map(mapSpareItem),
      ],
    };

    try {
      const res = await checkServiceAsync(payload);
      queryClient.setQueryData(["check-service-result"], res);
      router.push({
        pathname: ROUTES.PAYMENT,
        params: { appNumber: String(appNumber) },
      });
    } catch (e: any) {
      Alert.alert("Ошибка", e.message);
    }
  };

  const handleCancel = async () => {
    try {
      await updateRequestStatus(
        {
          reqId: Number(appNumber),
          statusId: ApplicationStatusId.ASSIGNED,
        },
        {
          onSuccess: () => {
            router.dismissTo({
              pathname: ROUTES.REQUESTS,
            });
          },
        },
      );
    } catch (error: any) {
      Alert.alert("Ошибка", error.message);
    }
  };

  return (
    <Layout className="flex-columns gap-4">
      <Services
        matnrId={serviceApplication.tovarId}
        data={filteredServList}
        selectedItems={selectedServiceItems}
        setSelectedItems={setSelectedServiceItems}
      />
      <SpareParts
        data={matnrList}
        selectedItems={selectedSpareItems}
        setSelectedItems={setSelectedSpareItems}
      />
      <Cartridges
        data={cartridgeList}
        selectedItems={selectedCartridgeItems}
        setSelectedItems={setSelectedCartridgeItems}
      />
      <View className="flex-1">
        <AnimatedButton
          className="w-full p-4"
          bg="primary"
          bgPressed="primaryDark"
          textColor="white"
          isLoading={isLoadingCheckService}
          onPress={handleCheck}
        >
          Проверить
        </AnimatedButton>
      </View>
      <View className="flex-1">
        <AnimatedButton
          className="w-full p-4"
          bg="red"
          bgPressed="redDark"
          textColor="white"
          onPress={handleCancel}
          isLoading={loading}
        >
          Отменить прибытие
        </AnimatedButton>
      </View>
    </Layout>
  );
};

export default RequestWorkScreen;
