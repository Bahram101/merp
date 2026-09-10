import SparePartActionSheet from "@/components/ui/actionsheet/SparePartActionSheet";
import { MatnrItem, SelectedMatnrItem } from "@/features/master/requests/types";
import { useActionSheet } from "@/providers/ActionSheetProvider";
import { useBottomSheet } from "@/providers/BottomSheet/AppBottomSheetProvider";
import * as Haptics from "expo-haptics";
import { CirclePlus } from "lucide-react-native";
import { Dispatch, SetStateAction, useEffect } from "react";
import { Pressable, Text, View } from "react-native";
import SparePartTable from "./SparePartTable";

type SparePartsProps = {
  data: MatnrItem[];
  selectedItems: SelectedMatnrItem[];
  setSelectedItems: Dispatch<SetStateAction<SelectedMatnrItem[]>>;
};

const SparePart = ({
  data,
  selectedItems,
  setSelectedItems,
}: SparePartsProps) => {
  const { showBottomSheet, updateModalProps } = useBottomSheet();
  const { openSheet, closeSheet } = useActionSheet();
  const selectedIds = selectedItems.map((i) => String(i.index));
  const totalAmount = selectedItems.reduce(
    (sum, item) => sum + item.totalPrice,
    0,
  );

  useEffect(() => {
    updateModalProps({
      selectedIds,
      selectedItems,
    });
  }, [selectedItems, selectedIds, updateModalProps]);

  const handleOpenSelectModal = () => {
    showBottomSheet(
      "spareParts",
      {
        data,
        selectedIds,
        selectedItems,
        handleAddPart,
      },
      { title: "Продажа запчастей", snapPoints: ["70%"] },
    );
  };

  const handleRemoveSparePart = (id: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const updated = selectedItems.filter((item) => item.index !== id);
    const updatedIds = updated.map((i) => String(i.index));
    setSelectedItems(updated);
    updateModalProps({ selectedSparePartIds: updatedIds });
  };

  const handleAddPart = (item: MatnrItem, qty: number) => {
    const preparedItem = {
      ...item,
      serviceTypeId: 3,
      selectedQty: qty,
      totalPrice: item.price * qty,
    };

    setSelectedItems((prev) => {
      const exists = prev.find((p) => p.index === item.index);

      const updated = exists
        ? prev.map((p) => (p.index === item.index ? preparedItem : p))
        : [...prev, preparedItem];

      return updated;
    });
  };

  const handlePress = (item: SelectedMatnrItem) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const existing = selectedItems?.find((p) => p.index === item.index);
    openSheet(
      <SparePartActionSheet
        item={item}
        isSelected={true}
        initialQty={existing?.selectedQty || 1}
        onAdd={(qty) => handleAddPart(item, qty)}
        closeSheet={closeSheet}
      />,
    );
  };

  return (
    <View className="bg-white rounded-2xl p-4">
      <View className="py-4 pt-2 border-b mb-4 border-grayLight flex-row justify-between items-center">
        <Text className="font-bold text-primary uppercase">
          Продажа запчастей
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

      <SparePartTable
        handlePress={handlePress}
        handleRemoveSparePart={handleRemoveSparePart}
        selectedItems={selectedItems}
        totalAmount={totalAmount}
      />
    </View>
  );
};

export default SparePart;
