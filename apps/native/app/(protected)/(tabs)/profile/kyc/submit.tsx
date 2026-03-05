import {
  Image,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  BackHandler,
} from "react-native";
import React, { useState, useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { ICONS } from "@/constants";
import { router } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import PersonalIdentityStep from "./components/PersonalIdentityStep";
import BVNStep from "./components/BVNStep";
import ReviewStep from "./components/ReviewStep";
import SubmittedView from "./components/SubmittedView";
import { Container } from "@/components/container";
import Toast from "react-native-toast-message";
import { authClient } from "@/lib/auth-client";
import { orpc } from "@/utils/orpc";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Loader from "@/components/loader";

const Submit = () => {
  const queryClient = useQueryClient();
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
      <View>
        <Text>Error</Text>
      </View>
    );
  }

  // If user has KYC data, show status view
  if (KYCInfo?.kycData) {
    return <SubmittedView />;
  }

  const [step, setStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [identityType, setIdentityType] = useState<string | null>(null);
  const [idNumber, setIdNumber] = useState("");
  const [documentFront, setDocumentFront] = useState<string>("");
  const [documentBack, setDocumentBack] = useState<string>("");
  const [selfie, setSelfie] = useState<string>("");
  const [bvn, setBvn] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const backAction = () => {
      handleBackPress();
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );
    return () => backHandler.remove();
  }, [step]);

  const handleBackPress = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      Alert.alert(
        "Exit KYC?",
        "Are you sure you want to exit? Your progress will be lost.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Exit", style: "destructive", onPress: () => router.back() },
        ]
      );
    }
  };

  const handleNextStep = () => {
    if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    }
  };

  const createKYCMutation = useMutation(
    orpc.kyc.uploadKYC.mutationOptions({
      onSuccess: () => {
        setIsSubmitted(true);
        Toast.show({
          type: "success",
          text1: "Success",
          text2: "KYC created successfully",
        });
        queryClient.invalidateQueries({
          queryKey: orpc.kyc.getUserKYC.queryOptions().queryKey,
        });
        router.replace("/profile/kyc");
      },
      onError: (error) => {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: error.message,
        });
      },
      onSettled: () => {
        setIsLoading(false);
      },
    })
  );

  const handleFinalSubmit = async () => {
    if (!documentFront || !documentBack || !selfie) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "All documents are required",
      });
      return;
    }

    setIsLoading(true);
    const mapIdentityType = (
      type: string | null
    ): "passport" | "national_id" | "driver_license" | "other" => {
      switch (type) {
        case "NIN Number":
          return "national_id";
        case "Driver's License":
          return "driver_license";
        case "Voter's Card":
          return "other";
        default:
          return "other";
      }
    };

    createKYCMutation.mutate({
      name: fullName,
      phoneNumber: phone,
      email,
      identificationType: mapIdentityType(identityType),
      identificationNumber: idNumber,
      identificationFrontImage: documentFront,
      identificationBackImage: documentBack,
      identificationSelfie: selfie,
      bvn,
    });
  };

  if (isSubmitted) {
    return <SubmittedView />;
  }

  return (
    <View className="flex-1 bg-white h-full">
      <StatusBar style="dark" />
      <Container>
        <View className="flex-row items-center justify-between px-6 py-4 border-b border-gray-100 bg-white">
          <TouchableOpacity onPress={handleBackPress}>
            <Image
              source={ICONS.arrowLeft}
              className="w-auto h-5 text-black"
              resizeMode="contain"
            />
          </TouchableOpacity>
          <Text className="text-black text-xl font-bold text-center">
            KYC - Step {step} of 3
          </Text>
          <TouchableOpacity className="bg-black/50 rounded-lg p-2">
            <Image
              source={ICONS.notificationBell}
              className="w-6 h-6"
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>
        <ScrollView
          className="flex-1 px-6 py-4"
          showsVerticalScrollIndicator={false}
        >
          <View className="flex-row items-center justify-center space-x-2 mb-6">
            <View className="flex-row items-center">
              <View
                className={`w-6 h-6 rounded-full items-center justify-center ${
                  step >= 1 ? "bg-green-500" : "bg-gray-300"
                }`}
              >
                <Text
                  className={`text-sm font-bold ${
                    step >= 1 ? "text-white" : "text-gray-500"
                  }`}
                >
                  1
                </Text>
              </View>
              <Text
                className={`ml-2 text-sm font-semibold ${
                  step >= 1 ? "text-green-500" : "text-gray-400"
                }`}
              >
                Personal
              </Text>
            </View>
            <Text
              className={`font-bold ${
                step >= 2 ? "text-green-500" : "text-gray-300"
              }`}
            >
              ----
            </Text>
            <View className="flex-row items-center">
              <View
                className={`w-6 h-6 rounded-full items-center justify-center ${
                  step >= 2 ? "bg-green-500" : "bg-gray-300"
                }`}
              >
                <Text
                  className={`text-sm font-bold ${
                    step >= 2 ? "text-white" : "text-gray-500"
                  }`}
                >
                  2
                </Text>
              </View>
              <Text
                className={`ml-2 text-sm font-semibold ${
                  step >= 2 ? "text-green-500" : "text-gray-400"
                }`}
              >
                BVN
              </Text>
            </View>
            <Text
              className={`font-bold ${
                step >= 3 ? "text-green-500" : "text-gray-300"
              }`}
            >
              ----
            </Text>
            <View className="flex-row items-center">
              <View
                className={`w-6 h-6 rounded-full items-center justify-center ${
                  step >= 3 ? "bg-green-500" : "bg-gray-300"
                }`}
              >
                <Text
                  className={`text-sm font-bold ${
                    step >= 3 ? "text-white" : "text-gray-500"
                  }`}
                >
                  3
                </Text>
              </View>
              <Text
                className={`ml-2 text-sm font-semibold ${
                  step >= 3 ? "text-green-500" : "text-gray-400"
                }`}
              >
                Review
              </Text>
            </View>
          </View>

          {step === 1 && (
            <PersonalIdentityStep
              fullName={fullName}
              setFullName={setFullName}
              phone={phone}
              setPhone={setPhone}
              email={email}
              setEmail={setEmail}
              identityType={identityType}
              setIdentityType={setIdentityType}
              idNumber={idNumber}
              setIdNumber={setIdNumber}
              documentFront={documentFront}
              setDocumentFront={setDocumentFront}
              documentBack={documentBack}
              setDocumentBack={setDocumentBack}
              selfie={selfie}
              setSelfie={setSelfie}
              onNext={handleNextStep}
            />
          )}

          {step === 2 && (
            <BVNStep
              bvn={bvn}
              setBvn={setBvn}
              onNext={handleNextStep}
              onBack={() => setStep(1)}
            />
          )}

          {step === 3 && (
            <ReviewStep
              fullName={fullName}
              phone={phone}
              email={email}
              identityType={identityType}
              idNumber={idNumber}
              documentFront={documentFront}
              documentBack={documentBack}
              selfie={selfie}
              bvn={bvn}
              onEditPersonal={() => setStep(1)}
              onEditBVN={() => setStep(2)}
              onSubmit={handleFinalSubmit}
              setDocumentFront={(value) => setDocumentFront(value || "")}
              setDocumentBack={(value) => setDocumentBack(value || "")}
              setSelfie={(value) => setSelfie(value || "")}
              isLoading={isLoading}
            />
          )}
        </ScrollView>
      </Container>
    </View>
  );
};

export default Submit;
