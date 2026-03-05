import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Image,
  ScrollView,
  Modal,
} from "react-native";
import { ICONS } from "@/constants";
import arrowDown from "@/assets/icons/arrow-down.png";

interface StoreDetailsStepProps {
  shopName: string;
  setShopName: (value: string) => void;
  ownerName: string;
  setOwnerName: (value: string) => void;
  countryCode: string;
  setCountryCode: (value: string) => void;
  phone: string;
  setPhone: (value: string) => void;
  country: string;
  setCountry: (value: string) => void;
  state: string;
  setState: (value: string) => void;
  zipCode: string;
  setZipCode: (value: string) => void;
  address: string;
  setAddress: (value: string) => void;
  onNext: () => void;
}

const StoreDetailsStep: React.FC<StoreDetailsStepProps> = ({
  shopName,
  setShopName,
  ownerName,
  setOwnerName,
  countryCode,
  setCountryCode,
  phone,
  setPhone,
  country,
  setCountry,
  state,
  setState,
  zipCode,
  setZipCode,
  address,
  setAddress,
  onNext,
}) => {
  const [showCountryOptions, setShowCountryOptions] = useState(false);
  const [showStateOptions, setShowStateOptions] = useState(false);

  const countryOptions = [
    "Nigeria",
    "Ghana",
    "Kenya",
    "South Africa",
    "Tanzania",
    "Uganda",
    "Rwanda",
    "Ethiopia",
    "Cameroon",
    "Ivory Coast",
  ];

  const stateOptions = [
    "Abia",
    "Adamawa",
    "Akwa Ibom",
    "Anambra",
    "Bauchi",
    "Bayelsa",
    "Benue",
    "Borno",
    "Cross River",
    "Delta",
    "Ebonyi",
    "Edo",
    "Ekiti",
    "Enugu",
    "FCT - Abuja",
    "Gombe",
    "Imo",
    "Jigawa",
    "Kaduna",
    "Kano",
    "Katsina",
    "Kebbi",
    "Kogi",
    "Kwara",
    "Lagos",
    "Nasarawa",
    "Niger",
    "Ogun",
    "Ondo",
    "Osun",
    "Oyo",
    "Plateau",
    "Rivers",
    "Sokoto",
    "Taraba",
    "Yobe",
    "Zamfara",
  ];

  const isValid =
    shopName.trim() &&
    ownerName.trim() &&
    phone.trim() &&
    country.trim() &&
    state.trim() &&
    zipCode.trim() &&
    address.trim();

  return (
    <>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="mt-6">
          <Text className="text-xl text-black font-semibold">
            Store Details
          </Text>
          <Text className="text-gray-500 mt-2 text-sm">
            Setup your shop by entering your description and let's give you a
            wonderful experience.
          </Text>
        </View>

        <View className="mt-6 flex-1 gap-4">
          <View className="w-full h-14 px-4 bg-gray-50 rounded-2xl border border-gray-200 flex-row items-center">
            <TextInput
              value={shopName}
              onChangeText={setShopName}
              placeholder="Shop name/title"
              placeholderTextColor="#8E9BAE"
              className="flex-1 text-black font-medium"
            />
          </View>

          <View className="w-full h-14 px-4 bg-gray-50 rounded-2xl border border-gray-200 flex-row items-center">
            <TextInput
              value={ownerName}
              onChangeText={setOwnerName}
              placeholder="Owners full name"
              placeholderTextColor="#8E9BAE"
              className="flex-1 text-black font-medium"
            />
          </View>

          <View className="w-full h-14 bg-gray-50 rounded-2xl border border-gray-200 flex-row items-center overflow-hidden">
            <TouchableOpacity className="flex-row items-center px-4 h-full border-r border-gray-200">
              <Text className="text-black font-semibold">{countryCode}</Text>
              <Image
                source={arrowDown}
                className="w-5 h-5 ml-2"
                resizeMode="contain"
              />
            </TouchableOpacity>
            <TextInput
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              placeholder="8084 - 456 - 140"
              placeholderTextColor="#8E9BAE"
              className="flex-1 px-4 text-black font-medium"
            />
          </View>

          <TouchableOpacity
            onPress={() => setShowCountryOptions(true)}
            activeOpacity={0.7}
            className="w-full h-14 px-4 bg-gray-50 rounded-2xl border border-gray-200 flex-row items-center justify-between"
          >
            <Text
              className={`font-medium ${
                country ? "text-black" : "text-[#8E9BAE]"
              }`}
            >
              {country || "Select Country"}
            </Text>
            <Image
              source={arrowDown}
              className="w-5 h-5"
              resizeMode="contain"
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setShowStateOptions(true)}
            activeOpacity={0.7}
            className="w-full h-14 px-4 bg-gray-50 rounded-2xl border border-gray-200 flex-row items-center justify-between"
          >
            <Text
              className={`font-medium ${state ? "text-black" : "text-[#8E9BAE]"}`}
            >
              {state || "Select State"}
            </Text>
            <Image
              source={arrowDown}
              className="w-5 h-5"
              resizeMode="contain"
            />
          </TouchableOpacity>

          <View className="w-full h-14 px-4 bg-gray-50 rounded-2xl border border-gray-200 flex-row items-center">
            <TextInput
              value={zipCode}
              onChangeText={setZipCode}
              keyboardType="number-pad"
              placeholder="Zipcode (Postal Code)"
              placeholderTextColor="#8E9BAE"
              className="flex-1 text-black font-medium"
            />
          </View>

          <View className="w-full min-h-[110px] px-4 py-3 bg-gray-50 rounded-2xl border border-gray-200">
            <TextInput
              value={address}
              onChangeText={setAddress}
              placeholder="Store's address"
              placeholderTextColor="#8E9BAE"
              className="text-black font-medium"
              multiline
              textAlignVertical="top"
            />
          </View>

          <View className="mt-2">
            <Text className="text-black font-bold mb-3">View Location</Text>
            <View className="w-full h-48 bg-gray-100 rounded-2xl border border-gray-200 overflow-hidden items-center justify-center">
              <View className="w-6 h-6 rounded-full bg-emerald-500" />
            </View>
          </View>
        </View>

        <TouchableOpacity
          onPress={onNext}
          disabled={!isValid}
          className={`my-16 w-full h-14 rounded-2xl items-center justify-center ${
            isValid ? "bg-emerald-500" : "bg-gray-300"
          }`}
          activeOpacity={0.9}
        >
          <Text className="text-white font-semibold text-base">Continue</Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal
        transparent={true}
        visible={showCountryOptions}
        animationType="fade"
        onRequestClose={() => setShowCountryOptions(false)}
      >
        <TouchableOpacity
          className="flex-1 bg-black/50 justify-center items-center"
          activeOpacity={1}
          onPressOut={() => setShowCountryOptions(false)}
        >
          <View className="bg-white rounded-lg w-4/5 max-h-3/4">
            <Text className="p-4 border-b border-gray-200 text-gray-400">
              --select country--
            </Text>
            <ScrollView
              showsVerticalScrollIndicator={false}
              className="max-h-80"
            >
              {countryOptions.map((countryOption) => (
                <TouchableOpacity
                  key={countryOption}
                  className="p-4 border-b border-gray-200"
                  onPress={() => {
                    setCountry(countryOption);
                    setShowCountryOptions(false);
                  }}
                >
                  <Text>{countryOption}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      <Modal
        transparent={true}
        visible={showStateOptions}
        animationType="fade"
        onRequestClose={() => setShowStateOptions(false)}
      >
        <TouchableOpacity
          className="flex-1 bg-black/50 justify-center items-center"
          activeOpacity={1}
          onPressOut={() => setShowStateOptions(false)}
        >
          <View className="bg-white rounded-lg w-4/5 max-h-3/4">
            <Text className="p-4 border-b border-gray-200 text-gray-400">
              --select state--
            </Text>
            <ScrollView
              showsVerticalScrollIndicator={false}
              className="max-h-80"
            >
              {stateOptions.map((stateOption) => (
                <TouchableOpacity
                  key={stateOption}
                  className="p-4 border-b border-gray-200"
                  onPress={() => {
                    setState(stateOption);
                    setShowStateOptions(false);
                  }}
                >
                  <Text>{stateOption}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

export default StoreDetailsStep;
