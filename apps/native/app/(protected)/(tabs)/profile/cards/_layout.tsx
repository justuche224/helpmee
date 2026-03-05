import React from "react";
import { useColorScheme } from "@/lib/use-color-scheme";
import { StatusBar } from "expo-status-bar";
import { Stack } from "expo-router";

const CardsLayout = () => {
  const { colorScheme } = useColorScheme();
  return (
    <>
      <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="manage-cards" options={{ headerShown: false }} />
        <Stack.Screen name="payment-methods" options={{ headerShown: false }} />
        <Stack.Screen name="request-card" options={{ headerShown: false }} />
      </Stack>
    </>
  );
};

export default CardsLayout;
