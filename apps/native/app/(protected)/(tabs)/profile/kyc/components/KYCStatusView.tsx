import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  Modal,
} from "react-native";
import React, { useState } from "react";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { ICONS } from "@/constants";
import { router } from "expo-router";
import menuHorizontal from "@/assets/icons/menu-horizontal.png";

interface KYCData {
  status: "PENDING" | "APPROVED" | "REJECTED";
  name?: string;
  phoneNumber?: string;
  email?: string;
  identificationType?: string;
  identificationNumber?: string;
  identificationRejectionReason?: string | null;
  createdAt?: Date;
}

interface BVNData {
  bvnStatus: "PENDING" | "APPROVED" | "REJECTED";
  bvn?: string;
  bvnRejectionReason?: string | null;
}

interface KYCStatusViewProps {
  kycData: KYCData;
  bvnData?: BVNData;
}

const KYCStatusView: React.FC<KYCStatusViewProps> = ({ kycData, bvnData }) => {
  const [showStatusMenu, setShowStatusMenu] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "text-green-500";
      case "PENDING":
        return "text-yellow-500";
      case "REJECTED":
        return "text-red-500";
      default:
        return "text-gray-500";
    }
  };

  const getStatusBackground = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "bg-green-500";
      case "PENDING":
        return "bg-yellow-500";
      case "REJECTED":
        return "bg-red-500";
      default:
        return "bg-gray-300";
    }
  };

  const getStepNumber = (step: number, currentStatus: string) => {
    if (step === 1) {
      return kycData.status === "APPROVED"
        ? "bg-green-500"
        : kycData.status === "REJECTED"
          ? "bg-red-500"
          : "bg-yellow-500";
    }
    if (step === 2) {
      if (!bvnData) return "bg-gray-300";
      return bvnData.bvnStatus === "APPROVED"
        ? "bg-green-500"
        : bvnData.bvnStatus === "REJECTED"
          ? "bg-red-500"
          : "bg-yellow-500";
    }
    if (step === 3) {
      const allApproved =
        kycData.status === "APPROVED" && bvnData?.bvnStatus === "APPROVED";
      const anyRejected =
        kycData.status === "REJECTED" || bvnData?.bvnStatus === "REJECTED";
      return allApproved
        ? "bg-green-500"
        : anyRejected
          ? "bg-red-500"
          : "bg-gray-300";
    }
    return "bg-gray-300";
  };

  const canReapply =
    kycData.status === "REJECTED" || bvnData?.bvnStatus === "REJECTED";
  const isFullyApproved =
    kycData.status === "APPROVED" && bvnData?.bvnStatus === "APPROVED";

  return (
    <View className="flex-1 bg-white h-full">
      <StatusBar style="dark" />
      <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
        <View className="flex-row items-center justify-between px-6 py-4 border-b border-gray-100 bg-white">
          <TouchableOpacity onPress={() => router.back()}>
            <Image
              source={ICONS.arrowLeft}
              className="w-auto h-5 text-black"
              resizeMode="contain"
            />
          </TouchableOpacity>
          <Text className="text-black text-xl font-bold text-center">KYC</Text>
          <TouchableOpacity className="bg-black/50 rounded-lg p-2">
            <Image
              source={ICONS.notificationBell}
              className="w-6 h-6"
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>

        <ScrollView className="flex-1 px-6 py-4">
          <View className="mb-4">
            <Text className="text-lg font-semibold text-black">
              {isFullyApproved ? "KYC Approved" : "KYC Application Status"}
            </Text>
            <Text className="text-[#8E9BAE] mt-1 text-sm font-normal">
              {isFullyApproved
                ? "Your KYC verification is complete. You now have full access to all features."
                : "You can check and track your KYC application status, cancel or reapply."}
            </Text>
          </View>

          {/* Status Stepper */}
          <View>
            {/* Step 1 - Personal Identity */}
            <View className="flex-row">
              <View className="items-center mr-4">
                <View
                  className={`w-8 h-8 rounded-full items-center justify-center ${getStepNumber(1, kycData.status)}`}
                >
                  <Text className="text-lg font-bold text-white">1</Text>
                </View>
                <View className="w-px flex-1 border-l-2 border-dashed border-gray-300 my-2" />
              </View>
              <View className="flex-1 pb-8">
                <View className="flex-row justify-between items-start">
                  <Text className="text-lg font-semibold w-4/5">
                    Personal Identity Verification
                  </Text>
                  <TouchableOpacity onPress={() => setShowStatusMenu(true)}>
                    <Image source={menuHorizontal} className="w-6 h-6" />
                  </TouchableOpacity>
                </View>
                <Text className="text-sm text-gray-500 mt-1">
                  Your personal information and document verification.
                </Text>
                <Text
                  className={`text-sm font-bold mt-2 ${getStatusColor(kycData.status)}`}
                >
                  {kycData.status}
                </Text>
                {kycData.status === "REJECTED" &&
                  kycData.identificationRejectionReason && (
                    <Text className="text-sm text-red-600 mt-1 bg-red-50 p-2 rounded">
                      Reason: {kycData.identificationRejectionReason}
                    </Text>
                  )}
              </View>
            </View>

            {/* Step 2 - BVN Verification */}
            <View className="flex-row">
              <View className="items-center mr-4">
                <View
                  className={`w-8 h-8 rounded-full items-center justify-center ${getStepNumber(2, bvnData?.bvnStatus || "PENDING")}`}
                >
                  <Text className="text-lg font-bold text-white">2</Text>
                </View>
                <View className="w-px flex-1 border-l-2 border-dashed border-gray-300 my-2" />
              </View>
              <View className="flex-1 pb-8">
                <Text className="text-lg font-semibold">BVN Verification</Text>
                <Text className="text-sm text-gray-500 mt-1">
                  Your BVN verification status.
                </Text>
                <Text
                  className={`text-sm font-bold mt-2 ${getStatusColor(bvnData?.bvnStatus || "PENDING")}`}
                >
                  {bvnData?.bvnStatus || "PENDING"}
                </Text>
                {bvnData?.bvnStatus === "REJECTED" &&
                  bvnData.bvnRejectionReason && (
                    <Text className="text-sm text-red-600 mt-1 bg-red-50 p-2 rounded">
                      Reason: {bvnData.bvnRejectionReason}
                    </Text>
                  )}
              </View>
            </View>

            {/* Step 3 - Application Review */}
            <View className="flex-row">
              <View className="items-center mr-4">
                <View
                  className={`w-8 h-8 rounded-full items-center justify-center ${getStepNumber(3, "")}`}
                >
                  <Text className="text-lg font-bold text-white">3</Text>
                </View>
              </View>
              <View className="flex-1 pb-8">
                <Text className="text-lg font-semibold">
                  Application Review
                </Text>
                <Text className="text-sm text-gray-500 mt-1">
                  Final review of your KYC application.
                </Text>
                <Text
                  className={`text-sm font-bold mt-2 ${getStatusColor(isFullyApproved ? "APPROVED" : "PENDING")}`}
                >
                  {isFullyApproved ? "APPROVED" : "PENDING"}
                </Text>
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          {canReapply && (
            <View className="mt-6">
              <TouchableOpacity
                onPress={() => router.push("/profile/kyc/submit")}
                className="bg-blue-500 rounded-lg p-4 items-center justify-center mb-3"
              >
                <Text className="text-white font-bold text-base">
                  Reapply KYC
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {!isFullyApproved && !canReapply && (
            <View className="mt-6 p-4 bg-yellow-50 rounded-lg">
              <Text className="text-yellow-800 text-center font-medium">
                Your application is under review. We'll notify you once it's
                processed.
              </Text>
            </View>
          )}

          {isFullyApproved && (
            <View className="mt-6 p-4 bg-green-50 rounded-lg">
              <Text className="text-green-800 text-center font-medium">
                🎉 Congratulations! Your KYC verification is complete.
              </Text>
            </View>
          )}
        </ScrollView>

        <Modal
          transparent={true}
          visible={showStatusMenu}
          animationType="fade"
          onRequestClose={() => setShowStatusMenu(false)}
        >
          <TouchableOpacity
            className="flex-1 bg-black/50"
            activeOpacity={1}
            onPressOut={() => setShowStatusMenu(false)}
          >
            <View className="bg-white rounded-lg w-48 absolute top-48 right-8">
              {canReapply && (
                <TouchableOpacity
                  className="p-4 border-b border-gray-100"
                  onPress={() => {
                    setShowStatusMenu(false);
                    router.push("/profile/kyc/submit");
                  }}
                >
                  <Text>Reapply</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity className="p-4 border-b border-gray-100">
                <Text>View Documents</Text>
              </TouchableOpacity>
              <TouchableOpacity className="p-4">
                <Text>Download Report</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>
      </SafeAreaView>
    </View>
  );
};

export default KYCStatusView;
