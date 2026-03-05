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
import { Redirect, router } from "expo-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { orpc } from "@/utils/orpc";
import Loader from "@/components/loader";
import { Container } from "@/components/container";
import Logo from "@/assets/images/logo.png";
import { authClient } from "@/lib/auth-client";
import Toast from "react-native-toast-message";
import StoreDetailsStep from "./components/StoreDetailsStep";
import ProductDetailsStep from "./components/ProductDetailsStep";
import TemplateStep from "./components/TemplateStep";
import { useGradualAnimation } from "@/hooks/use-gradual-animation";
import Animated, { useAnimatedStyle } from "react-native-reanimated";
import SuccessView from "./components/SuccessView";

const Index = () => {
  const { data: session } = authClient.useSession();
  const { height } = useGradualAnimation();
  const keyboardPadding = useAnimatedStyle(() => {
    return {
      height: height.value + 40,
    };
  }, []);

  const [step, setStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Store Details (Step 1)
  const [shopName, setShopName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [countryCode, setCountryCode] = useState("+234");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("");
  const [state, setState] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [address, setAddress] = useState("");

  // Product Details (Step 2)
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [businessRegistration, setBusinessRegistration] = useState<
    string | null
  >(null);

  // Template Selection (Step 3)
  const [templateId, setTemplateId] = useState("");

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

  const createStoreMutation = useMutation(
    orpc.store.createStore.mutationOptions({
      onSuccess: () => {
        Toast.show({
          type: "success",
          text1: "Success",
          text2: "Store created successfully!",
        });
        setIsSubmitted(true);
      },
      onError: (error) => {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: error.message,
        });
      },
    })
  );

  const handleBackPress = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      Alert.alert(
        "Exit Store Creation?",
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

  const handleFinalSubmit = async () => {
    setIsLoading(true);
    try {
      await createStoreMutation.mutateAsync({
        name: shopName,
        ownerName,
        phoneNumber: phone,
        country,
        state,
        zipCode,
        address,
        businessRegistration: businessRegistration || undefined,
        description,
        categoryId,
        templateId,
      });
    } catch (error) {
      console.error("Store creation error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const {
    data: KYCInfo,
    isPending: isKYCPending,
    error: KYCError,
  } = useQuery(orpc.kyc.getUserKYC.queryOptions());

  const {
    data: categories,
    isPending: isCategoriesPending,
    error: categoriesError,
  } = useQuery(orpc.store.categories.getStoreCategories.queryOptions());

  const {
    data: templates,
    isPending: isTemplatesPending,
    error: templatesError,
  } = useQuery(orpc.store.templates.getStoreTemplates.queryOptions());

  const { data: store, isPending: isStorePending } = useQuery(
    orpc.store.getUsersStore.queryOptions({
      queryKey: ["user-store"],
      retry: false,
    })
  );

  if (
    isKYCPending ||
    isCategoriesPending ||
    isTemplatesPending ||
    isStorePending
  ) {
    return <Loader />;
  }

  if (KYCError || categoriesError || templatesError) {
    return (
      <Container>
        <StatusBar />
        <View className="flex-1 items-center justify-center bg-white space-y-2">
          <Text>Error loading data. Please try again.</Text>
        </View>
      </Container>
    );
  }

  if (
    !KYCInfo?.kycData || KYCInfo?.kycData?.status !== "APPROVED"
  ) {
    return (
      <Container>
        <View className="flex-row justify-between items-center px-6 py-4 border-b border-gray-100 bg-white">
          <TouchableOpacity onPress={() => router.back()}>
            <Image
              source={ICONS.arrowLeft}
              className="w-auto h-5 text-black"
              resizeMode="contain"
            />
          </TouchableOpacity>
          <Text className="text-black text-xl font-bold">Create Shop</Text>
          <TouchableOpacity className="bg-black/20 rounded-lg p-2 relative">
            <Image
              source={ICONS.notificationBell}
              className="w-6 h-6"
              resizeMode="contain"
            />
            <View className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full" />
          </TouchableOpacity>
        </View>
        <View className="flex-1 px-6 py-4 justify-center items-center">
          <Image
            source={Logo}
            className="w-40 h-20 mb-8"
            resizeMode="contain"
          />
          <View className="items-center mb-8">
            <Text className="text-2xl font-bold text-gray-800 mb-2 text-center">
              KYC Verification Required
            </Text>
            <Text className="text-gray-600 text-center mb-4 leading-6">
              To create a shop, you need to complete your KYC verification.
            </Text>
          </View>
          <View className="w-full gap-y-4">
            <TouchableOpacity
              onPress={() => router.push("/profile/kyc")}
              className="bg-[#19B360] py-4 px-8 rounded-lg w-full"
              activeOpacity={0.8}
            >
              <Text className="text-white text-center font-semibold text-lg">
                Complete KYC
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.back()}
              className="border border-gray-300 py-4 px-8 rounded-lg w-full"
              activeOpacity={0.8}
            >
              <Text className="text-gray-700 text-center font-semibold text-lg">
                Go Back
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Container>
    );
  }

  if (store) {
    return <Redirect href="/profile/manage-shop/my-shop" />;
  }

  if (isSubmitted) {
    return (
      <View className="flex-1 bg-white h-full">
        <StatusBar style="dark" />
        <Container>
          <SuccessView />
        </Container>
      </View>
    );
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
            Create Shop - Step {step} of 3
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
                Store
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
                Product
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
                Template
              </Text>
            </View>
          </View>

          {step === 1 && (
            <StoreDetailsStep
              shopName={shopName}
              setShopName={setShopName}
              ownerName={ownerName}
              setOwnerName={setOwnerName}
              countryCode={countryCode}
              setCountryCode={setCountryCode}
              phone={phone}
              setPhone={setPhone}
              country={country}
              setCountry={setCountry}
              state={state}
              setState={setState}
              zipCode={zipCode}
              setZipCode={setZipCode}
              address={address}
              setAddress={setAddress}
              onNext={handleNextStep}
            />
          )}

          {step === 2 && (
            <ProductDetailsStep
              description={description}
              setDescription={setDescription}
              categoryId={categoryId}
              setCategoryId={setCategoryId}
              businessRegistration={businessRegistration}
              setBusinessRegistration={setBusinessRegistration}
              categories={categories || []}
              onNext={handleNextStep}
              onBack={() => setStep(1)}
            />
          )}

          {step === 3 && (
            <TemplateStep
              templateId={templateId}
              setTemplateId={setTemplateId}
              templates={templates || []}
              onBack={() => setStep(2)}
              onSubmit={handleFinalSubmit}
              isLoading={isLoading}
            />
          )}
        </ScrollView>
        <Animated.View style={keyboardPadding} />
      </Container>
    </View>
  );
};

export default Index;
