import {
  Image,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
} from "react-native";
import React, { useState } from "react";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { ICONS } from "@/constants";
import { router } from "expo-router";
import GearIcon from "@/assets/icons/shop/gear.png";
import PlaceholderProductImage from "@/assets/images/shop/placeholder-product-image.png";
import ChickenRepublic from "@/assets/images/shop/chicken-republic.png";

interface Notification {
  id: string;
  type: "chat" | "order" | "system";
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  icon?: any;
  actionRequired?: boolean;
  orderNumber?: string;
}

const shadowStyle = Platform.select({
  ios: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  android: {
    elevation: 2,
  },
});

const notifications: Notification[] = [
  {
    id: "1",
    type: "chat",
    title: "Chicken Republic sent you to a chat",
    message: "Double cheese burger is available",
    timestamp: "2 mins ago",
    isRead: false,
    icon: ChickenRepublic,
    actionRequired: true,
  },
  {
    id: "2",
    type: "order",
    title: "Your order #123456789 has been delivered",
    message:
      "Please help us to confirm and rate your order to get 10% discount code for next order.",
    timestamp: "2 hours ago",
    isRead: false,
    icon: PlaceholderProductImage,
    orderNumber: "#123456789",
  },
  {
    id: "3",
    type: "order",
    title: "Your order #123456789 has been shipped successfully",
    message:
      "Please help us to confirm and rate your order to get 10% discount code for next order.",
    timestamp: "1 day ago",
    isRead: false,
    icon: PlaceholderProductImage,
    orderNumber: "#123456789",
  },
  {
    id: "4",
    type: "order",
    title: "Your order #123456789 has been confirmed",
    message: "Please help us to confirm and rate your order.",
    timestamp: "2 days ago",
    isRead: false,
    icon: PlaceholderProductImage,
    orderNumber: "#123456789",
  },
  {
    id: "5",
    type: "order",
    title: "Your order #123456789 has been canceled",
    message: "Please help us to confirm your order cancellation.",
    timestamp: "4 days ago",
    isRead: false,
    icon: PlaceholderProductImage,
    orderNumber: "#123456789",
  },
];

const Notifications = () => {
  const [notificationList, setNotificationList] = useState(notifications);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>(
    []
  );

  const handleLongPress = (notificationId: string) => {
    setIsSelectionMode(true);
    setSelectedNotifications([notificationId]);
  };

  const toggleSelection = (notificationId: string) => {
    if (selectedNotifications.includes(notificationId)) {
      setSelectedNotifications((prev) =>
        prev.filter((id) => id !== notificationId)
      );
    } else {
      setSelectedNotifications((prev) => [...prev, notificationId]);
    }
  };

  const handleMarkAllAsRead = () => {
    setNotificationList((prev) =>
      prev.map((notification) => ({ ...notification, isRead: true }))
    );
  };

  const handleMarkSelectedAsRead = () => {
    setNotificationList((prev) =>
      prev.map((notification) =>
        selectedNotifications.includes(notification.id)
          ? { ...notification, isRead: true }
          : notification
      )
    );
    setIsSelectionMode(false);
    setSelectedNotifications([]);
  };

  const exitSelectionMode = () => {
    setIsSelectionMode(false);
    setSelectedNotifications([]);
  };

  const handleNotificationPress = (notification: Notification) => {
    if (isSelectionMode) {
      toggleSelection(notification.id);
    } else {
      // Handle notification tap (navigate, mark as read, etc.)
      setNotificationList((prev) =>
        prev.map((n) => (n.id === notification.id ? { ...n, isRead: true } : n))
      );
    }
  };

  const getNotificationIcon = (notification: Notification) => {
    return notification.icon || ICONS.notificationBell;
  };

  const unreadCount = notificationList.filter((n) => !n.isRead).length;

  return (
    <View className="flex-1 bg-white h-full">
      <StatusBar style="light" />
      <SafeAreaView className="flex-1 bg-white pb-16" edges={["top"]}>
        {/* Header */}
        <View className="px-4 py-4 border-b border-gray-100 bg-white">
          <View className="flex-row justify-between items-center">
            <TouchableOpacity
              onPress={
                isSelectionMode ? exitSelectionMode : () => router.back()
              }
            >
              <Image
                source={ICONS.arrowLeft}
                className="w-5 h-5"
                resizeMode="contain"
              />
            </TouchableOpacity>
            <Text className="text-black text-xl font-bold">Notifications</Text>
            <TouchableOpacity className="bg-green-100 rounded-lg p-2 relative">
              <Image
                source={ICONS.notificationBell}
                className="w-6 h-6"
                resizeMode="contain"
                tintColor="#19B360"
              />
              {unreadCount > 0 && (
                <View className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full justify-center items-center">
                  <Text className="text-white text-xs font-bold">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Action Bar */}
          {!isSelectionMode && (
            <View className="flex-row justify-between items-center mt-4">
              <TouchableOpacity
                onPress={handleMarkAllAsRead}
                className="bg-gray-100 rounded-2xl px-4 py-2"
              >
                <Text className="text-gray-700 font-medium">
                  Mark all as read
                </Text>
              </TouchableOpacity>
              <TouchableOpacity>
                <Image
                  source={GearIcon}
                  className="w-6 h-6"
                  resizeMode="contain"
                />
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Selection Mode Header */}
        {isSelectionMode && (
          <View className="px-4 py-3 bg-gray-50 border-b border-gray-200">
            <View className="flex-row justify-between items-center">
              <Text className="text-gray-600 font-medium">
                {selectedNotifications.length} selected
              </Text>
              <TouchableOpacity onPress={exitSelectionMode}>
                <Text className="text-gray-500 font-medium">Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Notifications List */}
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View className="px-4 py-4">
            {notificationList.map((notification, index) => {
              const isSelected = selectedNotifications.includes(
                notification.id
              );
              const isFirstUnread =
                !notification.isRead &&
                (index === 0 || notificationList[index - 1].isRead);

              return (
                <View key={notification.id}>
                  {/* Unread Separator */}
                  {isFirstUnread && index > 0 && (
                    <View className="border-t border-gray-200 my-4" />
                  )}

                  <TouchableOpacity
                    onPress={() => handleNotificationPress(notification)}
                    onLongPress={() => handleLongPress(notification.id)}
                    className={`rounded-2xl p-4 mb-3 ${
                      notification.isRead ? "bg-white" : "bg-green-50"
                    } ${isSelected ? "bg-blue-100" : ""}`}
                    style={notification.isRead ? {} : shadowStyle}
                  >
                    <View className="flex-row">
                      {/* Selection Checkbox */}
                      {isSelectionMode && (
                        <View className="mr-3 justify-center">
                          <View
                            className={`w-6 h-6 rounded border-2 ${
                              isSelected
                                ? "bg-green-500 border-green-500"
                                : "border-gray-300"
                            } justify-center items-center`}
                          >
                            {isSelected && (
                              <Text className="text-white text-xs font-bold">
                                ✓
                              </Text>
                            )}
                          </View>
                        </View>
                      )}

                      {/* Notification Icon */}
                      <View className="mr-4">
                        {notification.type === "chat" ? (
                          <View className="w-12 h-12 rounded-full overflow-hidden">
                            <Image
                              source={getNotificationIcon(notification)}
                              className="w-full h-full"
                              resizeMode="cover"
                            />
                          </View>
                        ) : (
                          <View className="w-12 h-12 bg-gray-100 rounded-2xl p-2">
                            <Image
                              source={getNotificationIcon(notification)}
                              className="w-full h-full"
                              resizeMode="contain"
                            />
                          </View>
                        )}
                      </View>

                      {/* Notification Content */}
                      <View className="flex-1">
                        <View className="flex-row justify-between items-start mb-1">
                          <Text
                            className={`text-base font-semibold flex-1 mr-2 ${
                              notification.isRead
                                ? "text-gray-600"
                                : "text-gray-900"
                            }`}
                          >
                            {notification.title}
                          </Text>
                          <Text className="text-gray-400 text-sm">
                            {notification.timestamp}
                          </Text>
                        </View>

                        <Text
                          className={`text-sm leading-5 mb-3 ${
                            notification.isRead
                              ? "text-gray-500"
                              : "text-gray-700"
                          }`}
                        >
                          {notification.message}
                        </Text>

                        {/* Action Button for Chat Notifications */}
                        {notification.actionRequired && (
                          <TouchableOpacity className="bg-gray-100 rounded-lg px-4 py-2 self-start">
                            <Text className="text-gray-700 font-medium">
                              Reply
                            </Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        </ScrollView>

        {/* Bottom Action Bar for Selection Mode */}
        {isSelectionMode && selectedNotifications.length > 0 && (
          <View className="p-4 bg-white border-t border-gray-200">
            <TouchableOpacity
              onPress={handleMarkSelectedAsRead}
              className="bg-green-500 rounded-2xl py-4"
            >
              <Text className="text-white text-center font-bold text-lg">
                Mark As Read
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </SafeAreaView>
    </View>
  );
};

export default Notifications;
