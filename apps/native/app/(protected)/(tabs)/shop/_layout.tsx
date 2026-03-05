import React from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "nativewind";

const ShopLayout = () => {
  const { colorScheme } = useColorScheme();
  return (
    <>
      <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="notifications" options={{ headerShown: false }} />
        <Stack.Screen name="categories" options={{ headerShown: false }} />
        <Stack.Screen name="items" options={{ headerShown: false }} />
        <Stack.Screen name="saved" options={{ headerShown: false }} />
        <Stack.Screen name="cart" options={{ headerShown: false }} />
        <Stack.Screen name="checkout" options={{ headerShown: false }} />
        <Stack.Screen
          name="shipping-address"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="order-successful"
          options={{ headerShown: false }}
        />
        <Stack.Screen name="search" options={{ headerShown: false }} />
      </Stack>
    </>
  );
};

export default ShopLayout;
