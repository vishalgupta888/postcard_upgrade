import { defaultSort } from "../services/fetchApIDataSchema";
import strapi from "./strapi";
const qs = require("qs");
const defaultPageSize = 100;
const defaultLimit = 25;
const defaultStart = 0;

const fetchPaginatedResults = async (
    apiName,
    filters = {},
    populate = {},
    sort = defaultSort,
    start,
    limit
) => {
    let data = [];
    let pageNo = 1;
    let pageCount = 1;
    try {
        do {
            let res = await strapi.find(apiName, {
                filters: filters,
                populate: populate,
                sort: sort,
                pagination: limit
                    ? {
                          limit: limit || defaultLimit,
                          start: start || defaultStart
                      }
                    : {
                          page: pageNo,
                          pageSize: defaultPageSize
                      }
            });
            if (res?.meta?.page) {
                data = [...data, ...res.data];
                pageNo = res.meta.page + 1;
                pageCount = res.meta.pageCount;
            } else if (res?.data) {
                data = res.data;
                pageNo++;
            } else {
                pageNo++;
                return res;
            }
        } while (pageNo <= pageCount);
    } catch (error) {
        //console.log(error);
    }

    return Array.isArray(data) && data.length === 1 ? data[0] : data;
};
// const getPostcardsByKeyword = {};
const getConfigs = async () => {
    return await strapi.find("config", {
        populate: {
            sharedSeo: {
                populate: {
                    metaImage: {
                        fields: ["url"]
                    }
                }
            }
        }
    });
};

const getBkmStory = async (slug) => {
    let data = [];
    let pageNo = 1;
    let pageCount = 1;
    try {
        do {
            let res = await strapi.find("bookmarks", {
                filters: { user: { slug: slug } },
                sort: "updatedAt:DESC",
                populate: {
                    user: {
                        fields: ["slug", "fullName"],
                        populate: ["social"]
                    },
                    postcard: {
                        populate: {
                            coverImage: { fields: ["url"] },
                            user: {
                                fields: ["fullName", "slug"],
                                populate: {
                                    company: {
                                        fields: ["name"],
                                        populate: {
                                            affiliations: {
                                                populate: ["*"]
                                            },
                                            icon: {
                                                populate: ["*"]
                                            }
                                        }
                                    }
                                }
                            },
                            bookmarks: {
                                populate: {
                                    user: {
                                        fields: ["fullName", "slug"],
                                        populate: {
                                            profilePic: {
                                                fields: ["url"]
                                            }
                                        }
                                    }
                                }
                            },
                            album: {
                                fields: ["slug", "name", "website"],
                                populate: {
                                    company: {
                                        fields: ["name"]
                                    }
                                }
                            },
                            country: { fields: ["name", "continent"] },
                            tags: { fields: ["name"] }
                        }
                    }
                },
                pagination: {
                    page: pageNo,
                    pageSize: 100
                }
            });
            if (res?.meta) {
                data.push(res.data);
                if (pageCount === 1) {
                    pageCount = res.meta.pagination.pageCount;
                }
            }
            pageNo++;
        } while (pageNo <= pageCount);
        data = data.flat();
        return data;
        // Pass data to the page via props
    } catch (err) {
        //console.log(err);
    }
};

const getPublications = async () => {
    return await strapi.find("publications", { sort: "priority" });
};

const getAlbumThemes = async () => {
    return await strapi.find("album-themes");
};
const getPostcardByFilter = async (filter) => {
    return await strapi.find("postcards", {
        filters: filter,
        populate: {
            coverImage: { fields: ["url"] },
            user: {
                fields: ["fullName", "slug"],
                populate: ["company", "social"]
            },
            bookmarks: {
                populate: {
                    user: {
                        fields: ["fullName", "slug"],
                        populate: {
                            profilePic: {
                                fields: ["url"]
                            }
                        }
                    }
                }
            },
            album: {
                fields: ["slug", "name", "website"],
                populate: {
                    company: {
                        fields: ["name"],
                        populate: {
                            icon: { fields: ["url"] }
                        }
                    },
                    coverImage: { fields: ["url"] }
                }
            },
            country: { fields: ["name", "continent"] },
            tags: { fields: ["name"] }
        }
    });
};

const getAlbumbySlug = async (slug) => {
    return await strapi.find("albums", {
        filters: { slug: slug },
        populate: {
            coverImage: { fields: ["url"] },
            directories: { populate: ["*"] },
            on_boarding: { fields: ["state"] },
            bestMonth: { populate: ["*"] },
            avgPricePerPerson: { populate: ["*"] },
            fixedDates: { populate: ["*"] },
            album_themes: { populate: ["*"] },
            user: { fields: ["slug"], populate: ["social"] },
            postcards: {
                populate: {
                    coverImage: { fields: ["url"] },
                    user: {
                        fields: ["fullName", "slug"],
                        populate: ["company", "social"]
                    },
                    bookmarks: {
                        populate: {
                            user: {
                                fields: ["fullName", "slug"],
                                populate: {
                                    profilePic: {
                                        fields: ["url"]
                                    }
                                }
                            }
                        }
                    },
                    album: { fields: ["name", "slug"] },
                    country: { fields: ["name", "continent"] },
                    tags: { fields: ["name"] }
                }
            },
            company: {
                fields: ["name"],
                populate: {
                    affiliations: {
                        populate: ["*"]
                    },
                    icon: {
                        populate: ["*"]
                    }
                }
            },
            country: { fields: ["name"] }
        }
    });
    ///?filters[slug]=" + slug + "&populate=*");
};
const getAlbumbyId = async (id) => {
    return await strapi.find("albums/" + id + "/?populate=*");
};
const getAllAlbumsWithSlug = async () => {
    await strapi.find("albums");
};

const getExpertbyUserLink = async (Userlink) => {
    return await strapi.find("users", {
        filters: { slug: Userlink },

        populate: {
            fields: ["bio", "email"],
            postcards: {
                populate: {
                    coverImage: { fields: ["url"] },
                    user: {
                        fields: ["fullName", "slug"],
                        populate: ["company", "social"]
                    },
                    country: { fileds: ["name"] },
                    tags: { fields: ["name"] }
                }
            },
            seo: {
                populate: {
                    metaImage: {
                        fields: ["url"],
                        populate: ["*"]
                    }
                }
            },
            coverImage: {
                fields: ["url", "id"]
            },

            albums: {
                populate: ["*"]
            },
            social: {
                populate: ["*"]
            },

            country: { fields: ["name"] },
            article: { populate: ["*"] },
            publication: { populate: ["*"] }
        }
    });
};
const getExpertbyId = async (id) => {
    return await strapi.find("users", {
        filters: { id: id },

        populate: {
            fields: ["email"],
            postcards: {
                populate: {
                    coverImage: { fields: ["url"] },
                    user: {
                        fields: ["fullName", "slug"],
                        populate: ["company", "social"]
                    },
                    country: { fileds: ["name"] },
                    tags: { fields: ["name"] }
                }
            },
            seo: {
                populate: {
                    metaImage: {
                        populate: ["*"]
                    }
                }
            },
            albums: {
                populate: ["*"]
            },
            social: {
                populate: ["*"]
            },
            country: { fields: ["name"] },
            article: { populate: ["*"] },
            publication: { populate: ["*"] }
        }
    });
};
const getExpertsWithUserlink = async () => {
    await strapi.find("users", {
        filters: { user_type: { name: { $ne: "Regular" } } }
    });
};
const getRegularMembers = async () => {
    await strapi.find("users", {
        filters: { user_type: { name: "Regular" } }
    });
};
const getLeadDataBySlug = async (slug) => {
    return await strapi.find("leads", {
        filters: { slug: slug },
        populate: {
            social: {
                populate: ["*"]
            },
            profilePic: { populate: ["*"] },
            country: { fields: ["name"] },
            user: {
                populate: {
                    albums: {
                        populate: {
                            country: {
                                fields: ["name"]
                            },
                            company: {
                                fields: ["name"]
                            },
                            coverImage: { fields: ["url"] },
                            on_boarding: { fields: ["state"] },
                            postcards: {
                                populate: {
                                    coverImage: { fields: ["url"] },
                                    user: {
                                        fields: ["fullName", "slug"],
                                        populate: ["company", "social"]
                                    },
                                    country: { fileds: ["name"] },
                                    tags: { fields: ["name"] }
                                }
                            },
                            user: {
                                fields: ["slug", "fullName"],
                                populate: ["social"]
                            }
                        }
                    },
                    user_type: { populate: ["*"] }
                }
            },
            article: {
                populate: {
                    publication: {
                        populate: ["*"]
                    }
                }
            },

            publication: { populate: ["*"] }
        }
    });
};
const getLeadTourBySlug = async (slug) => {
    return await strapi.find("lead-tours", {
        filters: { slug: slug },
        populate: {
            profilePic: {
                populate: ["*"]
            },
            social: { populate: ["*"] },
            country: {
                populate: { fields: ["name"] }
            }
        }
    });
};
const getLeadTourByEditCode = async (editCode) => {
    return await strapi.find("lead-tours", {
        filters: { accessCode: editCode },
        populate: {
            profilePic: {
                populate: ["*"]
            },
            social: { populate: ["*"] },
            country: {
                populate: { fields: ["name"] }
            }
        }
    });
};
const getLeadTourbyUser = async (profile) => {
    return await strapi.find("lead-tours", {
        filters: { user: profile },
        populate: {
            profilePic: {
                populate: ["*"]
            },
            social: { populate: ["*"] },
            country: {
                populate: { fields: ["name"] }
            }
        }
    });
};
const getLeadHotelBySlug = async (slug) => {
    return await strapi.find("lead-hotels", {
        filters: { slug: slug },
        populate: {
            profilePic: {
                populate: ["*"]
            },
            social: { populate: ["*"] },
            country: {
                populate: { fields: ["name"] }
            }
        }
    });
};
const getLeadHotelByEditCode = async (editCode) => {
    return await strapi.find("lead-hotels", {
        filters: { accessCode: editCode },
        populate: {
            profilePic: {
                populate: ["*"]
            },
            social: { populate: ["*"] },
            country: {
                populate: { fields: ["name"] }
            }
        }
    });
};
const getLeadHotelbyUser = async (profile) => {
    return await strapi.find("lead-hotels", {
        filters: { user: profile },
        populate: {
            profilePic: {
                populate: ["*"]
            },
            social: { populate: ["*"] },
            country: {
                populate: { fields: ["name"] }
            }
        }
    });
};
const getLeads = async (editCode) => {
    return await strapi.find("leads", {
        sort: "updatedAt:DESC",
        populate: {
            profilePic: {
                fields: ["url"]
            },
            country: "*",
            social: "*",
            user: {
                populate: ["*"]
            },
            article: {
                populate: {
                    publication: {
                        populate: ["*"]
                    }
                }
            },
            publication: "*"
        }
    });
};
const getLeadbyEditCode = async (editCode) => {
    return await strapi.find("leads", {
        filters: { accessCode: editCode },
        populate: {
            social: {
                populate: ["*"]
            },
            profilePic: { populate: ["*"] },
            country: { fields: ["name"] },
            user: {
                populate: ["*"]
            },
            article: {
                populate: {
                    publication: {
                        populate: ["*"]
                    }
                }
            },
            publication: { populate: ["*"] }
        }
    });
};
const getLeadbyUser = async (user) => {
    return await strapi.find("leads", {
        filters: { user: user },
        populate: {
            social: {
                populate: ["*"]
            },
            profilePic: { populate: ["*"] },
            country: { fields: ["name"] },
            user: {
                populate: ["*"]
            },
            article: {
                populate: {
                    publication: {
                        populate: ["*"]
                    }
                }
            },
            publication: { populate: ["*"] }
        }
    });
};
const getHubbySlug = async (slug) => {
    return await strapi.find("hubs/?slug=" + slug);
};
const getHubsWithSlug = async () => {
    await strapi.find("hubs/?slug_null=false");
};
const getPostcardbyCategory = async (story, cat = -1) => {
    if (cat < 0)
        return await strapi.find(
            "Postcards?visibility=true&story=" +
                story +
                "&_sort=created_at:DESC"
        );
    else
        return await strapi.find(
            "Postcards?visibility=true&story=" + story + "&category=" + cat
        );
};
const getDraftPostcards = async (story) => {
    return await strapi.find(
        "Postcards?filters[album]=" +
            story +
            "&filters[is_published][null]=true"
    );
};
const getDraftPostcardsByProfile = async (profile, story) =>
    await strapi.find(
        "Postcards?profile.id=" +
            profile +
            "&story=" +
            story +
            "&publicationState=preview&published_at_null=true&_sort=created_at:DESC"
    );

const getPostcardsbyTags = async (story, cat, tags) => {
    return await strapi.find(
        "Postcards/?story=" +
            story +
            "&category=" +
            cat +
            "&" +
            tags +
            "visibility=true"
    );
};
const getTabsbyCategory = async (story, cat = -1) => {
    if (cat < 0) return await strapi.find("hashtags/findWithStory?id=" + story);
    else
        return await strapi.find(
            "hashtags/findWithStory?id=" + story + "&category=" + cat
        );
};

const getbookmarkedPostcardsbyTag = async (city, profile, cat, tags) => {
    return await strapi.find(
        "mylikes/findWithDetails/?category=" +
            cat +
            "&rcity=" +
            city +
            "&profile=" +
            profile +
            "&" +
            tags +
            "visibility=true"
    );
};
const getOwnStories = async (profile) => {
    // return await strapi.find("albums/?filters[user]=" + profile);
    let pageNo = 1;
    let pageCount = 1;
    let data = [];
    do {
        const res = await strapi.find("albums", {
            filters: {
                user: profile
            },
            populate: {
                country: {
                    fields: ["name", "continent"]
                },
                album_themes: { populate: ["*"] },
                bestMonth: { populate: ["*"] },
                avgPricePerPerson: { populate: ["*"] },
                fixedDates: { populate: ["*"] },
                company: {
                    fields: ["name"]
                },
                coverImage: { fields: ["url"] },
                on_boarding: { fields: ["state"] },
                postcards: {
                    populate: {
                        coverImage: { fields: ["url"] },
                        user: {
                            fields: ["fullName", "slug"],
                            populate: ["company", "social"]
                        },
                        country: { fileds: ["name"] },
                        tags: { fields: ["name"] }
                    }
                },
                user: {
                    fields: ["slug", "fullName"],
                    populate: {
                        social: {
                            populate: ["*"]
                        },
                        company: {
                            fields: ["name"]
                        }
                    }
                }
            },
            pagination: {
                page: pageNo,
                pageSize: 50
            }
        });
        if (res?.meta) {
            data.push(res.data);
            if (pageCount === 1) {
                pageCount = res.meta.pagination.pageCount;
            }
        }
        pageNo++;
    } while (pageNo <= pageCount);
    // Pass data to the page via props
    data = data.flat();
    return data;
};

const getTagsByWord = async (word) => {
    return await strapi.find(
        "tags?sort=name&filters[name][$startsWith]=" + word
    );
};

const getorCreateTagsByName = async (nameList) => {
    const query = qs.stringify({
        list: nameList
    });
    return await strapi.find("tags-get-create?" + query);
};
const getCityByWord = async (word) => {
    if (word && word.length > 0 && word.indexOf("*") > 0) {
        let country = encodeURIComponent(word.substr(0, word.lastIndexOf("*")));
        word = word.substr(word.lastIndexOf("*") + 1);
        return await strapi.find(
            "rcities/?word=" +
                word +
                "&rcountry.Name=" +
                country +
                "&_sort=Name"
        );
    }
    return await strapi.find("rcities/?word=" + word + "&_sort=Name");
};
const getCountryByName = async (country) => {
    return await strapi.find("rcountries/?Name=" + country);
};
const postCountry = async (country) => {
    return await strapi.create("rcountries", country);
};
const getCityByName = async (country, city) => {
    return await strapi.find("rcities/?rcountry=" + country + "&Name=" + city);
};
const postCity = async (city) => {
    return await strapi.create("rcities", city);
};
const getPOIid = async (placeId) => {
    return await strapi.find("pois/?PlaceId=" + placeId);
};
const updatePostCard = async (id, postcard) => {
    return await strapi.update("postcards", id, postcard);
};
const updateConfig = async (id, configs) => {
    return await strapi.update("config", id, configs);
};
const updateCompany = async (id, data) => {
    return await strapi.update("companies", id, data);
};
//postPoi
const postPoi = async (poi) => {
    return await strapi.create("pois", poi);
};
const deletePostcard = async (deletePostcard) => {
    return await strapi.delete("postcards", deletePostcard);
};
const deleteStory = async (story) => {
    return await strapi.delete("albums", story);
};
const getCategories = async () => {
    return await strapi.find("categories");
};
const getCategoriesbyId = async (cat) => {
    return await strapi.find("categories/?id=" + cat);
};
const updateStory = async (id, data) => {
    return await strapi.update("albums", id, data);
};
const getCountryByWord = async (word) => {
    return await strapi.find("countries?filters[name][$startsWith]=" + word);
};

const getProfileLikes = async (profile) => {
    return await strapi.find("mylikes/?profile=" + profile);
};
const getTourBkms = async (profile) => {
    return await strapi.find("bookmarks/?profile=" + profile);
};
const getPodCastsBkms = async (profile) => {
    return await strapi.find("bookmarkpodcasts/?profile=" + profile);
};
const addBookMark = async (bookmark) => {
    return await strapi.create("bookmarks", bookmark);
};
const deleteBookMark = async (bookmark) => {
    return await strapi.delete("bookmarks", bookmark);
};
const updateProfile = async (id, profile) => {
    return await strapi.update("users", id, profile);
};
const cacheBurstStory = async (story) => {
    return await strapi.find("stories/bustcache/" + story);
};
const cacheBurstUser = async (user) => {
    return await strapi.find("users/bustcache/" + user);
};
const getCountriesByContinent = async (continent) => {
    return await strapi.find("countries/?filters[continent]=" + continent, {
        sort: "name",
        pagination: {
            page: 1,
            pageSize: 100
        }
    });
};
const getCountryById = async (id) => {
    return await strapi.find("countries/" + id);
};
const getFollowers = async (slug) => {
    let pageNo = 1;
    let pageCount = 1;
    let data = [];
    try {
        do {
            let res = await strapi.find("follows", {
                filters: { follower: { slug: slug } },
                populate: {
                    follower: {
                        fields: ["id", "slug", "fullName"],
                        populate: {
                            company: { fields: ["name"] },
                            profilePic: { fields: ["url"] },
                            albums: {
                                populate: ["*"]
                            }
                        }
                    },
                    following: {
                        fields: ["id", "slug", "fullName"],
                        populate: {
                            company: { fields: ["name"] },
                            profilePic: { fields: ["url"] },
                            albums: {
                                populate: ["*"]
                            }
                        }
                    }
                },
                pagination: {
                    page: pageNo,
                    pageSize: 100
                }
            });
            if (res?.meta) {
                data.push(res.data);
                if (pageCount === 1) {
                    pageCount = res.meta.pagination.pageCount;
                }
            }
            pageNo++;
        } while (pageNo <= pageCount);
        data = data.flat();
        return data;
        // Pass data to the page via props
    } catch (err) {
        //console.log(err);
    }
};
const getFollowings = async (slug) => {
    let data = [];
    let pageNo = 1;
    let pageCount = 1;

    try {
        do {
            let res = await strapi.find("follows", {
                filters: { following: { slug: slug } },
                populate: {
                    follower: {
                        fields: ["id", "slug", "fullName"],
                        populate: {
                            company: { fields: ["name"] },
                            profilePic: { fields: ["url"] },
                            albums: {
                                populate: ["*"]
                            }
                        }
                    },
                    following: {
                        fields: ["id", "slug", "fullName"],
                        populate: {
                            company: { fields: ["name"] },
                            profilePic: { fields: ["url"] },
                            albums: {
                                populate: ["*"]
                            }
                        }
                    }
                },
                pagination: {
                    page: pageNo,
                    pageSize: 100
                }
            });
            if (res?.meta) {
                data.push(res.data);
                if (pageCount === 1) {
                    pageCount = res.meta.pagination.pageCount;
                }
            }
            pageNo++;
        } while (pageNo <= pageCount);
        data = data.flat();
        return data;
        // Pass data to the page via props
    } catch (err) {
        //console.log(err);
    }
};
const getScheduledCalls = async () => {
    return await strapi.find("call-schedules");
};
const getScheduledCallsbyProfileStory = async (profile, story) => {
    return await strapi.find(
        "call-schedules/?guest=" +
            profile +
            "&story=" +
            story +
            "&_sort=created_at:DESC"
    );
};
const getScheduledCallsbyProfile = async (profile) => {
    return await strapi.find(
        "call-schedules/?guest=" + profile + "&status=scheduled&_sort=startDate"
    );
};
const postScheduledCall = async (scheduledCall) => {
    return await strapi.create("call-schedules", scheduledCall);
};
const addPostcardFlag = async (postcardFlag) => {
    return await strapi.create("flag-postcard", postcardFlag);
};
const createProfile = async (profile) => {
    return await strapi.create("profiles", profile);
};
const createSubscription = async (subscriber) => {
    return await strapi.create("subscriptions", subscriber);
};
const createStory = async (data) => {
    return await strapi.create("albums", data);
};
const createEmptyPostcard = async (postcard) => {
    return await strapi.create("Postcards", postcard);
};

const getInterests = async () => {
    return await strapi.find("interests");
};
const addInvitation = async (invite) => {
    return await strapi.create("invitations", invite);
};
const deleteInvitation = async (invite) => {
    return await strapi.delete("invitations", invite);
};
const addRating = async (rating) => {
    return await strapi.create("ratings", rating);
};
const getRating = async (profile, story) => {
    return await strapi.find(
        "ratings/?profile=" +
            profile +
            "&story=" +
            story +
            "&_sort=created_at:DESC"
    );
};
const updateRating = async (rate, review) => {
    return await strapi.update("ratings", rate, review);
};

const addTourBookMark = async (tourBkm) => {
    return await strapi.create("bookmarks", tourBkm);
};
const deleteTourBookMark = async (tourBkm) => {
    return await strapi.delete("bookmarks", tourBkm);
};
const addPodCastsBookMark = async (tourBkm) => {
    return await strapi.create("bookmarkpodcasts", tourBkm);
};
const deletePodCastsBookMark = async (tourBkm) => {
    return await strapi.delete("bookmarkpodcasts", tourBkm);
};
const updateSignup = async (data) => {
    return await strapi.create("sign-ups", data);
};
//https://proconnect.postcard.travel/signups/validate
const validateSignup = async (access_code) => {
    return await strapi.request("post", "sign-up/custom/validate", {
        data: { access_code: access_code }
    });
};
const fetchMetaTags = async (links) => {
    links = links.filter((link) => link.link?.length > 0);
    if (links?.length > 0)
        return await strapi.request("post", "/sign-up/custom/getURLMetadata", {
            data: links
        });
    else return [];
};
const FetchPages = async () => {
    let tempPages = [];
    let pageNo = 1;
    let pageCount = 1;
    try {
        do {
            let res = await strapi.find("albums", {
                filters: {
                    isFeatured: true
                },
                populate: ["slug", "name"],
                sort: "priority",
                pagination: {
                    page: pageNo,
                    pageSize: 100
                }
            });
            if (res?.meta) {
                tempPages.push(res.data);
                if (pageCount === 1) {
                    pageCount = res.meta.pagination.pageCount;
                }
            }
            pageNo++;
        } while (pageNo <= pageCount);
        tempPages = tempPages.flat();
        return tempPages;
    } catch (err) {
        console.log(err);
    }
};

const updateStoryState = async (id, data) => {
    return await strapi.update("album-stages", id, data);
};
const getStoryStatusData = async () => {
    let pageNo = 1;
    let pageCount = 1;
    let data = [];
    do {
        const res = await strapi.find("album-stages", {
            populate: ["album.postcards", "*"],
            pagination: {
                page: pageNo,
                pageSize: 100
            }
        });
        if (res?.meta) {
            data.push(res.data);
            if (pageCount == 1) {
                pageCount = res.meta.pagination.pageCount;
            }
        }
        pageNo++;
    } while (pageNo <= pageCount);
    // Pass data to the page via props
    data = data.flat();
    return data;
};
const getCountries = async () => {
    let pageNo = 1;
    let pageCount = 1;
    let data = [];
    do {
        const res = await strapi.find("countries", {
            pagination: {
                page: pageNo,
                pageSize: 50
            }
        });
        if (res?.meta) {
            data.push(res.data);
            if (pageCount === 1) {
                pageCount = res.meta.pagination.pageCount;
            }
        }
        pageNo++;
    } while (pageNo <= pageCount);
    // Pass data to the page via props
    data = data.flat();
    return data;
};
const getStorybyState = async (filter) => {
    return await strapi.find(
        "album-stages/?filters[state]=" + filter + "&populate=*"
    );
};
const getLoyaltyCardDetail = async (cardNum) => {
    return await strapi.find(
        "loyalty-cards/?filters[cardNumber]=" + cardNum + "&populate=*"
    );
};

const getDirectorybySlug = async (slug) => {
    return await strapi.find(
        "directories/?filters[slug]=" + slug + "&populate=*"
    );
};

const getAffiliationbySlug = async (slug) => {
    return await strapi.find(
        "affiliations/?filters[slug]=" +
            slug +
            "&populate[companies][populate][albums][populate][postcards][populate][country]=*"
    );
};
const getAffiliations = async (slug) => {
    return await strapi.find(
        "affiliations&populate[companies][populate][albums]=*"
    );
};

const updateLeads = async (id, data) => {
    return await strapi.update("leads", id, data);
};
const updateLeadTour = async (id, data) => {
    return await strapi.update("lead-tours", id, data);
};
const updateLeadHotel = async (id, data) => {
    return await strapi.update("lead-hotels", id, data);
};
const getStartupDetail = async (slug) => {
    let post = [];
    const tourData = await getAlbumbySlug(slug);
    const profileData = await getExpertbyUserLink(slug);
    const leadData = await getLeadDataBySlug(slug);
    const leadTourData = await getLeadTourBySlug(slug);
    const leadHotelData = await getLeadHotelBySlug(slug);
    if (tourData?.data?.[0]) {
        post.push(tourData.data[0]);
        if (post && post[0]) {
            post[0].type = "tour";
        }
    } else if (profileData && profileData[0]) {
        post.push(profileData[0]);
        if (post && post[0]) {
            post[0].type = "profile";
        }
    } else if (leadData && leadData.data[0]) {
        post.push(leadData.data[0]);
        if (post && post[0]) {
            post[0].type = "lead";
        }
    } else if (leadTourData && leadTourData.data[0]) {
        post.push(leadTourData.data[0]);
        if (post && post[0]) {
            post[0].type = "lead-tour";
        }
    } else if (leadHotelData && leadHotelData.data[0]) {
        post.push(leadHotelData.data[0]);
        if (post && post[0]) {
            post[0].type = "lead-hotel";
        }
    }
    return post;
};
const postStoryLead = async (lead) => {
    return await strapi.create("leads", lead);
};
const postTourLead = async (lead) => {
    return await strapi.create("lead-tours", lead);
};
const postHotelLead = async (lead) => {
    return await strapi.create("lead-hotels", lead);
};
const createContactUs = async (contact) => {
    return await strapi.create("contact-uses", contact);
};
const createDBEntry = async (api, data) => {
    return await strapi.create(api, data);
};
const removeFollowing = async (api, id) => {
    return await strapi.delete(api, id);
};
const updateDBValue = async (api, id, data) => {
    return await strapi.update(api, id, data);
};
const getPostcardsByUser = async (filter) => {
    let data = [];
    let pageNo = 1;
    let pageCount = 1;
    try {
        do {
            let res = await strapi.find("postcards", {
                ...filter,
                populate: {
                    coverImage: { fields: ["url"] },
                    user: {
                        fields: ["fullName", "slug"],
                        populate: ["company", "social"]
                    },
                    bookmarks: {
                        populate: {
                            user: {
                                fields: ["fullName", "slug"],
                                populate: {
                                    profilePic: {
                                        fields: ["url"]
                                    }
                                }
                            }
                        }
                    },
                    album: {
                        fields: ["slug"],
                        populate: {
                            company: {
                                fields: ["name"]
                            }
                        }
                    },
                    country: { fields: ["name", "continent"] },
                    tags: { fields: ["name"] }
                },
                sort: "updatedAt:DESC",
                pagination: {
                    page: 1,
                    pageSize: 100
                }
            });
            if (res?.meta) {
                data.push(res.data);
                if (pageCount === 1) {
                    pageCount = res.meta.pagination.pageCount;
                }
            }
            pageNo++;
        } while (pageNo <= pageCount);
        data = data.flat();

        // Pass data to the page via props
    } catch (err) {
        //console.log(err);
    }
    return data;
};
const getPostcardsByCountry = async (countryName) => {
    let data = [];
    let pageNo = 1;
    let pageCount = 1;
    let filtersApplied = countryName
        ? {
              country: { name: countryName.toString() },
              album: {
                  isFeatured: true,
                  isActive: true,
                  on_boarding: { state: "approved" }
              },
              isComplete: true
          }
        : {
              album: {
                  isFeatured: true,
                  isActive: true,
                  on_boarding: { state: "approved" }
              },
              isComplete: true
          };
    let paginationApplied = countryName
        ? {
              page: 1,
              pageSize: 100
          }
        : {
              limit: 100
          };
    try {
        do {
            let res = await strapi.find("postcards", {
                filters: filtersApplied,

                populate: {
                    coverImage: { fields: ["url"] },
                    user: {
                        fields: ["fullName", "slug"],
                        populate: ["company", "social"]
                    },
                    bookmarks: {
                        populate: {
                            user: {
                                fields: ["fullName", "slug"],
                                populate: {
                                    profilePic: {
                                        fields: ["url"]
                                    }
                                }
                            }
                        }
                    },
                    album: {
                        fields: ["slug", "name", "website"],
                        populate: {
                            company: {
                                fields: ["name"]
                            }
                        }
                    },
                    country: { fields: ["name", "continent"] },
                    tags: { populate: ["*"] }
                },
                sort: "updatedAt:DESC",
                pagination: paginationApplied
            });
            if (res?.meta) {
                data.push(res.data);
                if (pageCount === 1) {
                    pageCount = res.meta.pagination.pageCount;
                }
            }
            pageNo++;
        } while (pageNo <= pageCount);
        data = data.flat();

        // Pass data to the page via props
    } catch (err) {
        //console.log(err);
    }
    return data;
};
export {
    getPostcardbyCategory,
    getPostcardsByUser,
    createDBEntry,
    removeFollowing,
    updateDBValue,
    getPostcardsByCountry,
    getPostcardsbyTags,
    getTabsbyCategory,
    getDraftPostcards,
    postTourLead,
    postHotelLead,
    getbookmarkedPostcardsbyTag,
    getTagsByWord,
    getDraftPostcardsByProfile,
    getCityByWord,
    getOwnStories,
    getorCreateTagsByName,
    getStoryStatusData,
    getCountryByName,
    postCountry,
    getCityByName,
    postCity,
    getPOIid,
    updatePostCard,
    postPoi,
    deletePostcard,
    deleteStory,
    getCategories,
    getCategoriesbyId,
    updateStory,
    getCountryByWord,
    getProfileLikes,
    addBookMark,
    deleteBookMark,
    updateProfile,
    getAlbumbySlug,
    getAlbumbyId,
    getAllAlbumsWithSlug,
    getConfigs,
    getExpertsWithUserlink,
    getExpertbyUserLink,
    getHubbySlug,
    getHubsWithSlug,
    updateConfig,
    cacheBurstStory,
    getCountriesByContinent,
    getCountryById,
    getFollowers,
    getScheduledCalls,
    postScheduledCall,
    getScheduledCallsbyProfileStory,
    getScheduledCallsbyProfile,
    addPostcardFlag,
    createProfile,
    createSubscription,
    createStory,
    createEmptyPostcard,
    getFollowings,
    getInterests,
    addInvitation,
    deleteInvitation,
    addRating,
    getRating,
    updateRating,
    addTourBookMark,
    deleteTourBookMark,
    addPodCastsBookMark,
    deletePodCastsBookMark,
    getTourBkms,
    getPodCastsBkms,
    getStartupDetail,
    updateSignup,
    validateSignup,
    updateStoryState,
    createContactUs,
    getStorybyState,
    getAffiliations,
    getAffiliationbySlug,
    getCountries,
    cacheBurstUser,
    getExpertbyId,
    fetchMetaTags,
    postStoryLead,
    updateLeads,
    getLeadbyEditCode,
    getPublications,
    getAlbumThemes,
    getLeads,
    getLeadDataBySlug,
    getLeadTourBySlug,
    getLeadbyUser,
    updateLeadTour,
    getLeadTourByEditCode,
    getLeadHotelByEditCode,
    getLeadTourbyUser,
    getLeadHotelbyUser,
    updateLeadHotel,
    updateCompany,
    getBkmStory,
    FetchPages,
    getPostcardByFilter,
    getLoyaltyCardDetail,
    fetchPaginatedResults,
    getRegularMembers
};
