import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { Keyboard, Text, TouchableWithoutFeedback, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

import BaseButton from "@/components/ui/button/BaseButton";
import BaseCheckbox from "@/components/ui/checkbox/BaseCheckbox";
import { Field } from "@/components/ui/input/Field";
import { Loader } from "@/components/ui/Loader";
import { useAuthMutations } from "@/features/auth/hooks/useAuthMutation";
import { useBottomSheet } from "@/providers/BottomSheet/AppBottomSheetProvider";
import { AuthFormData } from "@/types/auth.interface";

const Auth = () => {
  const { showBottomSheet } = useBottomSheet();
  const [accepted, setAccepted] = useState(false);
  const { control, reset, handleSubmit } = useForm<AuthFormData>({
    mode: "onChange",
    defaultValues: {
      username: "bolat.ab",
      password: "Almaty0220bv",
    },
  });
  const { loginSync, isLoading } = useAuthMutations(reset);

  const onSubmit: SubmitHandler<AuthFormData> = (data) => {
    loginSync(data);
  };

  const handleOpenModal = () => {
    showBottomSheet(
      "policy",
      {
        loading: true,
        items: [],
      },
      {
        title: "Политика конфиденциальности",
        snapPoints: ["90%"],
      },
    );
  };

  return (
    <KeyboardAwareScrollView
      contentContainerStyle={{ flexGrow: 1 }}
      enableOnAndroid
      extraScrollHeight={20}
      keyboardShouldPersistTaps="handled"
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View className="flex-1 items-center justify-center bg-white px-4">
          <View className="w-10/12 max-w-md">
            {isLoading ? (
              <Loader />
            ) : (
              <View className="flex-col gap-4">
                <Text className="text-2xl text-center">Войти</Text>

                <Field<AuthFormData>
                  className="rounded-3xl"
                  placeholder="Введите логин"
                  keyboardType="email-address"
                  control={control}
                  name="username"
                  rules={{
                    required: "Логин обязателен!",
                    minLength: {
                      value: 3,
                      message: "Пожалуйста, введите не менее 3 символов",
                    },
                  }}
                />

                <Field<AuthFormData>
                  className="rounded-3xl"
                  placeholder="Введите пароль"
                  control={control}
                  name="password"
                  secureTextEntry
                  rules={{
                    required: "Пароль обязателен!",
                    minLength: {
                      value: 6,
                      message: "Пожалуйста, введите не менее 6 символов",
                    },
                  }}
                />

                <View className="flex-row items-center gap-3">
                  <BaseCheckbox
                    value="accepted"
                    checked={accepted}
                    onChange={setAccepted}
                  />

                  <Text className="flex-1 text-sm leading-5">
                    Я принимаю{" "}
                    <Text
                      style={{
                        color: "#2563EB",
                        textDecorationLine: "underline",
                      }}
                      onPress={() => handleOpenModal()}
                    >
                      Политику конфиденциальности
                    </Text>
                  </Text>
                </View>

                <View className="items-center">
                  <BaseButton
                    disabled={!accepted}
                    className="text-white rounded-3xl h-[45px] w-[150px]"
                    onPress={handleSubmit(onSubmit)}
                  >
                    Войти
                  </BaseButton>
                </View>
              </View>
            )}
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAwareScrollView>
  );
};

export default Auth;
