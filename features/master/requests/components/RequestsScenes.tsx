import { Loader } from "@/components/ui/Loader";
import { getCurrentMonthName } from "@/utils/date";
import { Fragment, useState } from "react";
import { FlatList, Text, View } from "react-native";
import { ApplicationStatusId } from "../constants/status";
import {
  useCompletedSummary,
  useDoneRequests,
  useRequests,
} from "../hooks/useRequest";
import AssignedRequestCard from "./RequestCards/AssignedRequestCard";
import DoneRequestCard from "./RequestCards/DoneRequestCard";
import CompletedSummary from "./Summaries/CompletedSummary";

type Props = {
  route: { key: string };
};

export default function RequestsScenes({ route }: Props) {
  const isAssigned = route.key === "assigned";
  const isDone = route.key === "done";
  const isCompleted = route.key === "completed";

  const status = isAssigned
    ? `${ApplicationStatusId.ASSIGNED},${ApplicationStatusId.ACCEPTED},${ApplicationStatusId.ARRIVED}`
    : "";

  const [refreshing, setRefreshing] = useState(false);
  const { requests, isLoadingRequests, refetch } = useRequests(
    status,
    isAssigned,
  );
  const { doneRequests, isLoadingDoneRequests, refetchDoneRequests } =
    useDoneRequests({ enabled: isDone });
  const {
    completedRequests,
    refetchCompletedRequests,
    isLoading: isLoadingCompleted,
  } = useCompletedSummary({ enabled: isCompleted });

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      switch (route.key) {
        case "assigned":
          await refetch();
          break;
        case "done":
          await refetchDoneRequests();
          break;
        case "completed":
          await refetchCompletedRequests();
          break;
      }
    } finally {
      setRefreshing(false);
    }
  };

  const assignedReqList = [...requests].sort((a, b) => {
    const getPriority = (item: any) => {
      if (
        item.applicationStatusId === ApplicationStatusId.ACCEPTED ||
        item.applicationStatusId === ApplicationStatusId.ARRIVED
      )
        return 1;
      if (item.urgencyLevel) return 2;
      return 3;
    };
    return getPriority(a) - getPriority(b);
  });

  const style = {
    paddingBottom: 10,
    paddingHorizontal: 14,
  };

  switch (route.key) {
    case "assigned":
      if (isLoadingRequests) return <Loader />;
      return (
        <FlatList
          data={assignedReqList}
          renderItem={({ item }) => <AssignedRequestCard item={item} />}
          keyExtractor={(item) => item?.applicationNumber?.toString()}
          contentContainerStyle={style}
          onRefresh={onRefresh}
          refreshing={refreshing}
        />
      );
    case "done":
      if (isLoadingDoneRequests) return <Loader />;
      return (
        <FlatList
          data={doneRequests}
          renderItem={({ item }) => <DoneRequestCard item={item} />}
          keyExtractor={(item) => item.id?.toString()}
          contentContainerStyle={style}
          onRefresh={onRefresh}
          refreshing={refreshing}
        />
      );
    case "completed":
      if (isLoadingCompleted) return <Loader />;
      return (
        <Fragment>
          <View className="mx-4 mb-3">
            <Text className="text-xl font-semibold">
              Завершенные заявки с 1 {getCurrentMonthName()}
            </Text>
          </View>
          {/* <FlatList
            data={completedRequests || []}
            renderItem={({ item }) => <CompletedRequestCard item={item} />}
            keyExtractor={(item, index) => index.toString()}
            contentContainerStyle={style}
            onRefresh={onRefresh}
            refreshing={refreshing}
            ListFooterComponent={
              <CompletedSummary completedSummaryData={completedRequests} />
            }
          /> */}
          <CompletedSummary completedSummaryData={completedRequests} />
        </Fragment>
      );
    default:
      return null;
  }
}
