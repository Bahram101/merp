import Layout from "@/components/ui/master/Layout";
import { ROUTES } from "@/constants/routes";
import { useCashBankHkonts } from "@/features/master/requests/hooks/useFinance";
import { useCreatePayment } from "@/features/master/requests/hooks/useService";
import { groupPaymentItems } from "@/features/master/utils/payment.helpers";
import { getToday } from "@/utils/date";
import { useQueryClient } from "@tanstack/react-query";
import { router, useNavigation } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Alert } from "react-native";
import PaymentMethods from "./components/PaymentMethods";
import PaymentSummary from "./components/PaymentSummary";

type CheckServiceResponse = {
  applicationNumber: string;
  sumForPay: number;
  currencyName: string;
  positions: any[];
};

const PaymentScreen = () => {
  const navigation = useNavigation();
  const queryClient = useQueryClient();
  const [method, setMethod] = useState<"cash" | "cashless">("cash");
  const [isSplit, setIsSplit] = useState(false);
  const { createPaymentAsync, isPaymentLoading } = useCreatePayment();
  const { cashBankHkonts, isLoadingCashBankHkonts } = useCashBankHkonts();
  const [lastChanged, setLastChanged] = useState<
    "cashVal" | "cashlessVal" | null
  >(null);
  const { control, handleSubmit, setValue, watch } = useForm({
    mode: "onChange",
    defaultValues: {
      cashVal: "",
      cashlessVal: "",
    },
  });

  const cashRegister = cashBankHkonts.find((item) =>
    String(item.value).startsWith("1010"),
  );

  const cashVal = watch("cashVal");
  const cashlessVal = watch("cashlessVal");

  useEffect(() => {
    if (!isSplit || lastChanged !== "cashVal") return;

    if (!cashVal) {
      setValue("cashlessVal", "");
      return;
    }

    const rest = sumForPay - Number(cashVal);
    setValue("cashlessVal", rest >= 0 ? String(rest) : "0");
  }, [cashVal, lastChanged]);

  useEffect(() => {
    if (!isSplit || lastChanged !== "cashlessVal") return;

    if (!cashlessVal) {
      setValue("cashVal", "");
      return;
    }

    const rest = sumForPay - Number(cashlessVal);
    setValue("cashVal", rest >= 0 ? String(rest) : "0");
  }, [cashlessVal, lastChanged]);

  const data = queryClient.getQueryData<CheckServiceResponse>([
    "check-service-result",
  ]);

  const sumForPay = data?.sumForPay || 0;
  const serviceAllList = data?.positions;
  const currencyName = data?.currencyName || "";

  const { services, spareParts, cartridges } = useMemo(
    () => groupPaymentItems(serviceAllList),
    [serviceAllList],
  );

  useEffect(() => {
    const appNumber = data?.applicationNumber;
    if (appNumber) {
      navigation.setOptions({
        title: `Заявка №${appNumber}`,
      });
    }
  }, [navigation, data]);

  const handlePay = async (values: {
    cashVal: string;
    cashlessVal: string;
  }) => {
    const appNumber = data?.applicationNumber;
    if (!appNumber) return;

    if (!isSplit) {
      if (method === "cash" && !cashRegister) {
        Alert.alert("Ошибка", "Касса филиала не найдена");
        return;
      }

      const payload = {
        ...data,
        paymentParts: [
          {
            amount: sumForPay,
            hkont: method === "cash" ? cashRegister!.value : 10300220,
            paymentType: method === "cash" ? "CASH" : "CASHLESS",
            paymentNumber: "",
            date: getToday(),
          },
        ],
      };

      if (method === "cash") {
        try {
          await createPaymentAsync(payload);
          router.push({
            pathname: ROUTES.PAYMENT_SUCCESS,
          });
        } catch (e: any) {
          Alert.alert("Ошибка", e.message);
        }
        return;
      }

      if (method === "cashless") {
        queryClient.setQueryData(["qr-payment"], payload);
        router.push({
          pathname: ROUTES.QR_PAYMENT,
          params: {
            appNumber: String(payload.applicationNumber),
            method,
          },
        });
      }
    } else {
      const cashAmount = Number(values.cashVal) || 0;
      const cashlessAmount = Number(values.cashlessVal) || 0;

      if (cashAmount + cashlessAmount !== sumForPay) {
        Alert.alert("Ошибка", `Сумма должна равняться ${sumForPay}`);
        return;
      }

      if (cashAmount > 0 && !cashRegister) {
        Alert.alert("Ошибка", "Касса филиала не найдена");
        return;
      }

      const paymentParts = [
        cashAmount > 0
          ? {
              amount: cashAmount,
              hkont: cashRegister!.value,
              paymentType: "CASH",
              paymentNumber: "",
              date: getToday(),
            }
          : null,
        cashlessAmount > 0
          ? {
              amount: cashlessAmount,
              hkont: 10300220,
              paymentType: "CASHLESS",
              paymentNumber: "",
              date: getToday(),
            }
          : null,
      ].filter((part) => part !== null);

      const payload = { ...data, paymentParts };

      // Bitta qism 0 bo'lsa, bu aralash to'lov emas — oddiy bitta usul kabi yuboriladi
      if (cashlessAmount === 0) {
        try {
          await createPaymentAsync(payload);
          router.push({
            pathname: ROUTES.PAYMENT_SUCCESS,
          });
        } catch (e: any) {
          Alert.alert("Ошибка", e.message);
        }
        return;
      }

      try {
        queryClient.setQueryData(["qr-payment-split"], payload);
        router.push({
          pathname: ROUTES.QR_PAYMENT,
          params: {
            appNumber: String(payload.applicationNumber),
            isSplit: String(isSplit),
          },
        });
      } catch (e: any) {
        Alert.alert("Ошибка", e.message);
      }
    }
  };

  return (
    <Layout>
      <PaymentSummary
        services={services || []}
        spareParts={spareParts || []}
        cartridges={cartridges || []}
        total={sumForPay}
      />
      <PaymentMethods
        currencyName={currencyName}
        total={sumForPay}
        isPaymentLoading={isPaymentLoading || isLoadingCashBankHkonts}
        method={method}
        control={control}
        isSplit={isSplit}
        setIsSplit={setIsSplit}
        handleSubmit={handleSubmit}
        setMethod={setMethod}
        handlePay={handlePay}
        setLastChanged={setLastChanged}
      />
    </Layout>
  );
};

export default PaymentScreen;
