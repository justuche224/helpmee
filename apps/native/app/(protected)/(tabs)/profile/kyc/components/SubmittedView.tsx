import React from "react";
import { View, Text } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { orpc } from "@/utils/orpc";
import Loader from "@/components/loader";
import KYCStatusView from "./KYCStatusView";

const SubmittedView: React.FC = () => {
  const {
    data: KYCInfo,
    isPending,
    error,
  } = useQuery(orpc.kyc.getUserKYC.queryOptions());

  if (isPending) {
    return <Loader />;
  }

  if (error) {
    // TODO: build error view/component
    return (
      <View className="flex-1 items-center justify-center">
        <Text className="text-red-500">Error loading KYC data</Text>
      </View>
    );
  }

  if (!KYCInfo?.kycData) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text>No KYC data found</Text>
      </View>
    );
  }

  return <KYCStatusView kycData={KYCInfo.kycData} bvnData={KYCInfo.bvnData} />;
};

export default SubmittedView;
