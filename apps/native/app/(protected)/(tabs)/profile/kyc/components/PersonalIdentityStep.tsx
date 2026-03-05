import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Modal,
  Image,
  ScrollView,
} from "react-native";
import React, { useState } from "react";
import { ICONS } from "@/constants";
import arrowDown from "@/assets/icons/arrow-down.png";
import * as ImagePicker from "expo-image-picker";
import checkmark from "@/assets/icons/profile/checkmark.png";
import Toast from "react-native-toast-message";
import { useGradualAnimation } from "@/hooks/use-gradual-animation";
import Animated, { useAnimatedStyle } from "react-native-reanimated";

interface PersonalIdentityStepProps {
  fullName: string;
  setFullName: (value: string) => void;
  phone: string;
  setPhone: (value: string) => void;
  email: string;
  setEmail: (value: string) => void;
  identityType: string | null;
  setIdentityType: (value: string) => void;
  idNumber: string;
  setIdNumber: (value: string) => void;
  documentFront: string;
  setDocumentFront: (value: string) => void;
  documentBack: string;
  setDocumentBack: (value: string) => void;
  selfie: string;
  setSelfie: (value: string) => void;
  onNext: () => void;
}

const PersonalIdentityStep: React.FC<PersonalIdentityStepProps> = ({
  fullName,
  setFullName,
  phone,
  setPhone,
  email,
  setEmail,
  identityType,
  setIdentityType,
  idNumber,
  setIdNumber,
  documentFront,
  setDocumentFront,
  documentBack,
  setDocumentBack,
  selfie,
  setSelfie,
  onNext,
}) => {
  const [showIdentityOptions, setShowIdentityOptions] = useState(false);
  const identityOptions = ["NIN Number", "Driver's License", "Voter's Card"];
  const { height } = useGradualAnimation();
  const keyboardPadding = useAnimatedStyle(() => {
    return {
      height: height.value + 40,
    };
  }, []);

  const pickDocument = async (type: "front" | "back" | "selfie") => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        quality: 0.8,
        base64: true,
        selectionLimit: 1,
        allowsEditing: true,
        allowsMultipleSelection: false,
      });

      if (result.canceled) return;

      const asset = result.assets[0];
      if (!asset.base64) return;

      const mime = asset.mimeType || asset.type || "image/jpeg";
      const dataUri = `data:${mime};base64,${asset.base64}`;

      if (type === "front") {
        setDocumentFront(dataUri);
      } else if (type === "back") {
        setDocumentBack(dataUri);
      } else {
        setSelfie(dataUri);
      }
    } catch (err) {
      console.warn("Image pick error:", err);
      Toast.show({
        type: "error",
        text1: "Failed to pick image",
      });
    }
  };

  const handleNext = () => {
    if (
      fullName &&
      phone &&
      email &&
      identityType &&
      idNumber &&
      documentFront &&
      documentBack &&
      selfie
    ) {
      onNext();
    } else {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Please fill all fields and upload all required documents",
      });
    }
  };

  return (
    <View className="flex-1">
      <ScrollView showsVerticalScrollIndicator={false} className="mb-16">
        <View className="mb-4">
          <Text className="text-lg font-semibold text-black">
            Personal Identity Verification
          </Text>
          <Text className="text-[#8E9BAE] mt-1 text-sm font-normal">
            Fill in your personal information the form below to complete your
            verification
          </Text>
          <Text className="text-red-500 mt-2 text-sm font-normal">
            *Required fields
          </Text>
        </View>

        <View className="gap-4">
          <View>
            <TextInput
              className="border border-gray-300 rounded-lg p-3"
              placeholder="Full Name"
              value={fullName}
              aria-label="fullName"
              autoCapitalize="words"
              onChangeText={setFullName}
              autoComplete="name"
              textContentType="name"
              accessibilityLabel="Full Name"
              accessibilityHint="Enter your full name"
            />
          </View>
          <View>
            <View className="flex-row items-center border border-gray-300 rounded-lg">
              <TouchableOpacity className="flex-row items-center p-3 border-r border-gray-300">
                <Text>+234</Text>
                <Image
                  source={arrowDown}
                  className="w-4 h-4 ml-2"
                  resizeMode="contain"
                  aria-label="phoneCode"
                />
              </TouchableOpacity>
              <TextInput
                className="flex-1 p-3"
                placeholder="8084 - 456 - 140"
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
                aria-label="phoneNumber"
                autoComplete="tel"
                textContentType="telephoneNumber"
                accessibilityLabel="Phone Number"
                accessibilityHint="Enter your phone number"
              />
            </View>
          </View>
          <View>
            <TextInput
              className="border border-gray-300 rounded-lg p-3"
              placeholder="Enter email address"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
              aria-label="email"
              autoComplete="email"
              textContentType="emailAddress"
              accessibilityLabel="Email Address"
              accessibilityHint="Enter your email address"
            />
          </View>
          <View>
            <TouchableOpacity
              className="border border-gray-300 rounded-lg p-3 flex-row justify-between items-center"
              onPress={() => setShowIdentityOptions(true)}
            >
              <Text className={identityType ? "text-black" : "text-gray-400"}>
                {identityType || "Select identity type"}
              </Text>
              <Image
                source={arrowDown}
                className="w-4 h-4"
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>
          <View>
            <View className="flex-row items-center border border-gray-300 rounded-lg pr-3">
              <TextInput
                className="flex-1 p-3"
                placeholder="ID number"
                value={idNumber}
                onChangeText={setIdNumber}
                aria-label="idNumber"
              />
              {idNumber.length > 10 && (
                <Image
                  source={checkmark}
                  className="w-5 h-5"
                  resizeMode="contain"
                />
              )}
            </View>
          </View>

          <View>
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Document Front *
            </Text>
            <TouchableOpacity
              className="border-2 border-dashed border-gray-300 rounded-lg p-6 items-center justify-center bg-gray-50"
              onPress={() => pickDocument("front")}
            >
              {documentFront ? (
                <View className="items-center">
                  <Image
                    source={{ uri: documentFront }}
                    className="w-16 h-16 rounded-lg mb-2"
                    resizeMode="cover"
                  />
                  <Text className="text-green-500 text-sm font-normal text-center">
                    Document Front Selected
                  </Text>
                </View>
              ) : (
                <View className="items-center">
                  <Image source={ICONS.upload} className="w-6 h-6 mb-2" />
                  <Text className="text-gray-500 text-sm">
                    Upload front of document
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          <View>
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Document Back *
            </Text>
            <TouchableOpacity
              className="border-2 border-dashed border-gray-300 rounded-lg p-6 items-center justify-center bg-gray-50"
              onPress={() => pickDocument("back")}
            >
              {documentBack ? (
                <View className="items-center">
                  <Image
                    source={{ uri: documentBack }}
                    className="w-16 h-16 rounded-lg mb-2"
                    resizeMode="cover"
                  />
                  <Text className="text-green-500 text-sm font-normal text-center">
                    Document Back Selected
                  </Text>
                </View>
              ) : (
                <View className="items-center">
                  <Image source={ICONS.upload} className="w-6 h-6 mb-2" />
                  <Text className="text-gray-500 text-sm">
                    Upload back of document
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          <View>
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Selfie Photo *
            </Text>
            <Text className="text-xs text-gray-500 mb-2">
              A clear picture of your face
            </Text>
            <TouchableOpacity
              className="border-2 border-dashed border-gray-300 rounded-lg p-6 items-center justify-center bg-gray-50"
              onPress={() => pickDocument("selfie")}
            >
              {selfie ? (
                <View className="items-center">
                  <Image
                    source={{ uri: selfie }}
                    className="w-16 h-16 rounded-lg mb-2"
                    resizeMode="cover"
                  />
                  <Text className="text-green-500 text-sm font-normal text-center">
                    Selfie Selected
                  </Text>
                </View>
              ) : (
                <View className="items-center">
                  <Image source={ICONS.upload} className="w-6 h-6 mb-2" />
                  <Text className="text-gray-500 text-sm">
                    Take or upload a selfie
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>
        <TouchableOpacity
          className="bg-green-500 rounded-lg p-4 items-center justify-center mt-6 mb-4"
          onPress={handleNext}
        >
          <Text className="text-white font-bold text-base">Continue</Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal
        transparent={true}
        visible={showIdentityOptions}
        animationType="fade"
        onRequestClose={() => setShowIdentityOptions(false)}
      >
        <TouchableOpacity
          className="flex-1 bg-black/50 justify-center items-center"
          activeOpacity={1}
          onPressOut={() => setShowIdentityOptions(false)}
        >
          <View className="bg-white rounded-lg w-4/5">
            <Text className="p-4 border-b border-gray-200 text-gray-400">
              --select--
            </Text>
            {identityOptions.map((option) => (
              <TouchableOpacity
                key={option}
                className="p-4 border-b border-gray-200"
                onPress={() => {
                  setIdentityType(option);
                  setShowIdentityOptions(false);
                }}
              >
                <Text>{option}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
      <Animated.View style={keyboardPadding} />
    </View>
  );
};

export default PersonalIdentityStep;
