import {
  Image,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
  TextInput,
} from "react-native";
import React, { useState } from "react";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { ICONS } from "@/constants";
import { router } from "expo-router";
import Subtract from "@/assets/icons/cards/subtract.png";
import helpmeeBlackLogo from "@/assets/icons/cards/helpmee-black.png";

const Index = () => {
  const [activeTab, setActiveTab] = useState("Cards");
  const [cardholderName, setCardholderName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");

  const cards = [
    {
      id: 1,
      type: "visa",
      number: "6754 7890 3759 2421",
      holder: "Richard Chike",
      expiry: "05/25",
      color: "yellow",
    },
    {
      id: 2,
      type: "mastercard",
      number: "6754 7890 3759 2421",
      holder: "Richard Chike",
      expiry: "05/25",
      color: "green",
    },
  ];

  const formatCardNumber = (text: string) => {
    const cleaned = text.replace(/\s/g, "");
    const chunks = cleaned.match(/.{1,4}/g) || [];
    setCardNumber(chunks.join(" ").substr(0, 19));
  };

  const formatExpiryDate = (text: string) => {
    const cleaned = text.replace(/\D/g, "");
    if (cleaned.length >= 2) {
      setExpiryDate(cleaned.substr(0, 2) + "/" + cleaned.substr(2, 2));
    } else {
      setExpiryDate(cleaned);
    }
  };

  const CardComponent = ({ card }: { card: any }) => (
    <View
      className={`rounded-2xl p-6 mx-6 mb-4 relative overflow-hidden ${
        card.color === "yellow" ? "bg-yellow-400" : "bg-green-500"
      }`}
    >
      <View className="absolute top-0 right-0 w-40 h-40 rounded-full border-4 border-white opacity-20 -mr-20 -mt-20" />
      <View className="absolute bottom-0 right-0 w-32 h-32 rounded-full border-4 border-white opacity-20 -mr-16 -mb-16" />

      <View className="flex-row justify-between items-start mb-6">
        <View className="flex-row items-center">
          <Image
            source={helpmeeBlackLogo}
            className="w-6 h-6 mr-2"
            resizeMode="contain"
          />
          <Text className="text-black font-medium">Universal Card</Text>
        </View>
        <View className="w-8 h-8 bg-white rounded-full opacity-80 flex items-center justify-center">
          <Image source={Subtract} className="w-6 h-6" resizeMode="contain" />
        </View>
      </View>

      <Text className="text-black text-2xl font-bold mb-6 tracking-wider">
        {card.number}
      </Text>

      <View className="flex-row justify-between items-end">
        <View>
          <Text className="text-black font-medium">{card.holder}</Text>
        </View>
        <View>
          <Text className="text-black font-[200] text-sm opacity-80">
            Expiry date
          </Text>
          <Text className="text-black font-medium">{card.expiry}</Text>
        </View>
        <View>
          <Text className="text-black font-bold text-lg">
            {card.type === "visa" ? "VISA" : ""}
          </Text>
          {card.type === "mastercard" && (
            <View className="flex-row">
              <View className="w-6 h-6 bg-red-500 rounded-full mr-1" />
              <View className="w-6 h-6 bg-yellow-500 rounded-full" />
            </View>
          )}
        </View>
      </View>
    </View>
  );

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
            Credit & Debit Card
          </Text>
        </View>

        <View className="flex-row px-6 py-4 border-b border-gray-100">
          <TouchableOpacity
            onPress={() => setActiveTab("Cards")}
            className="flex-1"
          >
            <Text
              className={`text-center text-lg font-medium pb-2 ${
                activeTab === "Cards" ? "text-black" : "text-gray-400"
              }`}
            >
              Cards
            </Text>
            {activeTab === "Cards" && (
              <View className="h-1 bg-green-500 rounded-full" />
            )}
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setActiveTab("Add Cards")}
            className="flex-1"
          >
            <Text
              className={`text-center text-lg font-medium pb-2 ${
                activeTab === "Add Cards" ? "text-black" : "text-gray-400"
              }`}
            >
              Add Cards
            </Text>
            {activeTab === "Add Cards" && (
              <View className="h-1 bg-green-500 rounded-full" />
            )}
          </TouchableOpacity>
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <ScrollView className="flex-1">
            {activeTab === "Cards" ? (
              <View className="py-6">
                {cards.map((card) => (
                  <CardComponent key={card.id} card={card} />
                ))}
              </View>
            ) : (
              <>
                <CardComponent card={cards[0]} />
                <View className="px-6 py-6">
                  <View className="gap-4 mt-6">
                    <View className="space-y-2">
                      <TextInput
                        className="w-full h-14 px-4 bg-gray-50 rounded-xl border border-gray-200 text-base text-black"
                        placeholder="Richard Chike"
                        placeholderTextColor="#9CA3AF"
                        value={cardholderName}
                        onChangeText={setCardholderName}
                      />
                    </View>

                    <View className="space-y-2">
                      <TextInput
                        className="w-full h-14 px-4 bg-gray-50 rounded-xl border border-gray-200 text-base text-black"
                        placeholder="6754 7890 3759 2421"
                        placeholderTextColor="#9CA3AF"
                        value={cardNumber}
                        onChangeText={formatCardNumber}
                        keyboardType="numeric"
                        maxLength={19}
                      />
                    </View>

                    <View className="flex-row gap-4">
                      <View className="flex-1">
                        <TextInput
                          className="w-full h-14 px-4 bg-gray-50 rounded-xl border border-gray-200 text-base text-black"
                          placeholder="05/25"
                          placeholderTextColor="#9CA3AF"
                          value={expiryDate}
                          onChangeText={formatExpiryDate}
                          keyboardType="numeric"
                          maxLength={5}
                        />
                      </View>
                      <View className="flex-1">
                        <TextInput
                          className="w-full h-14 px-4 bg-gray-50 rounded-xl border border-gray-200 text-base text-black"
                          placeholder="012"
                          placeholderTextColor="#9CA3AF"
                          value={cvv}
                          onChangeText={setCvv}
                          keyboardType="numeric"
                          maxLength={3}
                          secureTextEntry
                        />
                      </View>
                    </View>

                    <TouchableOpacity className="w-full bg-green-500 rounded-xl py-4 mt-8">
                      <Text className="text-white text-center text-lg font-semibold">
                        Add Card
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
};

export default Index;
