import { Loader } from "@/components/ui/Loader";
import {
  getCurrentMonthName,
  getCurrentMonthStart,
  getToday,
} from "@/utils/date";
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
  let status = "";
  let from: string | undefined;
  let to: string | undefined;
  let isDone = false;
  let isCompleted = false;

  const monthFrom = getCurrentMonthStart();
  const todayStr = getToday();

  switch (route.key) {
    case "assigned":
      status = `${ApplicationStatusId.ASSIGNED},${ApplicationStatusId.ACCEPTED},${ApplicationStatusId.ARRIVED}`;
      break;
    case "done":
      status = String(ApplicationStatusId.DONE);
      from = todayStr;
      to = todayStr;
      isDone = true;
      break;
    case "completed":
      status = String(ApplicationStatusId.COMPLETED);
      from = monthFrom;
      to = todayStr;
      isCompleted = true;
      break;
  }

  const [refreshing, setRefreshing] = useState(false);
  const { requests, isLoadingRequests, refetch } = useRequests(
    status,
    from,
    to,
  );
  const { doneRequests, refetchDoneRequests } = useDoneRequests({
    enabled: isDone,
  });
  const { completedRequests, refetchCompletedRequests } = useCompletedSummary({
    enabled: isCompleted,
  });

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

  if (isLoadingRequests) {
    return <Loader />;
  }

  switch (route.key) {
    case "assigned":
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
