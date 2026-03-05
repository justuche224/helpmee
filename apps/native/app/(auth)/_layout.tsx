import { authClient } from "@/lib/auth-client";
import Loader from "@/components/loader";
import { Redirect, Stack } from "expo-router";

const AuthLayout = () => {
  const { data: session, isPending } = authClient.useSession();

  if (isPending) {
    return <Loader />;
  }

  if (session) {
    console.log("There is session");
    console.log("Session is if (session) in auth layout is", session);
    return <Redirect href="/(protected)/(tabs)/home" />;
  }
  console.log("No session");
  console.log("Session is if (!session) in auth layout is", session);
  return (
    <>
      <Stack>
        <Stack.Screen name="sign-in" options={{ headerShown: false }} />
        <Stack.Screen name="sign-up" options={{ headerShown: false }} />
        <Stack.Screen name="forgot-password" options={{ headerShown: false }} />
      </Stack>
    </>
  );
};

export default AuthLayout;
