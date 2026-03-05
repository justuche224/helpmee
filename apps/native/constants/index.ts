import OnBoardingImage1 from "@/assets/images/landing/on-boarding-1.png";
import OnBoardingImage2 from "@/assets/images/landing/on-boarding-2.png";
import OnBoardingImage3 from "@/assets/images/landing/on-boarding-3.png";
import Logo from "@/assets/images/logo.png";
import bookmark from "@/assets/icons/bookmark.png";
import home from "@/assets/icons/home.png";
import plus from "@/assets/icons/plus.png";
import profile from "@/assets/icons/profile.png";
import leftArrow from "@/assets/icons/left-arrow.png";
import menu from "@/assets/icons/menu.png";
import search from "@/assets/icons/search.png";
import upload from "@/assets/icons/upload.png";
import rightArrow from "@/assets/icons/right-arrow.png";
import logout from "@/assets/icons/logout.png";
import eyeHide from "@/assets/icons/eye-hide.png";
import eye from "@/assets/icons/eye.png";
import play from "@/assets/icons/play.png";
import edit from "@/assets/icons/edit.png";
import trash from "@/assets/icons/trash.png";
import menuHorizontal from "@/assets/icons/menu-horizontal.png";
import tabBarHome from "@/assets/icons/tabs/home.png";
import tabBarHomeFilled from "@/assets/icons/tabs/home-filled.png";
import tabBarStore from "@/assets/icons/tabs/store.png";
import tabBarStoreFilled from "@/assets/icons/tabs/store.png";
import tabBarProfile from "@/assets/icons/tabs/profile.png";
import tabBarProfileFilled from "@/assets/icons/tabs/profile.png";
import tabBarWallet from "@/assets/icons/tabs/wallet.png";
import tabBarWalletFilled from "@/assets/icons/tabs/wallet.png";
import airtime from "@/assets/icons/home/airtime.png";
import createShop from "@/assets/icons/home/create.png";
import notificationBell from "@/assets/icons/home/notification-bell.png";
import notificationDot from "@/assets/icons/home/notification-dot.png";
import store from "@/assets/icons/home/Store.png";
import toBank from "@/assets/icons/home/to-bank.png";
import verifyAccount from "@/assets/icons/home/verify-account.png";
import chat from "@/assets/icons/home/chat.png";
import card from "@/assets/icons/home/card.png";
import arrowLeft from "@/assets/icons/home/arrow-left.png";
import glo from "@/assets/icons/airtime/glo.png";
import mtn from "@/assets/icons/airtime/mtn.png";
import airtel from "@/assets/icons/airtime/airtel.png";
import nineMobile from "@/assets/icons/airtime/9mobile.png";
import account from "@/assets/icons/profile/account.png";
import cards from "@/assets/icons/profile/cards.png";
import logoutProfile from "@/assets/icons/profile/logout.png";
import security from "@/assets/icons/profile/security.png";
import help from "@/assets/icons/profile/help.png";
import shop from "@/assets/icons/profile/shop.png";
import arrowRight from "@/assets/icons/profile/arrow.png";
import verify from "@/assets/icons/profile/verify.png";
import checkmark from "@/assets/icons/profile/checkmark.png";
import clock from "@/assets/icons/profile/clock.png";
import camera from "@/assets/icons/profile/camera.png";
import arrowDown from "@/assets/icons/arrow-down.png";
import mapPin from "@/assets/icons/shop/map-pin.png";
import cart from "@/assets/icons/shop/cart.png";
import checkMark from "@/assets/icons/shop/check-mark.png";
import HeartFilledIcon from "@/assets/icons/shop/heart-filled.png";
import HeartIcon from "@/assets/icons/shop/heart.png";
import StarIcon from "@/assets/icons/shop/star.png";
import NigeriaFlag from "@/assets/icons/nigeria.png";
import SuccessGreen from "@/assets/icons/wallet/succes-green.png";

export const API_URL = process.env.EXPO_PUBLIC_SERVER_URL;

export const STORAGE_KEYS = {
  ONBOARDING_SEEN: "onboardingSeen",
  SHOP_ONBOARDING_COMPLETED: "shopOnboardingCompleted",
} as const;

export const NAV_THEME = {
  light: {
    background: "hsl(0 0% 100%)",
    border: "hsl(220 13% 91%)",
    card: "hsl(0 0% 100%)",
    notification: "hsl(0 84.2% 60.2%)",
    primary: "hsl(221.2 83.2% 53.3%)",
    text: "hsl(222.2 84% 4.9%)",
  },
  dark: {
    background: "hsl(222.2 84% 4.9%)",
    border: "hsl(217.2 32.6% 17.5%)",
    card: "hsl(222.2 84% 4.9%)",
    notification: "hsl(0 72% 51%)",
    primary: "hsl(217.2 91.2% 59.8%)",
    text: "hsl(210 40% 98%)",
  },
};

export const ONBOARDING_IMAGES = [
  OnBoardingImage1,
  OnBoardingImage2,
  OnBoardingImage3,
];

export const LOGO = Logo;

export const ICONS = {
  play,
  bookmark,
  home,
  plus,
  profile,
  leftArrow,
  menu,
  search,
  upload,
  rightArrow,
  logout,
  eyeHide,
  eye,
  airtime,
  createShop,
  notificationBell,
  notificationDot,
  store,
  toBank,
  verifyAccount,
  chat,
  card,
  arrowLeft,
  edit,
  trash,
  menuHorizontal,
  arrowDown,
  mapPin,
  cart,
  phone: chat,
  checkMark,
  HeartFilledIcon,
  HeartIcon,
  StarIcon,
  NigeriaFlag,
  SuccessGreen,
};

export const TABBARICONS = {
  tabBarHome,
  tabBarHomeFilled,
  tabBarProfile,
  tabBarProfileFilled,
  tabBarStore,
  tabBarStoreFilled,
  tabBarWallet,
  tabBarWalletFilled,
};

export const NETWORK_PROVIDERS = {
  glo,
  mtn,
  airtel,
  nineMobile,
};

export const PROFILE_ICONS = {
  account,
  cards,
  logoutProfile,
  security,
  help,
  shop,
  arrowRight,
  verify,
  checkmark,
  clock,
  camera,
  eye,
  eyeHide,
};
