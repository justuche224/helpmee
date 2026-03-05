import { authClient } from "@/lib/auth-client";
import Loader from "@/components/loader";
import Logo from "@/assets/icon.png";
import { View, Text, TouchableOpacity, Image, Alert } from "react-native";
import { Redirect, Stack } from "expo-router";

const ProtectedLayout = () => {
  const { data: session, isPending, error, refetch } = authClient.useSession();

  if (isPending) {
    return <Loader />;
  }

  if (error) {
    return (
      <View className="flex-1 items-center justify-center bg-white px-6">
        <Image source={Logo} className="w-20 h-20 mb-8" resizeMode="contain" />

        <View className="items-center mb-8">
          <Text className="text-2xl font-bold text-gray-800 mb-2 text-center">
            Connection Problem
          </Text>
          <Text className="text-gray-600 text-center mb-4 leading-6">
            {error.message || "An unexpected error occurred."}
          </Text>
        </View>

        <View className="w-full gap-y-4">
          <TouchableOpacity
            onPress={() => refetch()}
            className="bg-[#19B360] py-4 px-8 rounded-lg w-full"
            activeOpacity={0.8}
          >
            <Text className="text-white text-center font-semibold text-lg">
              Try Again
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => authClient.signOut()}
            className="border border-gray-300 py-4 px-8 rounded-lg w-full"
            activeOpacity={0.8}
          >
            <Text className="text-gray-700 text-center font-semibold text-lg">
              Sign Out
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (!session) {
    console.log("Session from if (!session) in protected layout is", session);
    return <Redirect href="/(auth)/sign-in" />;
  }
  console.log("Session from if (session) in protected layout is", session);
  return (
    <>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
         <Stack.Screen name="shop-onboarding" options={{ headerShown: false }} />
        {/*
        <Stack.Screen name="(drawer)" options={{ headerShown: false }} /> */}
      </Stack>
    </>
  );
};

export default ProtectedLayout;
