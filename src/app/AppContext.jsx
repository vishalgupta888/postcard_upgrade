"use client";

import { createContext, useState, useEffect } from "react";
import { useRouter } from "next/router";
import strapi from "../../queries/strapi.js";
import * as ga from "../../services/googleAnalytics";
import initFacebookSDK from "../initFacebookSDK";
import {
  addBookMark,
  createDBEntry,
  deleteBookMark,
  getBkmStory,
  getCountries,
  getFollowers,
  getFollowings,
  removeFollowing,
} from "../../queries/strapiQueries";
import { useMediaQuery } from "@chakra-ui/react";

const AppContext = createContext({});

export const AppContextContainer = ({ children }) => {
  const [state, setState] = useState({
    metaValues: [],
    categories: {},
    interests: {},
    profile: null,
    profileLikes: [],
    profileFollowers: [],
    profileFollowings: [],
    tourBkms: [],
    podcastsBkms: [],
    profileFriends: [],
    firstLoad: [],
    ourStorySecs: [],
    featuredCountries: [],
    countryList: [],
    TourCountries: [],
    HotelsCountries: [],
    isHomepageCardFlipped: {
      index: "",
      flip: false,
      isCounter: false,
    },
    isSubscribeToNewsLetterShown: false,
  });

  const {
    metaValues,
    categories,
    interests,
    profile,
    profileLikes,
    profileFollowers,
    profileFollowings,
    tourBkms,
    podcastsBkms,
    profileFriends,
    firstLoad,
    ourStorySecs,
    featuredCountries,
    countryList,
    TourCountries,
    HotelsCountries,
    isHomepageCardFlipped,
    isSubscribeToNewsLetterShown,
  } = state;

  const router = useRouter();

  const refetchProfileLike = async () => {
    let res = await getBkmStory(profile?.slug);
    setState((prevState) => ({
      ...prevState,
      profile: res,
    }));
  };

  const getProfileFollowDetails = async () => {
    let followings = await getFollowers(profile?.slug);
    let followers = await getFollowings(profile?.slug);
    setState((prevState) => ({
      ...prevState,
      profileFollowers: followers,
      profileFollowings: followings,
    }));
  };

  useEffect(() => {
    const initialGetData = async () => {
      const data = localStorage.getItem("profile");
      let sections = await strapi.find("about-us-sections", {
        sort: "priority",
      });
      let countries = await strapi.find("albums/findcountries", {
        sort: "name:ASC",
      });
      let completeCountrylist = await getCountries();
      setState((prevState) => ({
        ...prevState,
        countryList: completeCountrylist,
        ourStorySecs: sections.data,
        featuredCountries: countries.sort((a, b) =>
          a.name.localeCompare(b.name)
        ),
      }));
      let Tcountries = await strapi.find("albums/findCountries?type=tours");
      setState((prevState) => ({
        ...prevState,
        TourCountries: Tcountries.sort((a, b) => a.name.localeCompare(b.name)),
      }));
      let Bcountries = await strapi.find("albums/findCountries?type=hotels");
      setState((prevState) => ({
        ...prevState,
        HotelsCountries: Bcountries.sort((a, b) =>
          a.name.localeCompare(b.name)
        ),
      }));
      initFacebookSDK();
      if (data) {
        setState((prevState) => ({
          ...prevState,
          profile: JSON.parse(data),
        }));
      }
    };
    initialGetData();
  }, []);

  useEffect(() => {
    if (profile && profile.id) {
      refetchProfileLike();
      getProfileFollowDetails();
    }
  }, [profile]);

  const handleMetaValues = (values) => {
    setState((prevState) => ({
      ...prevState,
      metaValues: { ...prevState.metaValues, ...values },
    }));
  };

  const updateUser = async (profile) => {
    let data = profile;
    if (!data && strapi.getToken()) data = await strapi.fetchUser();
    if (data) {
      localStorage.setItem("profile", JSON.stringify(data));
      setState((prevState) => ({
        ...prevState,
        profile: data,
      }));
    } else if (strapi.getToken()) logOut();
  };

  const handleProfile = (profile) => {
    setState((prevState) => ({
      ...prevState,
      ...profile,
    }));
    localStorage.setItem("profile", JSON.stringify(profile));
    if (!profile?.isReload && !profile?.isScheduler) {
      if (profile?.slug) router.push("/" + profile.slug);
      else window.location.reload();
    }
  };

  const CheckActiveProfile = (currentProfile) =>
    profile?.slug === currentProfile?.slug;

  const isFollowing = (checkProfile) => {
    if (profile && profileFollowings?.length > 0) {
      return profileFollowings.some(
        (item) => item?.following?.id === checkProfile
      );
    }
    return false;
  };

  const FollowOrUnFollow = async (checkProfile, callback) => {
    try {
      await getProfileFollowDetails();

      if (isFollowing(checkProfile)) {
        const delData = profileFollowings.find(
          (item) => item?.following?.id === checkProfile
        );

        if (delData) {
          const resp = await removeFollowing("follows", delData.id);
          if (resp) {
            resp.deleted = true;
            await getProfileFollowDetails();
            callback(resp);
          }
        }
      } else {
        const followData = {
          follower: profile.id,
          following: checkProfile,
        };
        const resp = await createDBEntry("follows", followData);
        if (resp) {
          resp.deleted = false;
          await getProfileFollowDetails();
          callback(resp);
        }
      }
    } catch (error) {
      // Handle errors appropriately
      console.error("Error in FollowOrUnFollow:", error);
    }
  };

  const AddRemoveLikes = async (postcard, todel, callback) => {
    try {
      await refetchProfileLike();

      let likeId = -1;
      if (!postcard.like) {
        const data = {
          user: profile.id,
          postcard: postcard.id,
        };
        const response = await addBookMark(data);
        callback(response?.data);
      } else {
        if (todel) {
          likeId = todel;
        } else {
          const data = profileLikes.find(
            (like) => like.postcard.toString() === postcard.id.toString()
          );
          likeId = data?.id;
        }
        const response = await deleteBookMark(likeId);
        callback(response?.data);
      }
    } catch (error) {
      // Handle errors appropriately
      console.error("Error in AddRemoveLikes:", error);
    }
  };

  const isTabletOrMobile = useMediaQuery("(max-width: 640px)");
  const isTablet = useMediaQuery("(max-width: 1224px,min-width:640px)");

  const logOut = () => {
    setState((prevState) => ({
      ...prevState,
      profile: null,
    }));
    localStorage.clear();
    router.push("/").then(() => {});
  };

  const callAuthService = async (provider, token, isSchedulerOpen, user) => {
    try {
      const respData = await strapi.authenticateProvider(provider, token);

      let userData = respData.user;
      ga.event({
        action: "event",
        category: "existinguser_signin_success",
        label: "signin_success_google",
        value: 1,
      });
      if (userData) {
        if (isSchedulerOpen) userData.isScheduler = true;

        handleProfile(userData);
      }
    } catch (error) {
      alert(error.toString());
    }
  };

  const isUserLoggedIn = () => {
    if (typeof window !== "undefined" && typeof localStorage !== "undefined") {
      const profile = JSON.parse(localStorage.getItem("profile"));
      return profile !== null;
    }
    return false;
  };

  const callTokenLogin = async (respData) => {
    try {
      const userData = respData.user;
      if (userData) handleProfile(userData);
    } catch (error) {
      alert(error.toString());
    }
  };

  return (
    <AppContext.Provider
      value={{
        ...state,
        isTabletOrMobile,
        isTablet,
        isActiveProfile: CheckActiveProfile,
        isUserLoggedIn,
        AddRemoveLikes,
        FollowOrUnFollow,
        isFollowing,
        callAuthService,
        callTokenLogin,
        updateUser,
        logOut,
      }}
    >
      {children(metaValues)}
    </AppContext.Provider>
  );
};

export default AppContext;
