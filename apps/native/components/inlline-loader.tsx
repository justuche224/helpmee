import { View, Image, Animated } from "react-native";
import React, { useRef, useEffect } from "react";
import Logo from "@/assets/icon.png";

const InllineLoader = () => {
  const dotAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(dotAnim, {
        toValue: 3,
        duration: 1500,
        useNativeDriver: false,
      })
    ).start();
  }, []);

  const dots = [0, 1, 2].map((i) => (
    <Animated.Text
      key={i}
      style={{
        opacity: dotAnim.interpolate({
          inputRange: [i, i + 1],
          outputRange: [1, 0.3],
          extrapolate: "clamp",
        }),
        fontSize: 24,
        marginHorizontal: 2,
        color: "#19B360",
      }}
    >
      •
    </Animated.Text>
  ));

  return (
    <View className="items-center justify-center space-y-2">
      <Image source={Logo} className="w-6 h-6" resizeMode="contain" />
      <View className="flex-row">{dots}</View>
    </View>
  );
};

export default InllineLoader;
