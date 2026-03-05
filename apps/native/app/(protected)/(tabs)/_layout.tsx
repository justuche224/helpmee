import { TabBarIcon } from "@/components/tabbar-icon";
import { Tabs, router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#22C55E",
        tabBarInactiveTintColor: "#9CA3AF",
        tabBarShowLabel: true,
        tabBarHideOnKeyboard: true,
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "500",
          marginTop: 2,
          fontFamily: "System",
        },
        tabBarStyle: {
          position: "absolute",
          bottom: insets.bottom,
          left: 0,
          right: 0,
          backgroundColor: "#FFFFFF",
          borderTopWidth: 1,
          borderTopColor: "#F1F5F9",
          height: 56,
          paddingTop: 4,
          paddingBottom: 4,
          paddingHorizontal: 20,
          shadowColor: "#000",
          shadowOffset: {
            width: 0,
            height: -4,
          },
          shadowOpacity: 0.1,
          shadowRadius: 12,
          elevation: 20,
        },
        tabBarItemStyle: {
          paddingVertical: 2,
          marginHorizontal: 4,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name="tabBarHome" color={color} focused={focused} />
          ),
        }}
        listeners={{
          tabPress: (e) => {
            e.preventDefault();
            router.replace("/(protected)/(tabs)/home");
          },
        }}
      />
      <Tabs.Screen
        name="shop"
        options={{
          title: "Store",
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name="tabBarStore" color={color} focused={focused} />
          ),
        }}
        listeners={{
          tabPress: (e) => {
            // Reset navigation state when shop tab is pressed
            // This ensures we always go to the shop index, not the last visited screen
            e.preventDefault();
            router.replace("/(protected)/(tabs)/shop");
          },
        }}
      />
      <Tabs.Screen
        name="wallet"
        options={{
          title: "Wallet",
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name="tabBarWallet" color={color} focused={focused} />
          ),
        }}
        listeners={{
          tabPress: (e) => {
            e.preventDefault();
            router.replace("/(protected)/(tabs)/wallet");
          },
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name="tabBarProfile" color={color} focused={focused} />
          ),
        }}
        listeners={{
          tabPress: (e) => {
            e.preventDefault();
            router.replace("/(protected)/(tabs)/profile");
          },
        }}
      />
    </Tabs>
  );
}
