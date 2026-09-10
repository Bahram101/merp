import { Loader } from "@/components/ui/Loader";
import Layout from "@/components/ui/master/Layout";
import { ROUTES } from "@/constants/routes";
import { router, useLocalSearchParams, useNavigation } from "expo-router";
import { useEffect } from "react";
import { View } from "react-native";
import { useHistories } from "../../../hooks/useHistory";
import HistoryList from "./components/HistoryList";
type Params = {
  contractNumber?: string;
  appNumber?: string;
};
export default function HistoryListScreen() {
  const navigation = useNavigation();
  const { contractNumber, appNumber } = useLocalSearchParams<Params>();
  const contractNum = contractNumber ? Number(contractNumber) : undefined;
  const { historyList, isLoading } = useHistories(contractNum!);

  useEffect(() => {
    navigation.setOptions({
      headerTitle: `Список истории обсл.`,
    });
  }, [navigation]);

  if (isLoading) {
    return <Loader />;
  }

  const groupedByServiceId = historyList.data.reduce(
    (acc: Record<number, any>, item: any) => {
      const key = item.serviceId;
      if (!acc[key]) {
        acc[key] = item;
      }
      return acc;
    },
    {},
  );

  const sortByDate = Object.values(groupedByServiceId).sort(
    (a: any, b: any) =>
      new Date(b.crmHistoryDate).getTime() -
      new Date(a.crmHistoryDate).getTime(),
  );

  return (
    <Layout>
      <View className="bg-white rounded-2xl p-4">
        <HistoryList
          data={sortByDate || []}
          onPressItem={(item) => {
            router.push({
              pathname: ROUTES.REQUEST_HISTORY_DETAIL,
              params: {
                appNumber: Number(appNumber),
                serviceId: Number(item.serviceId),
              },
            });
          }}
        />
      </View>
    </Layout>
  );
}
