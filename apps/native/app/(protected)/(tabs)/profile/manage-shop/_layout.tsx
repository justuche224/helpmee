import React from "react";
import { useColorScheme } from "@/lib/use-color-scheme";
import { StatusBar } from "expo-status-bar";
import { Stack } from "expo-router";

const ManageShopLayout = () => {
  const { colorScheme } = useColorScheme();
  return (
    <>
      <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="my-shop" options={{ headerShown: false }} />
        <Stack.Screen name="banners" options={{ headerShown: false }} />
        <Stack.Screen name="update-logo" options={{ headerShown: false }} />
        <Stack.Screen
          name="update-public-description"
          options={{ headerShown: false }}
        />
        <Stack.Screen name="create-shop" options={{ headerShown: false }} />
        <Stack.Screen name="select-plan" options={{ headerShown: false }} />
        <Stack.Screen name="upload-items" options={{ headerShown: false }} />
        <Stack.Screen name="my-reviews" options={{ headerShown: false }} />
        <Stack.Screen name="saved-items" options={{ headerShown: false }} />
        <Stack.Screen name="my-orders" options={{ headerShown: false }} />
      </Stack>
    </>
  );
};

export default ManageShopLayout;
