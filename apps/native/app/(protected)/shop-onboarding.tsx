import {
  Text,
  View,
  ImageBackground,
  TouchableOpacity,
  Image,
  ScrollView,
  BackHandler,
  Animated,
  Modal,
  ActivityIndicator,
} from "react-native";
import React, { useState, useEffect, useRef } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { router, useLocalSearchParams } from "expo-router";
import { ICONS, STORAGE_KEYS } from "@/constants";
import * as SecureStore from "expo-secure-store";

import StoreGetStartedSplashScreen from "@/assets/images/shop/Store-Get-Started-Splash-Screen.png";
import Adidas from "@/assets/images/shop/adidas.png";
import Chicken from "@/assets/images/shop/chicken.png";
import Heart from "@/assets/images/shop/heart.png";
import Kelloggs from "@/assets/images/shop/kelloggs.png";
import Like from "@/assets/images/shop/like.png";
import Nike from "@/assets/images/shop/nike.png";
import Puma from "@/assets/images/shop/puma.png";
import Zara from "@/assets/images/shop/zara.png";
import ArrowRight from "@/assets/icons/cards/arrow-right.png";
import LeftArrow from "@/assets/icons/left-arrow.png";
import { useMutation, useQuery } from "@tanstack/react-query";
import { orpc } from "@/utils/orpc";
import Loader from "@/components/loader";
import Error from "@/components/error";
import Toast from "react-native-toast-message";

const stateOptions = [
  "Abia",
  "Adamawa",
  "Akwa Ibom",
  "Anambra",
  "Bauchi",
  "Bayelsa",
  "Benue",
  "Borno",
  "Cross River",
  "Delta",
  "Ebonyi",
  "Edo",
  "Ekiti",
  "Enugu",
  "FCT - Abuja",
  "Gombe",
  "Imo",
  "Jigawa",
  "Kaduna",
  "Kano",
  "Katsina",
  "Kebbi",
  "Kogi",
  "Kwara",
  "Lagos",
  "Nasarawa",
  "Niger",
  "Ogun",
  "Ondo",
  "Osun",
  "Oyo",
  "Plateau",
  "Rivers",
  "Sokoto",
  "Taraba",
  "Yobe",
  "Zamfara",
];

export default function ShopOnboarding() {
  const [step, setStep] = useState(1);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");
  const [validationError, setValidationError] = useState("");
  const [showStateOptions, setShowStateOptions] = useState(false);
  const [state, setState] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [gender, setGender] = useState<"MALE" | "FEMALE" | "">("");
  const params = useLocalSearchParams();
  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        if (step > 1) {
          setStep(step - 1);
          return true;
        } else if (params.fromShop) {
          router.replace("/(protected)/(tabs)/home");
          return true;
        }
        return false;
      }
    );

    return () => backHandler.remove();
  }, [step, params.fromShop]);

  const animateToNext = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: -50,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setStep(step + 1);
      slideAnim.setValue(50);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    });
  };

  const animateToPrevious = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 50,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setStep(step - 1);
      slideAnim.setValue(-50);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    });
  };

  const updateCategoriesPreferenceMutation = useMutation(
    orpc.user.storePreference.updatePreferedStoreCategories.mutationOptions({
      onSuccess: () => {
        console.log("Categories preference updated");
      },
      onError: (error) => {
        console.log(error);
        Toast.show({
          type: "error",
          text1: "Error updating categories",
          text2: error.message,
        });
      },
    })
  );

  const updateGenderMutation = useMutation(
    orpc.user.info.gender.updateUserGender.mutationOptions({
      onSuccess: () => {
        console.log("Gender preference updated");
      },
      onError: (error) => {
        console.log(error);
        Toast.show({
          type: "error",
          text1: "Error updating gender",
          text2: error.message,
        });
      },
    })
  );

  const completeOnboarding = async () => {
    try {
      setUpdating(true);
      if (selectedCategories.length > 0) {
        const categoryIds = selectedCategories
          .map((category) => categories?.find((c) => c.name === category)?.id)
          .filter((id): id is string => id !== undefined);
        if (categoryIds.length > 0) {
          await updateCategoriesPreferenceMutation.mutateAsync({
            categories: categoryIds,
          });
        }
      }
      if (gender) {
        await updateGenderMutation.mutateAsync({
          gender,
        });
      }
      await SecureStore.setItemAsync(
        STORAGE_KEYS.SHOP_ONBOARDING_COMPLETED,
        "true"
      );
      router.replace("/(protected)/(tabs)/shop?fromOnboarding=true");
    } catch (error) {
      console.warn("Failed to save shop onboarding status:", error);
      setError("Failed to complete onboarding");
    } finally {
      setUpdating(false);
    }
  };

  const handleNext = () => {
    if (step === 3) {
      if (!state.trim()) {
        setValidationError("Please select your state");
        return;
      }
      if (selectedCategories.length < 4) {
        setValidationError(
          `Please select at least 4 categories (${selectedCategories.length}/4 selected)`
        );
        return;
      }
      setValidationError("");
    }

    if (step < 4) {
      animateToNext();
    } else {
      completeOnboarding();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      animateToPrevious();
    }
  };

  const {
    data: storePreference,
    isPending: isStorePreferencePending,
    error: storePreferenceError,
    refetch: refetchStorePreference,
  } = useQuery(orpc.user.storePreference.getStorePreference.queryOptions());

  const {
    data: categories,
    isPending: isCategoriesPending,
    error: categoriesError,
    refetch: refetchCategories,
  } = useQuery(orpc.general.categories.getAllCategories.queryOptions());

  const toggleCategory = (category: string) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter((c) => c !== category));
    } else {
      if (selectedCategories.length < 5) {
        setSelectedCategories([...selectedCategories, category]);
      }
    }
    if (validationError) {
      setValidationError("");
    }
  };

  useEffect(() => {
    if (storePreference) {
      const categoryNames = storePreference.preferedStoreCategories
        .map((category) => category.name)
        .filter((name): name is string => name !== null);

      setSelectedCategories(categoryNames);
      setState(storePreference.userLocation[0]?.state || "");
      setGender(storePreference.userGender[0]?.gender as "MALE" | "FEMALE" | "");
    }
  }, [storePreference]);

  if (isStorePreferencePending || isCategoriesPending) {
    return <Loader />;
  }

  if (storePreferenceError) {
    return (
      <Error
        error={storePreferenceError.message}
        refetch={refetchStorePreference}
      />
    );
  }

  if (categoriesError) {
    return (
      <Error error={categoriesError.message} refetch={refetchCategories} />
    );
  }

  if (error) {
    return <Error error={error} refetch={completeOnboarding} />;
  }

  if (step === 1) {
    return (
      <>
        <StatusBar style="light" />
        <Animated.View
          style={{
            flex: 1,
            opacity: fadeAnim,
            transform: [{ translateX: slideAnim }],
          }}
        >
          <ImageBackground
            source={StoreGetStartedSplashScreen}
            className="flex-1 justify-end"
            resizeMode="cover"
          >
            <SafeAreaView className="flex-1">
              <View className="absolute top-16 left-4">
                <TouchableOpacity
                  onPress={() => {
                    if (params.fromShop) {
                      router.replace("/(protected)/(tabs)/home");
                    } else {
                      router.back();
                    }
                  }}
                >
                  <Image
                    source={LeftArrow}
                    className="w-6 h-6 object-contain"
                    resizeMode="contain"
                    style={{ tintColor: "white" }}
                  />
                </TouchableOpacity>
              </View>
              <View className="flex-1 justify-end p-8 bg-black/20">
                <View className="items-center">
                  <Text className="text-4xl font-pbold text-white text-center">
                    Welcome to Helpmee Store
                  </Text>
                  <Text className="text-lg text-white text-center mt-4 font-pregular">
                    Your peace of mind is our priority. Benefit from secure and
                    hassle-free transactions every time you use our app.
                  </Text>
                </View>
                <View className="items-end mt-8">
                  <TouchableOpacity
                    onPress={handleNext}
                    className="bg-[#27C278] rounded-full h-16 w-16 items-center justify-center"
                  >
                    <Image
                      source={ArrowRight}
                      className="w-8 h-8 object-contain"
                      resizeMode="contain"
                      style={{ tintColor: "white" }}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </SafeAreaView>
          </ImageBackground>
        </Animated.View>
      </>
    );
  }

  if (step === 2) {
    return (
      <>
        <StatusBar style="dark" />
        <Animated.View
          style={{
            flex: 1,
            opacity: fadeAnim,
            transform: [{ translateX: slideAnim }],
          }}
        >
          <SafeAreaView className="flex-1 bg-white p-6 justify-between">
            <View>
              <TouchableOpacity onPress={handleBack}>
                <Image
                  source={LeftArrow}
                  className="w-6 h-6 object-contain"
                  resizeMode="contain"
                />
              </TouchableOpacity>
            </View>

            <View className="items-center">
              <View className="w-80 h-80 relative">
                <Image
                  source={Zara}
                  className="w-20 h-20 absolute"
                  style={{ top: 0, left: 40 }}
                />
                <Image
                  source={Puma}
                  className="w-24 h-24 absolute"
                  style={{ top: 20, right: 20 }}
                />
                <Image
                  source={Nike}
                  className="w-24 h-24 absolute"
                  style={{ top: 140, right: 10 }}
                />
                <Image
                  source={Adidas}
                  className="w-20 h-20 absolute"
                  style={{ bottom: 30, right: 90 }}
                />
                <Image
                  source={Kelloggs}
                  className="w-24 h-24 absolute"
                  style={{ bottom: 10, left: 20 }}
                />
                <Image
                  source={Chicken}
                  className="w-32 h-32 absolute"
                  style={{
                    top: "50%",
                    left: "50%",
                    transform: [{ translateX: -64 }, { translateY: -64 }],
                  }}
                />
                <Image
                  source={Heart}
                  className="w-10 h-10 absolute"
                  style={{ top: 90, left: 90 }}
                />
                <Image
                  source={Like}
                  className="w-10 h-10 absolute"
                  style={{ top: 100, right: 70 }}
                />
              </View>
            </View>

            <View className="items-center">
              <Text className="text-3xl font-pbold text-black text-center">
                Follow and Order from your Favorite Brands
              </Text>
              <Text className="text-base text-gray-500 text-center mt-4 font-pregular">
                Your peace of mind is our priority. Benefit from secure and
                hassle-free transactions every time you use our app.
              </Text>
            </View>
            <View className="items-end">
              <TouchableOpacity
                onPress={handleNext}
                className="bg-[#27C278] rounded-full h-16 w-16 items-center justify-center"
              >
                <Image
                  source={ArrowRight}
                  className="w-8 h-8 object-contain"
                  resizeMode="contain"
                  style={{ tintColor: "white" }}
                />
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </Animated.View>
      </>
    );
  }

  if (step === 3) {
    return (
      <>
        <StatusBar style="dark" />
        <Animated.View
          style={{
            flex: 1,
            opacity: fadeAnim,
            transform: [{ translateX: slideAnim }],
          }}
        >
          <SafeAreaView className="flex-1 bg-white p-6">
            <ScrollView showsVerticalScrollIndicator={false}>
              <TouchableOpacity onPress={handleBack}>
                <Image
                  source={LeftArrow}
                  className="w-6 h-6 object-contain"
                  resizeMode="contain"
                />
              </TouchableOpacity>
              <Text className="text-2xl font-semibold text-black text-center mt-2">
                Select your store category preference
              </Text>
              <Text className="text-gray-500 mt-4 font-regular">
                You can choose your favorite store category and get updates
                based on your choices. Please note you can only pick 5
                categories.
              </Text>

              {validationError ? (
                <Text className="text-red-500 mt-2 font-medium text-center">
                  {validationError}
                </Text>
              ) : null}

              <View className="flex-row flex-wrap mt-4">
                {categories.map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    onPress={() => toggleCategory(category.name)}
                    className={`py-2 px-4 m-1 rounded-full border ${
                      selectedCategories.includes(category.name)
                        ? "bg-[#27C278] border-[#27C278]"
                        : "bg-white border-gray-300"
                    }`}
                  >
                    <Text
                      className={`font-pmedium ${
                        selectedCategories.includes(category.name)
                          ? "text-white"
                          : "text-black"
                      }`}
                    >
                      {category.name}{" "}
                      {selectedCategories.includes(category.name) ? "✓" : "+"}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity
                onPress={() => setShowStateOptions(true)}
                activeOpacity={0.7}
                className="w-full h-12 px-4 bg-gray-50 rounded-2xl border border-gray-200 flex-row items-center justify-between mt-4"
              >
                <Text
                  className={`font-medium ${state ? "text-black" : "text-[#8E9BAE]"}`}
                >
                  {state || "Select State"}
                </Text>
                <Image
                  source={ICONS.arrowDown}
                  className="w-4 h-4"
                  resizeMode="contain"
                />
              </TouchableOpacity>
            </ScrollView>
            <View className="mt-4">
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-sm text-gray-600">
                  State: {state ? "✓ Selected" : "Not selected"}
                </Text>
                <Text className="text-sm text-gray-600">
                  Categories: {selectedCategories.length}/4 minimum
                </Text>
              </View>
              <TouchableOpacity
                onPress={handleNext}
                disabled={!state.trim() || selectedCategories.length < 4}
                className={`p-4 rounded-lg items-center ${
                  state.trim() && selectedCategories.length >= 4
                    ? "bg-[#27C278]"
                    : "bg-gray-300"
                }`}
              >
                <Text
                  className={`text-lg font-pbold ${
                    state.trim() && selectedCategories.length >= 4
                      ? "text-white"
                      : "text-gray-500"
                  }`}
                >
                  Continue
                </Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </Animated.View>
        <Modal
          transparent={true}
          visible={showStateOptions}
          animationType="fade"
          onRequestClose={() => setShowStateOptions(false)}
        >
          <TouchableOpacity
            className="flex-1 bg-black/50 justify-center items-center"
            activeOpacity={1}
            onPressOut={() => setShowStateOptions(false)}
          >
            <View className="bg-white rounded-lg w-4/5 max-h-3/4">
              <Text className="p-4 border-b border-gray-200 text-gray-400">
                --select state--
              </Text>
              <ScrollView
                showsVerticalScrollIndicator={false}
                className="max-h-80"
              >
                {stateOptions.map((stateOption) => (
                  <TouchableOpacity
                    key={stateOption}
                    className="p-4 border-b border-gray-200"
                    onPress={() => {
                      setState(stateOption);
                      setShowStateOptions(false);

                      if (validationError) {
                        setValidationError("");
                      }
                    }}
                  >
                    <Text>{stateOption}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </TouchableOpacity>
        </Modal>
      </>
    );
  }

  if (step === 4) {
    return (
      <>
        <StatusBar style="dark" />
        <Animated.View
          style={{
            flex: 1,
            opacity: fadeAnim,
            transform: [{ translateX: slideAnim }],
          }}
        >
          <SafeAreaView className="flex-1 bg-white p-6">
            <TouchableOpacity onPress={handleBack}>
              <Image
                source={LeftArrow}
                className="w-6 h-6 object-contain"
                resizeMode="contain"
              />
            </TouchableOpacity>

            <View className="flex-1 justify-center items-center">
              <Text className="text-3xl font-pbold text-black text-center mb-8">
                What's your gender?
              </Text>
              <Text className="text-base text-gray-500 text-center mb-12 font-pregular">
                This helps us personalize your shopping experience
              </Text>

              <View className="w-full gap-y-4">
                <TouchableOpacity
                  onPress={() => setGender("MALE")}
                  className={`w-full h-16 rounded-2xl border-2 items-center justify-center ${
                    gender === "MALE"
                      ? "bg-[#27C278] border-[#27C278]"
                      : "bg-white border-gray-300"
                  }`}
                >
                  <Text
                    className={`text-lg font-pmedium ${
                      gender === "MALE" ? "text-white" : "text-black"
                    }`}
                  >
                    Male
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setGender("FEMALE")}
                  className={`w-full h-16 rounded-2xl border-2 items-center justify-center ${
                    gender === "FEMALE"
                      ? "bg-[#27C278] border-[#27C278]"
                      : "bg-white border-gray-300"
                  }`}
                >
                  <Text
                    className={`text-lg font-pmedium ${
                      gender === "FEMALE" ? "text-white" : "text-black"
                    }`}
                  >
                    Female
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              onPress={completeOnboarding}
              disabled={!gender}
              className={`p-4 rounded-lg mt-4 items-center ${
                gender ? "bg-[#27C278]" : "bg-gray-300"
              }`}
            >
              <Text className="text-white text-lg font-pbold">Shop Now</Text>
            </TouchableOpacity>
          </SafeAreaView>
        </Animated.View>
        {updating && (
          <View className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <View className="bg-white rounded-[10px] p-6 flex items-center justify-center">
              <ActivityIndicator size="large" color="#19B360" />
              <Text className="text-[#161616] font-semibold text-base mt-4">
                Getting ready
              </Text>
              <Text className="text-[#161616] font-semibold text-base mt-4">
                Please wait while we prepare your experience.
              </Text>
            </View>
          </View>
        )}
      </>
    );
  }

  return null;
}
