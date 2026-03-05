import { Image, View } from "react-native";
import { TABBARICONS } from "@/constants";

export const TabBarIcon = (props: {
  name: keyof typeof TABBARICONS;
  color?: string;
  focused?: boolean;
}) => {
  const getIconSource = () => {
    switch (props.name) {
      case "tabBarHome":
        return props.focused
          ? TABBARICONS.tabBarHomeFilled
          : TABBARICONS.tabBarHome;
      case "tabBarStore":
        return props.focused
          ? TABBARICONS.tabBarStoreFilled
          : TABBARICONS.tabBarStore;
      case "tabBarProfile":
        return props.focused
          ? TABBARICONS.tabBarProfileFilled
          : TABBARICONS.tabBarProfile;
      case "tabBarWallet":
        return props.focused
          ? TABBARICONS.tabBarWalletFilled
          : TABBARICONS.tabBarWallet;
      default:
        return TABBARICONS.tabBarHome;
    }
  };

  return (
    <View
      style={{
        alignItems: "center",
        justifyContent: "center",
        width: 24,
        height: 24,
      }}
    >
      <Image
        source={getIconSource()}
        style={{
          width: 22,
          height: 22,
          tintColor: props.color,
        }}
        resizeMode="contain"
      />
    </View>
  );
};
