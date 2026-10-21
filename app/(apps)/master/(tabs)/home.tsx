import Banner from "@/components/ui/master/Banner";
import Header from "@/components/ui/master/Header";
import { ApplicationStatusId } from "@/features/master/requests/constants/status";
import RequestTypesToday from "@/features/master/requests/components/RequestTypesToday";
import { useRequests } from "@/features/master/requests/hooks/useRequest";
import React, { useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { RefreshControl } from "react-native-gesture-handler";

export default function Home() {
  const [refreshing, setRefreshing] = useState(false);

  const { requests, isLoadingRequests, refetch } = useRequests(
    String(ApplicationStatusId.ASSIGNED),
  );
  const { requests: doneReqCount, refetch: refetchDoneReqs } = useRequests(
    String(ApplicationStatusId.DONE),
  );
  const { requests: completedReqCount, refetch: refetchCompletedReqs } =
    useRequests(String(ApplicationStatusId.COMPLETED));

  const groupedRequestList = requests.reduce(
    (acc: any, item: any) => {
      const key = item.applicationTypeId;
      if (!acc[key]) {
        acc[key] = {
          id: key,
          title: item.applicationTypeName,
          count: 0,
        };
      }
      acc[key].count += 1;
      return acc;
    },
    {} as Record<number, { id: number; title: string; count: number }>,
  );

  const result = Object.values(groupedRequestList);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([refetch(), refetchDoneReqs(), refetchCompletedReqs()]);
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <View>
      <Header />
      <Banner
        style={{ marginTop: -55 }}
        isAssignedLoading={isLoadingRequests}
        assigned={requests.length}
        done={doneReqCount.length}
        completed={completedReqCount.length}
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 230 }}
        refreshControl={
          <RefreshControl
            tintColor="#fff"
            refreshing={refreshing}
            onRefresh={() => {
              onRefresh();
            }}
          />
        }
      >
        <View className="mt-5 flex-1 px-4">
          <Text className="text-2xl font-semibold mb-2">Виды заявки</Text>
          <RequestTypesToday
            requests={result}
            isLoadingRequests={isLoadingRequests}
          />
        </View>
      </ScrollView>
    </View>
  );
}
