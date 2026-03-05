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
        <Stack.Screen name="kyc" options={{ headerShown: false }} />
        <Stack.Screen name="[username]" options={{ headerShown: false }} />
        <Stack.Screen name="edit-profile" options={{ headerShown: false }} />
        <Stack.Screen name="cards" options={{ headerShown: false }} />
        <Stack.Screen name="bank-account" options={{ headerShown: false }} />
        <Stack.Screen name="manage-shop" options={{ headerShown: false }} />
      </Stack>
    </>
  );
};

export default ProfileLayout;
