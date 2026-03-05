import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  TextInput,
  Switch,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useGradualAnimation } from "@/hooks/use-gradual-animation";
import Animated, { useAnimatedStyle } from "react-native-reanimated";

import { ICONS } from "@/constants";
const { arrowLeft, arrowDown } = ICONS;

import HeartIcon from "@/assets/icons/shop/heart.png";
import CartIcon from "@/assets/icons/shop/cart.png";
import MapPinIcon from "@/assets/icons/shop/map-pin.png";

const shadowStyle = Platform.select({
  ios: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  android: {
    elevation: 4,
  },
});

const ShippingAddress = () => {
  const { height } = useGradualAnimation();
  const keyboardPadding = useAnimatedStyle(() => {
    return {
      height: height.value,
    };
  }, []);

  const [form, setForm] = useState({
    fullName: "",
    address: "",
    zipcode: "",
    phoneNumber: "",
    country: "",
    city: "",
    addressDetail: "",
  });

  const [isDefaultAddress, setIsDefaultAddress] = useState(true);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [showCityDropdown, setShowCityDropdown] = useState(false);

  const countries = ["Nigeria", "Ghana", "Kenya", "South Africa"];
  const cities = ["Lagos", "Abuja", "Port Harcourt", "Kano"];

  const handleSaveAddress = () => {
    router.back();
  };

  return (
    <SafeAreaView className="flex-1 bg-white pb-16">
      <View className="px-4 pt-2 bg-white">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity
            onPress={() => router.back()}
            className="h-9 w-9 rounded-full bg-white justify-center items-center"
          >
            <Image
              source={arrowLeft}
              className="w-5 h-5"
              resizeMode="contain"
            />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-gray-900">
            Shipping Address
          </Text>
          <View className="flex-row items-center gap-x-2">
            <TouchableOpacity className="mr-3">
              <Image
                source={HeartIcon}
                className="w-6 h-6"
                resizeMode="contain"
              />
            </TouchableOpacity>
            <TouchableOpacity>
              <Image
                source={CartIcon}
                className="w-6 h-6"
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        <View className="px-4 pt-6">
          <View className="mb-4">
            <TextInput
              value={form.fullName}
              onChangeText={(text) => setForm({ ...form, fullName: text })}
              placeholder="Full Name"
              placeholderTextColor="#A0A0A0"
              className="border border-gray-300 rounded-2xl px-4 py-4 text-base text-gray-900"
            />
          </View>

          <View className="mb-4">
            <TextInput
              value={form.address}
              onChangeText={(text) => setForm({ ...form, address: text })}
              placeholder="Address"
              placeholderTextColor="#A0A0A0"
              className="border border-gray-300 rounded-2xl px-4 py-4 text-base text-gray-900"
            />
          </View>

          <View className="mb-4">
            <TextInput
              value={form.zipcode}
              onChangeText={(text) => setForm({ ...form, zipcode: text })}
              placeholder="Zipcode (Postal Code)"
              placeholderTextColor="#A0A0A0"
              className="border border-gray-300 rounded-2xl px-4 py-4 text-base text-gray-900"
            />
          </View>

          <View className="mb-4">
            <TextInput
              value={form.phoneNumber}
              onChangeText={(text) => setForm({ ...form, phoneNumber: text })}
              placeholder="Phone Number"
              placeholderTextColor="#A0A0A0"
              keyboardType="phone-pad"
              className="border border-gray-300 rounded-2xl px-4 py-4 text-base text-gray-900"
            />
          </View>

          <View className="mb-4">
            <TouchableOpacity
              onPress={() => setShowCountryDropdown(!showCountryDropdown)}
              className="border border-gray-300 rounded-2xl px-4 py-4 flex-row justify-between items-center"
            >
              <Text
                className={`text-base ${
                  form.country ? "text-gray-900" : "text-gray-400"
                }`}
              >
                {form.country || "Select Country"}
              </Text>
              <Image
                source={arrowDown}
                className="w-5 h-5"
                resizeMode="contain"
              />
            </TouchableOpacity>
            {showCountryDropdown && (
              <View
                className="border border-gray-200 rounded-2xl mt-1 bg-white"
                style={shadowStyle}
              >
                {countries.map((country) => (
                  <TouchableOpacity
                    key={country}
                    onPress={() => {
                      setForm({ ...form, country });
                      setShowCountryDropdown(false);
                    }}
                    className="px-4 py-3 border-b border-gray-100 last:border-b-0"
                  >
                    <Text className="text-gray-900 text-base">{country}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          <View className="mb-4">
            <TouchableOpacity
              onPress={() => setShowCityDropdown(!showCityDropdown)}
              className="border border-gray-300 rounded-2xl px-4 py-4 flex-row justify-between items-center"
            >
              <Text
                className={`text-base ${
                  form.city ? "text-gray-900" : "text-gray-400"
                }`}
              >
                {form.city || "Select City"}
              </Text>
              <Image
                source={arrowDown}
                className="w-5 h-5"
                resizeMode="contain"
              />
            </TouchableOpacity>
            {showCityDropdown && (
              <View
                className="border border-gray-200 rounded-2xl mt-1 bg-white"
                style={shadowStyle}
              >
                {cities.map((city) => (
                  <TouchableOpacity
                    key={city}
                    onPress={() => {
                      setForm({ ...form, city });
                      setShowCityDropdown(false);
                    }}
                    className="px-4 py-3 border-b border-gray-100 last:border-b-0"
                  >
                    <Text className="text-gray-900 text-base">{city}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          <View className="mb-6">
            <TextInput
              value={form.addressDetail}
              onChangeText={(text) => setForm({ ...form, addressDetail: text })}
              placeholder="Address"
              placeholderTextColor="#A0A0A0"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              className="border border-gray-300 rounded-2xl px-4 py-4 text-base text-gray-900 h-24"
            />
          </View>

          <View className="mb-6">
            <Text className="text-lg font-semibold text-gray-900 mb-4">
              View Location
            </Text>
            <View className="bg-gray-200 rounded-2xl h-48 justify-center items-center relative">
              <View className="absolute inset-0 bg-gray-200 rounded-2xl" />
              <View className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <View className="w-8 h-8 bg-green-500 rounded-full justify-center items-center">
                  <Image
                    source={MapPinIcon}
                    className="w-5 h-5"
                    resizeMode="contain"
                    tintColor="white"
                  />
                </View>
              </View>
              <Text className="text-gray-500 text-sm mt-8">
                Map placeholder
              </Text>
            </View>
          </View>

          <View className="flex-row justify-between items-center mb-8">
            <Text className="text-lg font-semibold text-gray-900">
              Save as default address
            </Text>
            <Switch
              value={isDefaultAddress}
              onValueChange={setIsDefaultAddress}
              trackColor={{ false: "#E5E5E5", true: "#19B360" }}
              thumbColor={isDefaultAddress ? "#FFFFFF" : "#FFFFFF"}
            />
          </View>
        </View>
      </ScrollView>

      <View className="p-4 bg-white">
        <TouchableOpacity
          onPress={handleSaveAddress}
          className="bg-green-500 rounded-2xl py-4"
        >
          <Text className="text-white text-center font-bold text-lg">
            Save Address
          </Text>
        </TouchableOpacity>
      </View>

      <Animated.View style={keyboardPadding} />
    </SafeAreaView>
  );
};

export default ShippingAddress;
