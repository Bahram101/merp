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
  useDoneRequests,
  useFinishedSummary,
  useRequests,
} from "../hooks/useRequest";
import AssignedRequestCard from "./RequestCards/AssignedRequestCard";
import DoneRequestCard from "./RequestCards/DoneRequestCard";
import FinishedSummary from "./Summaries/FinishedSummary";

type Props = {
  route: { key: string };
};

export default function RequestsScenes({ route }: Props) {
  let status = "";
  let from: string | undefined;
  let to: string | undefined;
  let isDone = false;
  let isFinished = false;

  const monthFrom = getCurrentMonthStart();
  const todayStr = getToday();

  switch (route.key) {
    case "assigned":
      status = "2,9,10";
      break;
    case "done":
      status = "8";
      from = todayStr;
      to = todayStr;
      isDone = true;
      break;
    case "finished":
      status = "5";
      from = monthFrom;
      to = todayStr;
      isFinished = true;
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
  const { finishedRequests, refetchFinishedRequests } = useFinishedSummary({
    enabled: isFinished,
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
        case "finished":
          await refetchFinishedRequests();
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
    case "finished":
      return (
        <Fragment>
          <View className="mx-4 mb-3">
            <Text className="text-xl font-semibold">
              Завершенные заявки с 1 {getCurrentMonthName()}
            </Text>
          </View>
          {/* <FlatList
            data={finishedRequests || []}
            renderItem={({ item }) => <FinishedRequestCard item={item} />}
            keyExtractor={(item, index) => index.toString()}
            contentContainerStyle={style}
            onRefresh={onRefresh}
            refreshing={refreshing}
            ListFooterComponent={
              <FinishedSummary finishedSummaryData={finishedRequests} />
            }
          /> */}
          <FinishedSummary finishedSummaryData={finishedRequests} />
        </Fragment>
      );
    default:
      return null;
  }
}
