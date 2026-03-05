import { Stack } from "expo-router";

export default function CreateShopLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      {/* <Stack.Screen
        name="product"
        options={{ headerShown: false, presentation: "modal" }}
      />
      <Stack.Screen
        name="template"
        options={{ headerShown: false, presentation: "modal" }}
      /> */}
    </Stack>
  );
}
