import React from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "nativewind";

const ProfileLayout = () => {
  const { colorScheme } = useColorScheme();
  return (
    <>
      <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="create-pin" options={{ headerShown: false }} />
        <Stack.Screen
          name="update-bank-account"
          options={{ headerShown: false }}
        />
        <Stack.Screen name="my-qrcode" options={{ headerShown: false }} />
        <Stack.Screen
          name="transaction-limit"
          options={{ headerShown: false }}
        />
        <Stack.Screen name="select-plan" options={{ headerShown: false }} />
      </Stack>
    </>
  );
};

export default ProfileLayout;
