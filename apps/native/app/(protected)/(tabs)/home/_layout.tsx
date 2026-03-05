import React from "react";
import { Stack } from "expo-router";

const HomeLayout = () => {
  return (
    <>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="bills" options={{ headerShown: false }} />
        <Stack.Screen name="airtime" options={{ headerShown: false }} />
        <Stack.Screen name="deals" options={{ headerShown: false }} />
        <Stack.Screen name="transfer" options={{ headerShown: false }} />
      </Stack>
    </>
  );
};

export default HomeLayout;
