import React, { useState } from "react";
import {
  Text,
  View,
  Image,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { ICONS } from "@/constants";
import UserImage from "@/assets/icons/profile/user-image.png";
import camera from "@/assets/icons/profile/camera.png";

const EditProfile = () => {
  const { eye, eyeHide } = ICONS;
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View className="flex-1 bg-white h-full">
      <StatusBar style="light" />
      <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
        <View className="flex-row items-center px-6 py-4 border-b border-gray-100 bg-white">
          <TouchableOpacity onPress={() => router.back()}>
            <Image
              source={ICONS.arrowLeft}
              className="w-auto h-5 text-black"
              resizeMode="contain"
            />
          </TouchableOpacity>
          <Text className="text-black text-xl font-bold text-center flex-1">
            Profile
          </Text>
        </View>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <ScrollView
            className="flex-1 bg-white"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 100 }}
          >
            <View className="items-center py-8">
              <View className="relative">
                <Image
                  source={UserImage}
                  className="w-28 h-28 rounded-full"
                  resizeMode="cover"
                />
                <TouchableOpacity className="absolute bottom-0 right-0 bg-green-500 w-8 h-8 rounded-full items-center justify-center border-2 border-white">
                  <Image
                    source={camera}
                    className="w-4 h-4"
                    resizeMode="contain"
                    tintColor="white"
                  />
                </TouchableOpacity>
              </View>
            </View>

            <View className="px-6 gap-4">
              <View className="border border-gray-200 rounded-lg px-4 py-2">
                <TextInput
                  placeholder="Full Name"
                  className="text-base"
                  placeholderTextColor={"#A1A1A1"}
                />
              </View>
              <View className="border border-gray-200 rounded-lg px-4 py-2">
                <TextInput
                  placeholder="Username"
                  className="text-base"
                  placeholderTextColor={"#A1A1A1"}
                />
              </View>
              <View className="border border-gray-200 rounded-lg px-4 py-2">
                <TextInput
                  placeholder="Email Address"
                  className="text-base"
                  placeholderTextColor={"#A1A1A1"}
                  keyboardType="email-address"
                />
              </View>
              <View className="border border-gray-200 rounded-lg px-4 py-2">
                <TextInput
                  placeholder="Phone Number"
                  className="text-base"
                  keyboardType="phone-pad"
                  placeholderTextColor={"#A1A1A1"}
                />
              </View>
              <View className="border border-gray-200 rounded-lg p-4 h-28">
                <TextInput
                  placeholder="About yourself"
                  className="text-base"
                  placeholderTextColor={"#A1A1A1"}
                  multiline
                  numberOfLines={4}
                />
              </View>
              <View className="border border-gray-200 rounded-lg px-4 py-2 flex-row items-center justify-between">
                <TextInput
                  placeholder="Password"
                  className="text-base flex-1"
                  secureTextEntry={!showPassword}
                  placeholderTextColor={"#A1A1A1"}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Image
                    source={showPassword ? eye : eyeHide}
                    className="w-6 h-6"
                    resizeMode="contain"
                  />
                </TouchableOpacity>
              </View>
            </View>
            <View className="absolute bottom-0 left-0 right-0 p-6 bg-white">
              <TouchableOpacity className="bg-green-500 rounded-lg py-4">
                <Text className="text-white text-center text-lg font-bold">
                  Save Changes
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
};

export default EditProfile;
