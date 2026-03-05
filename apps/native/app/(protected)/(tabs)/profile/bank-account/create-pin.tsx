import {
  Image,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import React, { useState, useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { ICONS } from "@/constants";
import { router } from "expo-router";
import { useQuery, useMutation } from "@tanstack/react-query";
import { orpc } from "@/utils/orpc";
import Toast from "react-native-toast-message";
import Loader from "@/components/loader";

const CreatePin = () => {
  const [step, setStep] = useState<"old" | "create" | "confirm" | "success">(
    "create"
  );
  const [oldPin, setOldPin] = useState("");
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [firstPin, setFirstPin] = useState("");

  const { data: hasPin, isPending: isHasPinPending } = useQuery(
    orpc.finance.pin.hasPin.queryOptions({
      queryKey: ["pin", "has-pin"],
    })
  );

  const setPinMutation = useMutation(
    orpc.finance.pin.setPin.mutationOptions({
      onSuccess: () => {
        Toast.show({
          type: "success",
          text1: "PIN set successfully",
        });
        setStep("success");
        setTimeout(() => {
          router.back();
        }, 2000);
      },
      onError: (error) => {
        Toast.show({
          type: "error",
          text1: "Failed to set PIN",
          text2: error.message,
        });
        setPin("");
        setConfirmPin("");
        setFirstPin("");
        setStep(hasPin ? "old" : "create");
      },
    })
  );

  const changePinMutation = useMutation(
    orpc.finance.pin.changePin.mutationOptions({
      onSuccess: () => {
        Toast.show({
          type: "success",
          text1: "PIN changed successfully",
        });
        setStep("success");
        setTimeout(() => {
          router.back();
        }, 2000);
      },
      onError: (error) => {
        Toast.show({
          type: "error",
          text1: "Failed to change PIN",
          text2: error.message,
        });
        setOldPin("");
        setPin("");
        setConfirmPin("");
        setFirstPin("");
        setStep("old");
      },
    })
  );

  useEffect(() => {
    if (!isHasPinPending && hasPin !== undefined) {
      setStep(hasPin ? "old" : "create");
    }
  }, [hasPin, isHasPinPending]);

  const handlePinInput = (digit: string) => {
    let currentPin: string;
    let setCurrentPin: (value: string) => void;

    if (step === "old") {
      currentPin = oldPin;
      setCurrentPin = setOldPin;
    } else if (step === "create") {
      currentPin = pin;
      setCurrentPin = setPin;
    } else {
      currentPin = confirmPin;
      setCurrentPin = setConfirmPin;
    }

    if (digit === "delete") {
      setCurrentPin(currentPin.slice(0, -1));
    } else if (currentPin.length < 4) {
      const newPin = currentPin + digit;
      setCurrentPin(newPin);

      if (newPin.length === 4) {
        setTimeout(() => {
          if (step === "old") {
            setStep("create");
            setPin("");
          } else if (step === "create") {
            setFirstPin(newPin);
            setStep("confirm");
            setConfirmPin("");
          } else if (step === "confirm") {
            if (newPin === firstPin) {
              if (hasPin) {
                changePinMutation.mutate({
                  oldPin: oldPin,
                  newPin: firstPin,
                  confirmNewPin: newPin,
                });
              } else {
                setPinMutation.mutate({
                  pin: firstPin,
                  confirmPin: newPin,
                });
              }
            } else {
              Toast.show({
                type: "error",
                text1: "PINs don't match",
                text2: "Please try again",
              });
              setConfirmPin("");
              setPin("");
              setFirstPin("");
              setStep(hasPin ? "old" : "create");
            }
          }
        }, 300);
      }
    }
  };

  const renderPinDots = () => {
    let currentPin: string;
    if (step === "old") {
      currentPin = oldPin;
    } else if (step === "create") {
      currentPin = pin;
    } else {
      currentPin = confirmPin;
    }

    return (
      <View className="flex-row justify-center gap-4 mb-12">
        {[0, 1, 2, 3].map((index) => (
          <View
            key={index}
            className={`w-12 h-12 rounded-full border-2 ${
              index < currentPin.length
                ? "bg-[#19B360] border-[#19B360]"
                : "border-gray-300"
            }`}
          />
        ))}
      </View>
    );
  };

  const keypadButtons = [
    ["1", "2", "3"],
    ["4", "5", "6"],
    ["7", "8", "9"],
    ["*", "0", "delete"],
  ];

  const getTitle = () => {
    switch (step) {
      case "old":
        return "Enter Current PIN";
      case "create":
        return hasPin ? "Enter New Transaction PIN" : "Enter Transaction PIN";
      case "confirm":
        return hasPin
          ? "Confirm New Transaction PIN"
          : "Confirm Transaction PIN";
      case "success":
        return hasPin ? "PIN Changed Successfully" : "PIN Created Successfully";
      default:
        return hasPin ? "Change Transaction PIN" : "Create Transaction PIN";
    }
  };

  const getSubtitle = () => {
    switch (step) {
      case "old":
        return "Please enter your current 4-digit PIN";
      case "create":
        return "Please enter your 4-digit PIN";
      case "confirm":
        return "Please re-enter your 4-digit PIN";
      case "success":
        return hasPin
          ? "Your transaction PIN has been changed successfully"
          : "Your transaction PIN has been created successfully";
      default:
        return "";
    }
  };

  if (isHasPinPending) {
    return (
      <View className="flex-1 bg-white h-full">
        <StatusBar style="light" />
        <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
          <View className="flex-row justify-between items-center px-6 py-4 border-b border-gray-100 bg-white">
            <TouchableOpacity onPress={() => router.back()}>
              <Image
                source={ICONS.arrowLeft}
                className="w-auto h-5 text-black"
                resizeMode="contain"
              />
            </TouchableOpacity>
            <Text className="text-black text-xl font-bold">
              Transaction PIN
            </Text>
            <View></View>
          </View>
          <Loader />
        </SafeAreaView>
      </View>
    );
  }

  if (step === "success") {
    return (
      <View className="flex-1 bg-white h-full">
        <StatusBar style="light" />
        <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
          <View className="flex-row justify-between items-center px-6 py-4 border-b border-gray-100 bg-white">
            <TouchableOpacity onPress={() => router.back()}>
              <Image
                source={ICONS.arrowLeft}
                className="w-auto h-5 text-black"
                resizeMode="contain"
              />
            </TouchableOpacity>
            <Text className="text-black text-xl font-bold">
              Transaction PIN
            </Text>
            <View></View>
          </View>

          <View className="flex-1 justify-center items-center px-6">
            <View className="w-20 h-20 bg-[#19B360] rounded-full items-center justify-center mb-8">
              <Text className="text-white text-3xl">✓</Text>
            </View>

            <Text className="text-black text-2xl font-bold text-center mb-4">
              {getTitle()}
            </Text>

            <Text className="text-[#8E9BAE] text-base text-center mb-8">
              {getSubtitle()}
            </Text>

            <Text className="text-[#8E9BAE] text-sm text-center">
              Redirecting you back...
            </Text>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white h-full">
      <StatusBar style="light" />
      <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
        <View className="flex-row items-center px-6 py-4 border-b border-gray-100 bg-white">
          <TouchableOpacity onPress={() => router.back()}>
            <Image
              source={ICONS.arrowLeft}
              className="w-auto h-5 text-black"
              resizeMode="contain"
            />
          </TouchableOpacity>
          <Text className="text-black text-xl font-bold text-center flex-1">
            {hasPin ? "Change Transaction PIN" : "Create Transaction PIN"}
          </Text>
        </View>

        <View className="flex-1 px-6 py-8">
          <View className="pt-8">
            <Text className="text-black text-2xl font-bold text-center mb-4">
              {getTitle()}
            </Text>

            <Text className="text-[#8E9BAE] text-base text-center mb-12">
              {getSubtitle()}
            </Text>

            {renderPinDots()}
          </View>

          <View className="flex-1 justify-end pb-12">
            <View className="space-y-4 mb-4">
              {keypadButtons.map((row, rowIndex) => (
                <View key={rowIndex} className="flex-row justify-around">
                  {row.map((button) => (
                    <TouchableOpacity
                      key={button}
                      onPress={() => handlePinInput(button)}
                      className="w-16 h-16 justify-center items-center"
                    >
                      {button === "delete" ? (
                        <Image
                          source={require("@/assets/icons/delete.png")}
                          className="w-8 h-8"
                          resizeMode="contain"
                        />
                      ) : (
                        <Text className="text-3xl font-bold text-black">
                          {button}
                        </Text>
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              ))}
            </View>

            <View className="flex-row justify-center items-center">
              <View className="w-6 h-6 bg-gray-300 rounded-full mr-2 justify-center items-center">
                <Text className="text-white text-xs font-bold">?</Text>
              </View>
              <Text className="text-gray-500">Forgot PIN? </Text>
              <TouchableOpacity>
                <Text className="text-[#19B360] font-semibold">Reset PIN</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
        {(changePinMutation.isPending || setPinMutation.isPending) && (
          <View className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <View className="bg-white rounded-[10px] p-6 flex items-center justify-center">
              <ActivityIndicator size="large" color="#19B360" />
              <Text className="text-[#161616] font-semibold text-base mt-4">
                {changePinMutation.isPending
                  ? "Changing PIN..."
                  : setPinMutation.isPending
                    ? "Setting PIN..."
                    : "Creating PIN..."}
              </Text>
            </View>
          </View>
        )}
      </SafeAreaView>
    </View>
  );
};

export default CreatePin;
