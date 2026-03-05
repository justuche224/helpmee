import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";

export const Container = ({
  children,
  bgColor,
}: {
  children: React.ReactNode;
  bgColor?: string;
}) => {
  return (
    <SafeAreaView
      className={`flex-1 ${bgColor ? `bg-[${bgColor}]` : "bg-background"}`}
    >
      {children}
    </SafeAreaView>
  );
};
