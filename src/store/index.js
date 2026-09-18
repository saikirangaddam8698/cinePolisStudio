import { createStore } from "vuex";
import axios from "axios";

const DEFAULT_TMDB_TOKEN =
  process.env.VUE_APP_TMDB_API_TOKEN ||
  "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI1NGJlMWUzMTk2YzcwZmM2ZjUxOTEwYmFlN2JjZGRhZCIsIm5iZiI6MTcyOTY4MDczMi45MDEsInN1YiI6IjY3MThkNTVjYzc4MDJjYzUwMzU5YTcxMiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.mmd_oVE0cpvWbt-rGore0a7z864gQUWvcR87QE-Tg24";

const tmdbClient = axios.create({
  baseURL: "https://api.themoviedb.org/3",
  headers: {
    accept: "application/json",
    Authorization: `Bearer ${DEFAULT_TMDB_TOKEN}`,
  },
});

let cachedGlobalActors = null;
const regionalActorsCache = new Map();

const store = createStore({
  state: {
    searchTxt: "",
    selectedLanguage: "",
    moviesData: [],
    tvshowsData: [],
    actorsData: [],
    trendingData: [],
    trendingTvData: [],
    topRatedMovies: [],
    movieGenres: [],
    tvGenres: [],
    searchResults: [],
    isSearching: false,
    activeDetailItem: null,
    activeItemVideos: [],
    activeItemCredits: null,
    isDetailLoading: false,
    showAiChat: false,
    showAiSettings: false,
  },

  mutations: {
    setSearchTxt(state, text) {
      state.searchTxt = text;
    },
    setSelectedLanguage(state, lang) {
      state.selectedLanguage = lang;
    },
    setMoviesData(state, data) {
      state.moviesData = data;
    },
    setTvShowsData(state, data) {
      state.tvshowsData = data;
    },
    setActorsData(state, data) {
      state.actorsData = data;
    },
    setTrendingData(state, data) {
      state.trendingData = data;
    },
    setTrendingTvData(state, data) {
      state.trendingTvData = data;
    },
    setTopRatedMovies(state, data) {
      state.topRatedMovies = data;
    },
    setMovieGenres(state, genres) {
      state.movieGenres = genres;
    },
    setTvGenres(state, genres) {
      state.tvGenres = genres;
    },
    setSearchResults(state, results) {
      state.searchResults = results;
    },
    setIsSearching(state, status) {
      state.isSearching = status;
    },
    setActiveDetailItem(state, item) {
      state.activeDetailItem = item;
    },
    setActiveItemVideos(state, videos) {
      state.activeItemVideos = videos;
    },
    setActiveItemCredits(state, credits) {
      state.activeItemCredits = credits;
    },
    setIsDetailLoading(state, status) {
      state.isDetailLoading = status;
    },
    toggleAiChat(state, show) {
      state.showAiChat = typeof show === "boolean" ? show : !state.showAiChat;
    },
    toggleAiSettings(state, show) {
      state.showAiSettings = typeof show === "boolean" ? show : !state.showAiSettings;
    },
  },

  actions: {
    async fetchGenres({ commit }) {
      try {
        const [movieRes, tvRes] = await Promise.all([
          tmdbClient.get("/genre/movie/list?language=en-US"),
          tmdbClient.get("/genre/tv/list?language=en-US"),
        ]);
        commit("setMovieGenres", movieRes.data?.genres || []);
        commit("setTvGenres", tvRes.data?.genres || []);
      } catch (err) {
        console.error("Error fetching genres:", err);
      }
    },

    async fetchData({ commit, state, dispatch }, { apiType, page = 1, append = false, existing = [], language = null, genre = null, sortBy = null }) {
      try {
        let endpoint = "";
        const langFilter = language !== null ? language : state.selectedLanguage;
        const sort = sortBy || "popularity.desc";

        if (apiType === "movies") {
          endpoint = `/discover/movie?include_adult=false&include_video=false&language=en-US&page=${page}&sort_by=${sort}`;
          if (langFilter) {
            endpoint += `&with_original_language=${langFilter}`;
          }
          if (genre) {
            endpoint += `&with_genres=${genre}`;
          }
        } else if (apiType === "tvshows") {
          endpoint = `/discover/tv?include_adult=false&include_null_first_air_dates=false&language=en-US&page=${page}&sort_by=${sort}`;
          if (langFilter) {
            endpoint += `&with_original_language=${langFilter}`;
          }
          if (genre) {
            endpoint += `&with_genres=${genre}`;
          }
        } else if (apiType === "actors") {
          if (page === 1) {
            return await dispatch("fetchActorsByRegion", langFilter || "");
          }
          endpoint = `/person/popular?language=en-US&page=${page}`;
        }

        const res = await tmdbClient.get(endpoint);
        const results = res.data?.results || [];
        const finalData = append ? [...existing, ...results] : results;

        if (apiType === "movies") {
          commit("setMoviesData", finalData);
        } else if (apiType === "tvshows") {
          commit("setTvShowsData", finalData);
        } else if (apiType === "actors") {
          commit("setActorsData", finalData);
        }
        return results;
      } catch (error) {
        console.error(`Error fetching ${apiType}:`, error);
        return [];
      }
    },

    async fetchActorsByRegion({ commit }, lang) {
      const REGION_META = {
        "": { name: "Global", flag: "🌐" },
        en: { name: "Hollywood", flag: "🇺🇸" },
        hi: { name: "Bollywood", flag: "🇮🇳" },
        te: { name: "Tollywood", flag: "🇮🇳" },
        ta: { name: "Kollywood", flag: "🇮🇳" },
        ko: { name: "K-Drama", flag: "🇰🇷" },
        ja: { name: "Japan / Anime", flag: "🇯🇵" },
        es: { name: "Spanish", flag: "🇪🇸" },
        fr: { name: "French", flag: "🇫🇷" },
      };

      // 1. GLOBAL / ALL REGIONS: Aggregate top actors from every major cinema culture
      if (!lang) {
        if (cachedGlobalActors && cachedGlobalActors.length > 0) {
          commit("setActorsData", cachedGlobalActors);
          return cachedGlobalActors;
        }

        try {
          const popPromise = tmdbClient
            .get("/person/popular?language=en-US&page=1")
            .catch(() => ({ data: { results: [] } }));

          const regionalLangs = ["te", "hi", "ta", "ko"];
          const regionalMoviePromises = regionalLangs.map((l) =>
            tmdbClient
              .get(
                `/discover/movie?include_adult=false&language=en-US&page=1&sort_by=popularity.desc&with_original_language=${l}`
              )
              .catch(() => ({ data: { results: [] } }))
          );

          const [popRes, ...movieResults] = await Promise.all([
            popPromise,
            ...regionalMoviePromises,
          ]);

          const actorMap = new Map();

          // Add global popular stars
          const popStars = popRes.data?.results || [];
          popStars.forEach((actor) => {
            actorMap.set(actor.id, {
              ...actor,
              region_name: "Hollywood / Global",
              region_flag: "🌐",
            });
          });

          // For each region, fetch cast for top 2 movies to gather key stars
          const creditsJobs = [];
          movieResults.forEach((res, index) => {
            const l = regionalLangs[index];
            const meta = REGION_META[l] || { name: l.toUpperCase(), flag: "🎬" };
            const movies = res.data?.results?.slice(0, 2) || [];
            movies.forEach((m) => {
              creditsJobs.push({
                movie: m,
                meta,
                promise: tmdbClient
                  .get(`/movie/${m.id}/credits?language=en-US`)
                  .catch(() => null),
              });
            });
          });

          const creditsResponses = await Promise.all(
            creditsJobs.map((j) => j.promise)
          );

          creditsResponses.forEach((cr, idx) => {
            if (cr?.data?.cast) {
              const { movie, meta } = creditsJobs[idx];
              cr.data.cast.slice(0, 5).forEach((actor) => {
                if (!actorMap.has(actor.id)) {
                  actorMap.set(actor.id, {
                    ...actor,
                    known_for_department: actor.known_for_department || "Acting",
                    known_for: [movie],
                    region_name: meta.name,
                    region_flag: meta.flag,
                  });
                }
              });
            }
          });

          const allRegionsActors = Array.from(actorMap.values());
          if (allRegionsActors.length > 0) {
            cachedGlobalActors = allRegionsActors;
            commit("setActorsData", allRegionsActors);
            return allRegionsActors;
          }
        } catch (e) {
          console.error("Error fetching all regions actors:", e);
        }

        try {
          const fallback = await tmdbClient.get("/person/popular?language=en-US&page=1");
          const popularList = fallback.data?.results || [];
          if (popularList.length > 0) {
            cachedGlobalActors = popularList;
            commit("setActorsData", popularList);
            return popularList;
          }
        } catch (fbErr) {
          console.error("Fallback popular actors error:", fbErr);
        }
        return;
      }

      // 2. SPECIFIC REGION SELECTED (e.g. Tollywood, Bollywood, K-Drama)
      if (regionalActorsCache.has(lang)) {
        commit("setActorsData", regionalActorsCache.get(lang));
        return regionalActorsCache.get(lang);
      }

      try {
        const meta = REGION_META[lang] || { name: lang.toUpperCase(), flag: "🎬" };
        const res = await tmdbClient.get(
          `/discover/movie?include_adult=false&language=en-US&page=1&sort_by=popularity.desc&with_original_language=${lang}`
        );
        const topMovies = res.data?.results?.slice(0, 6) || [];

        const creditsResponses = await Promise.all(
          topMovies.map((m) =>
            tmdbClient.get(`/movie/${m.id}/credits?language=en-US`).catch(() => null)
          )
        );

        const actorMap = new Map();
        creditsResponses.forEach((cr, index) => {
          if (cr?.data?.cast) {
            cr.data.cast.slice(0, 6).forEach((actor) => {
              if (!actorMap.has(actor.id)) {
                actorMap.set(actor.id, {
                  ...actor,
                  known_for_department: actor.known_for_department || "Acting",
                  known_for: [topMovies[index]],
                  region_name: meta.name,
                  region_flag: meta.flag,
                });
              }
            });
          }
        });

        const regionalActors = Array.from(actorMap.values());
        if (regionalActors.length > 0) {
          regionalActorsCache.set(lang, regionalActors);
          commit("setActorsData", regionalActors);
          return regionalActors;
        } else {
          const fallback = await tmdbClient.get("/person/popular?language=en-US&page=1");
          commit("setActorsData", fallback.data?.results || []);
        }
      } catch (err) {
        console.error("Error fetching regional actors:", err);
      }
    },

    async searchActors({ commit }, { query, page = 1, append = false, existing = [] }) {
      if (!query || !query.trim()) return [];
      try {
        const res = await tmdbClient.get(
          `/search/person?query=${encodeURIComponent(query.trim())}&include_adult=false&language=en-US&page=${page}`
        );
        const results = res.data?.results || [];
        const finalData = append ? [...existing, ...results] : results;
        commit("setActorsData", finalData);
        return results;
      } catch (err) {
        console.error("Error searching actors:", err);
        return [];
      }
    },

    async fetchTrending({ commit }) {
      try {
        const [trendingMovies, trendingTv, topRated] = await Promise.all([
          tmdbClient.get("/trending/movie/day?language=en-US"),
          tmdbClient.get("/trending/tv/day?language=en-US"),
          tmdbClient.get("/movie/top_rated?language=en-US&page=1"),
        ]);
        if (trendingMovies.data?.results) {
          commit("setTrendingData", trendingMovies.data.results);
        }
        if (trendingTv.data?.results) {
          commit("setTrendingTvData", trendingTv.data.results);
        }
        if (topRated.data?.results) {
          commit("setTopRatedMovies", topRated.data.results);
        }
      } catch (error) {
        console.error("Error fetching trending data:", error);
      }
    },

    async searchMulti({ commit }, query) {
      if (!query || !query.trim()) {
        commit("setSearchResults", []);
        return;
      }
      commit("setIsSearching", true);
      try {
        const res = await tmdbClient.get(
          `/search/multi?query=${encodeURIComponent(query)}&include_adult=false&language=en-US&page=1`
        );
        commit("setSearchResults", res.data?.results || []);
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        commit("setIsSearching", false);
      }
    },

    async fetchMovieByTitle({ dispatch }, title) {
      try {
        const res = await tmdbClient.get(
          `/search/movie?query=${encodeURIComponent(title)}&language=en-US&page=1`
        );
        if (res.data?.results && res.data.results.length > 0) {
          dispatch("openDetailModal", { item: res.data.results[0], type: "movie" });
          return true;
        }
        // Fallback search multi
        const multiRes = await tmdbClient.get(
          `/search/multi?query=${encodeURIComponent(title)}&language=en-US&page=1`
        );
        if (multiRes.data?.results && multiRes.data.results.length > 0) {
          const item = multiRes.data.results[0];
          dispatch("openDetailModal", { item, type: item.media_type || "movie" });
          return true;
        }
      } catch (err) {
        console.error("Error searching title for modal:", err);
      }
      return false;
    },

    async openDetailModal({ commit }, { item, type = "movie" }) {
      const mediaType = item.media_type || type;
      commit("setActiveDetailItem", { ...item, mediaType });
      commit("setActiveItemVideos", []);
      commit("setActiveItemCredits", null);
      commit("setIsDetailLoading", true);

      try {
        const id = item.id;
        const [videosRes, creditsRes] = await Promise.allSettled([
          tmdbClient.get(`/${mediaType}/${id}/videos?language=en-US`),
          tmdbClient.get(`/${mediaType}/${id}/credits?language=en-US`),
        ]);

        if (videosRes.status === "fulfilled") {
          commit("setActiveItemVideos", videosRes.value.data?.results || []);
        }
        if (creditsRes.status === "fulfilled") {
          commit("setActiveItemCredits", creditsRes.value.data || null);
        }
      } catch (err) {
        console.error("Error fetching item details/videos:", err);
      } finally {
        commit("setIsDetailLoading", false);
      }
    },

    closeDetailModal({ commit }) {
      commit("setActiveDetailItem", null);
      commit("setActiveItemVideos", []);
      commit("setActiveItemCredits", null);
    },
  },
});

export default store;
