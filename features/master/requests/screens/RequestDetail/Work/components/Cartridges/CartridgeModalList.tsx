import { MatnrItem, SelectedMatnrItem } from "@/features/master/requests/types";
import { BottomSheetFlatList } from "@gorhom/bottom-sheet";
import CartridgeModalListItem from "./CartridgeModalListItem";

type Props = {
  data: MatnrItem[];
  selectedIds: string[];
  selectedItems: SelectedMatnrItem[];
  handleAddPart: (item: MatnrItem, qty: number) => void;
};

const SparePartModalList = ({
  data,
  selectedIds = [],
  selectedItems,
  handleAddPart,
}: Props) => {
  return (
    <BottomSheetFlatList
      data={data}
      keyExtractor={(item: any) => item.matnrId.toString()}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{ paddingBottom: 40 }}
      renderItem={({ item, index }: { item: MatnrItem; index: number }) => (
        <CartridgeModalListItem
          item={item}
          isLast={index === data.length - 1}
          isSelected={selectedIds.includes(String(item.matnrId))}
          selectedItems={selectedItems}
          onAddPart={handleAddPart}
        />
      )}
    />
  );
};

export default SparePartModalList;
