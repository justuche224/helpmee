import { View, Text, TouchableOpacity, ScrollView, Image } from "react-native";
import React from "react";
import checkmark from "@/assets/icons/profile/checkmark.png";
import edit from "@/assets/icons/edit.png";
import trash from "@/assets/icons/trash.png";

interface ReviewStepProps {
  fullName: string;
  phone: string;
  email: string;
  identityType: string | null;
  idNumber: string;
  documentFront: string;
  documentBack: string;
  selfie: string;
  bvn: string;
  onEditPersonal: () => void;
  onEditBVN: () => void;
  onSubmit: () => void;
  setDocumentFront: (value: string) => void;
  setDocumentBack: (value: string) => void;
  setSelfie: (value: string) => void;
  isLoading?: boolean;
}

const ReviewStep: React.FC<ReviewStepProps> = ({
  fullName,
  phone,
  email,
  identityType,
  idNumber,
  documentFront,
  documentBack,
  selfie,
  bvn,
  onEditPersonal,
  onEditBVN,
  onSubmit,
  setDocumentFront,
  setDocumentBack,
  setSelfie,
  isLoading = false,
}) => {
  const DocumentCard = ({
    document,
    title,
    onRemove,
  }: {
    document: string;
    title: string;
    onRemove: () => void;
  }) => {
    if (!document) return null;

    return (
      <View>
        <Text className="text-xs text-gray-500 mb-2">{title}</Text>
        <View className="flex-row items-center justify-between p-2 bg-gray-50 rounded-lg">
          <View className="flex-row items-center gap-x-3">
            <Image
              source={{ uri: document }}
              className="w-12 h-12 rounded-lg"
              resizeMode="cover"
            />
            <View>
              <Text className="text-sm font-medium">{title} Selected</Text>
              <Text className="text-xs text-gray-500">
                Image ready for upload
              </Text>
            </View>
          </View>
          <TouchableOpacity onPress={onRemove}>
            <Image source={trash} className="w-5 h-5" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View>
      <View className="mb-6">
        <Text className="text-lg font-semibold text-black">
          Application Review
        </Text>
        <Text className="text-[#8E9BAE] mt-1 text-sm font-normal">
          Verify if the information you filled is correct.
        </Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} className="mb-16">
        <View className="border border-gray-200 rounded-lg p-4 mb-6">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-base font-semibold">
              Personal Identity verification
            </Text>
            <TouchableOpacity onPress={onEditPersonal}>
              <Image source={edit} className="w-5 h-5" />
            </TouchableOpacity>
          </View>
          <View className="gap-y-4">
            <View>
              <Text className="text-xs text-gray-500">Full name</Text>
              <Text className="text-sm font-medium">{fullName}</Text>
            </View>
            <View>
              <Text className="text-xs text-gray-500">Phone number</Text>
              <Text className="text-sm font-medium">+234-{phone}</Text>
            </View>
            <View>
              <Text className="text-xs text-gray-500">Email address</Text>
              <Text className="text-sm font-medium">{email}</Text>
            </View>
            <View>
              <Text className="text-xs text-gray-500">Identity type</Text>
              <Text className="text-sm font-medium">{identityType}</Text>
            </View>
            <View>
              <Text className="text-xs text-gray-500">ID number</Text>
              <View className="flex-row justify-between items-center">
                <Text className="text-sm font-medium">{idNumber}</Text>
                <Image source={checkmark} className="w-5 h-5" />
              </View>
            </View>

            <DocumentCard
              document={documentFront}
              title="Document Front"
              onRemove={() => setDocumentFront("")}
            />

            <DocumentCard
              document={documentBack}
              title="Document Back"
              onRemove={() => setDocumentBack("")}
            />

            <DocumentCard
              document={selfie}
              title="Selfie Photo"
              onRemove={() => setSelfie("")}
            />
          </View>
        </View>

        <View className="border border-gray-200 rounded-lg p-4 mb-6">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-base font-semibold">BVN verification</Text>
            <TouchableOpacity onPress={onEditBVN}>
              <Image source={edit} className="w-5 h-5" />
            </TouchableOpacity>
          </View>
          <View>
            <Text className="text-xs text-gray-500">BVN number</Text>
            <Text className="text-sm font-medium">{bvn}</Text>
          </View>
        </View>

        <TouchableOpacity
          className={`rounded-lg p-4 items-center justify-center mt-6 mb-4 ${
            isLoading ? "bg-gray-400" : "bg-green-500"
          }`}
          onPress={onSubmit}
          disabled={isLoading}
        >
          <Text className="text-white font-bold text-base">
            {isLoading ? "Submitting..." : "Submit"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default ReviewStep;
