import { View, Text, TouchableOpacity, TextInput } from "react-native";
import React from "react";
import Toast from "react-native-toast-message";

interface BVNStepProps {
  bvn: string;
  setBvn: (value: string) => void;
  onNext: () => void;
  onBack?: () => void;
}

const BVNStep: React.FC<BVNStepProps> = ({ bvn, setBvn, onNext, onBack }) => {
  const handleNext = () => {
    if (bvn) {
      onNext();
    } else {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Please enter your BVN",
      });
    }
  };

  return (
    <View>
      <View className="mb-6">
        <Text className="text-lg font-semibold text-black">
          BVN Verification
        </Text>
        <Text className="text-[#8E9BAE] mt-1 text-sm font-normal">
          Fill in your BVN number to link your account and complete your
          verification
        </Text>
        <Text className="text-red-500 mt-2 text-sm font-normal">
          *Required fields
        </Text>
      </View>
      <View>
        <TextInput
          className="border border-gray-300 rounded-lg p-3"
          placeholder="Enter BVN number"
          keyboardType="number-pad"
          value={bvn}
          onChangeText={setBvn}
          aria-label="bvn"
        />
      </View>
      <View className="mt-4 p-4 bg-gray-100 rounded-lg">
        <Text className="text-gray-700 mb-2 text-sm font-normal">
          Why we need your BVN
        </Text>
        <Text className="text-[#8E9BAE] text-sm font-normal">
          We use your BVN to ensure the account belongs to you. Your BVN does
          not give us access to your bank accounts and transactions.
        </Text>
        <Text className="text-[#8E9BAE] mt-2 text-sm font-normal">
          We only need access to your:
        </Text>
        <View className="mt-1 ml-4">
          <Text className="text-[#8E9BAE] text-sm font-normal">
            • <Text>Full name</Text>
          </Text>
          <Text className="text-[#8E9BAE] text-sm font-normal">
            • <Text>Phone number</Text>
          </Text>
          <Text className="text-[#8E9BAE] text-sm font-normal">
            • <Text>Date of birth</Text>
          </Text>
        </View>
      </View>
      <View className="flex-row gap-3 mt-6 mb-4">
        {onBack && (
          <TouchableOpacity
            className="flex-1 border border-green-500 rounded-lg p-4 items-center justify-center"
            onPress={onBack}
          >
            <Text className="text-green-500 font-bold text-base">Back</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          className="flex-1 bg-green-500 rounded-lg p-4 items-center justify-center"
          onPress={handleNext}
        >
          <Text className="text-white font-bold text-base">Continue</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default BVNStep;
