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
      </Stack>
    </>
  );
};

export default ManageShopLayout;
