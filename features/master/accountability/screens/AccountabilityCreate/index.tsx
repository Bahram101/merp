import SparePartActionSheet from "@/components/ui/actionsheet/SparePartActionSheet";
import AnimatedButton from "@/components/ui/button/AnimatedButton";
import Layout from "@/components/ui/master/Layout";
import { Textarea, TextareaInput } from "@/components/ui/textarea";
import { ROUTES } from "@/constants/routes";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useActionSheet } from "@/providers/ActionSheetProvider";
import { useBottomSheet } from "@/providers/BottomSheet/AppBottomSheetProvider";
import * as Haptics from "expo-haptics";
import { router, useFocusEffect, useNavigation } from "expo-router";
import { CirclePlus } from "lucide-react-native";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useCreateAccountability } from "../../hooks/useAccountability";
import { useMaterials } from "../../hooks/useMaterials";
import { CreateAccountabilityPayload, MaterialDto } from "../../types";
import MaterialsTable from "./components/MaterialsTable";

const CreateAccountabilityRequest = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const { openSheet, closeSheet } = useActionSheet();
  const { showBottomSheet, updateModalProps } = useBottomSheet();

  const { data } = useMaterials();
  const items = useMemo(
    () =>
      data.map((item: any) => ({
        ...item,
        matnrCode: item.code,
        availableQty: item.quantity,
        quantity: 0,
      })),
    [data],
  );
  const [formData, setFormData] = useState<
    Partial<CreateAccountabilityPayload>
  >({});
  const { createAccountability, isCreating } = useCreateAccountability();
  const [selectedItems, setSelectedItems] = useState<any[]>([]);
  const selectedIds = selectedItems.map((i) => String(i.matnr));

  useEffect(() => {
    navigation.setOptions({
      headerTitle: `Создание заявку`,
    });
  }, [navigation]);

  useEffect(() => {
    updateModalProps({
      selectedIds,
      selectedItems,
    });
  }, [selectedItems, selectedIds, updateModalProps]);

  useFocusEffect(
    useCallback(() => {
      return () => {
        setSelectedItems([]);
        setFormData({});
      };
    }, []),
  );

  const handleOpenSelectModal = () => {
    showBottomSheet(
      "materials",
      {
        loading: true,
        items: [],
      },
      { title: "Выбрать материалы", snapPoints: ["100%"] },
    );
    requestAnimationFrame(() => {
      updateModalProps({
        loading: false,
        items,
        selectedIds,
        selectedItems,
        handleAddMaterial,
      });
    });
  };

  const handleAddMaterial = (item: MaterialDto, qty: number) => {
    const preparedItem = {
      ...item,
      quantity: qty,
    };

    setSelectedItems((prev) => {
      const exists = prev.find((p) => p.matnr === item.matnr);
      const updated = exists
        ? prev.map((p) => (p.matnr === item.matnr ? preparedItem : p))
        : [...prev, preparedItem];
      return updated;
    });
  };

  const handleRemoveMaterial = (matnr: number) => {
    const updated = selectedItems.filter((item: any) => item.matnr !== matnr);
    const updatedIds = updated?.map((i: any) => String(i.matnr));
    setSelectedItems(updated);
    updateModalProps({ selectedServiceIds: updatedIds });
  };

  const handlePressOnRow = (item: MaterialDto) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const existing = selectedItems?.find((p) => p.matnr === item.matnr);
    openSheet(
      <SparePartActionSheet
        item={item}
        isSelected={true}
        initialQty={existing?.quantity || 1}
        onAdd={(qty) => handleAddMaterial(item, qty)}
        closeSheet={closeSheet}
      />,
    );
  };

  const handleSubmit = async () => {
    const bukrs = user?.userInfo?.bukrs?.[0]?.id;
    const branchId = user?.userInfo?.service?.[bukrs ?? ""]?.[0]?.value;
    const werksId = user?.userInfo?.werks?.[0]?.werksId;
    const responsibleId = user?.userInfo.currentStaff?.staffId;

    const payload = {
      ...formData,
      bukrs: String(bukrs),
      fromWerks: werksId,
      departmentId: 6,
      branchId,
      responsibleId,
      invoiceDate: new Date().toISOString().split("T")[0],
      items: selectedItems,
      customerId: formData.customerId ?? null,
      note: formData.note ?? "",
      toWerks: formData.toWerks ?? null,
      typeId: formData.typeId ?? null,
    };

    const created = await createAccountability(payload);

    router.push({
      pathname: ROUTES.ACCOUNTABILITY_DETAIL,
      params: { id: String(created.id), regNumber: created.regNumber },
    });
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={90}
    >
      <Layout>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            paddingBottom: 40,
            flexGrow: 1,
          }}
        >
          <View className="bg-white rounded-2xl p-4">
            <View className="pt-2 mb-4 py-3 border-b border-grayLight flex-row justify-between items-center ">
              <Text className="font-bold text-primary uppercase">
                Материалы
              </Text>
              <View>
                <Pressable
                  className="flex-1 text-center flex-row justify-center"
                  onPress={handleOpenSelectModal}
                >
                  <CirclePlus color="green" size={20} />
                </Pressable>
              </View>
            </View>
            <MaterialsTable
              selectedItems={selectedItems}
              handlePressOnRow={handlePressOnRow}
              handleRemoveMaterial={handleRemoveMaterial}
            />
          </View>
          <Textarea
            className="bg-white rounded-2xl border border-gray-200 px-2 py-1 my-4"
            size="md"
          >
            <TextareaInput
              placeholder="Примечание"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              className="text-base"
              value={formData.note}
              onChangeText={(value) =>
                setFormData((prev) => {
                  return {
                    ...prev,
                    note: value,
                  };
                })
              }
            />
          </Textarea>
          {selectedItems.length > 0 && (
            <AnimatedButton
              onPress={handleSubmit}
              isLoading={isCreating}
              className="w-full h-16 p-4"
              bg="primary"
              bgPressed="primaryDark"
              icon="check"
              iconColor="white"
              textColor="white"
            >
              Сохранить
            </AnimatedButton>
          )}
        </ScrollView>
      </Layout>
    </KeyboardAvoidingView>
  );
};

export default CreateAccountabilityRequest;
