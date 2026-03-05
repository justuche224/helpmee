import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  Image,
  StatusBar,
} from "react-native";
import { Redirect, router } from "expo-router";
import { useColorScheme } from "@/lib/use-color-scheme";
import { ONBOARDING_IMAGES, STORAGE_KEYS } from "@/constants";
import * as SecureStore from "expo-secure-store";
import { authClient } from "@/lib/auth-client";
import Loader from "@/components/loader";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

interface OnboardingSlide {
  id: number;
  title: string;
  description: string;
  image: any;
}

const onboardingData: OnboardingSlide[] = [
  {
    id: 1,
    title: "Explore Services!",
    description:
      "Discover a wide range of services tailored just for you. From airtime to online stores, we've got it all covered.",
    image: ONBOARDING_IMAGES[0],
  },
  {
    id: 2,
    title: "Easy Navigation!",
    description:
      "Every step and process has never been better. Navigate through our user-friendly interface and handle tasks with just a few taps.",
    image: ONBOARDING_IMAGES[1],
  },
  {
    id: 3,
    title: "Seamless & Secure Transactions!",
    description:
      "Your peace of mind is our priority. Benefit from secure and hassle-free transactions every time you use our app.",
    image: ONBOARDING_IMAGES[2],
  },
];

const Index = () => {
  const { data: session } = authClient.useSession();
  const { isDarkColorScheme } = useColorScheme();
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState<boolean | null>(
    null
  );

  useEffect(() => {
    console.log("Onboarding mounted");
    (async () => {
      try {
        const stored = await SecureStore.getItemAsync(
          STORAGE_KEYS.ONBOARDING_SEEN
        );
        setHasSeenOnboarding(stored === "true");
      } catch {
        setHasSeenOnboarding(false);
      }
    })();
  }, []);

  // Wait for auth and onboarding readiness before making routing decisions
  if (hasSeenOnboarding === null) {
    console.log("Waiting for auth and onboarding readiness");
    console.log("Session from hasSeenOnboarding === null is", session);
    return <Loader />;
  }

  // If user is authenticated, redirect to home
  if (session) {
    console.log("User is authenticated, redirecting to home");
    console.log("Session from if (session) is", session);
    return <Redirect href="/(protected)/(tabs)/home" />;
  }

  // If user has already seen onboarding, skip to sign-in
  if (hasSeenOnboarding) {
    console.log("User has seen onboarding, redirecting to sign-in");
    console.log("Session from if (hasSeenOnboarding) is", session);
    return <Redirect href="/(auth)/sign-in" />;
  }

  const handleScroll = (event: any) => {
    const contentOffset = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffset / screenWidth);
    setCurrentIndex(index);
  };

  const handleNext = () => {
    if (currentIndex < onboardingData.length - 1) {
      const nextIndex = currentIndex + 1;
      scrollViewRef.current?.scrollTo({
        x: nextIndex * screenWidth,
        animated: true,
      });
      setCurrentIndex(nextIndex);
    }
  };

  const handleSkip = async () => {
    try {
      await SecureStore.setItemAsync(STORAGE_KEYS.ONBOARDING_SEEN, "true");
    } catch {}
    router.replace("/(auth)/sign-in");
  };

  const handleGetStarted = async () => {
    try {
      await SecureStore.setItemAsync(STORAGE_KEYS.ONBOARDING_SEEN, "true");
    } catch {}
    router.replace("/(auth)/sign-in");
  };

  const renderDots = () => {
    return (
      <View
        style={{
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
          marginVertical: 24,
        }}
      >
        {onboardingData.map((_, index) => (
          <View
            key={index}
            style={{
              width: index === currentIndex ? 24 : 8,
              height: 8,
              borderRadius: 4,
              backgroundColor:
                index === currentIndex
                  ? "#22C55E"
                  : isDarkColorScheme
                    ? "#4B5563"
                    : "#D1D5DB",
              marginHorizontal: 4,
            }}
          />
        ))}
      </View>
    );
  };

  const isLastSlide = currentIndex === onboardingData.length - 1;

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: isDarkColorScheme ? "#161616" : "#FFFFFF",
      }}
    >
      <StatusBar hidden={true} />

      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        style={{ flex: 1 }}
      >
        {onboardingData.map((slide) => (
          <View
            key={slide.id}
            style={{ width: screenWidth, height: screenHeight }}
          >
            <View style={{ flex: 0.6 }}>
              <Image
                source={slide.image}
                style={{
                  width: screenWidth,
                  height: "100%",
                  resizeMode: "cover",
                }}
              />
            </View>

            <View
              style={{
                backgroundColor: isDarkColorScheme ? "#161616" : "#FFFFFF",
                flex: 0.4,
                paddingHorizontal: 32,
                justifyContent: "space-between",
              }}
            >
              <View style={{ flex: 1, paddingTop: 32 }}>
                <Text
                  style={{
                    fontSize: 24,
                    fontWeight: "700",
                    color: isDarkColorScheme ? "#FFFFFF" : "#1F2937",
                    textAlign: "center",
                    marginBottom: 16,
                  }}
                >
                  {slide.title}
                </Text>

                <Text
                  style={{
                    fontSize: 14,
                    lineHeight: 20,
                    color: isDarkColorScheme ? "#9CA3AF" : "#6B7280",
                    textAlign: "center",
                  }}
                >
                  {slide.description}
                </Text>

                {renderDots()}
              </View>

              <View
                style={{
                  paddingBottom: 40,
                }}
              >
                {isLastSlide ? (
                  <TouchableOpacity
                    onPress={handleGetStarted}
                    style={{
                      backgroundColor: "#22C55E",
                      paddingVertical: 16,
                      paddingHorizontal: 32,
                      borderRadius: 12,
                      alignItems: "center",
                      marginHorizontal: 16,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 16,
                        color: "#FFFFFF",
                        fontWeight: "600",
                      }}
                    >
                      Get Started
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <TouchableOpacity
                      onPress={handleSkip}
                      style={{
                        paddingVertical: 12,
                        paddingHorizontal: 16,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 16,
                          color: "#22C55E",
                          fontWeight: "500",
                        }}
                      >
                        Skip
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={handleNext}
                      style={{
                        paddingVertical: 12,
                        paddingHorizontal: 16,
                        flexDirection: "row",
                        alignItems: "center",
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 16,
                          color: "#22C55E",
                          fontWeight: "500",
                          marginRight: 4,
                        }}
                      >
                        Next
                      </Text>
                      <Text
                        style={{
                          fontSize: 16,
                          color: "#22C55E",
                          fontWeight: "500",
                        }}
                      >
                        ›
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

export default Index;
