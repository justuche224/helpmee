import React from "react";
import { Stack } from "expo-router";

const BillsLayout = () => {
  return (
    <>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="cable-tv" options={{ headerShown: false }} />
      </Stack>
    </>
  );
};

export default BillsLayout;
