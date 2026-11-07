/* ==========================================================================
   SEEK — UI translation layer
   English is complete. Kinyarwanda, Luganda, French and Swahili cover the
   primary navigation and browsing language. Missing keys fall back to English.
   Catalogue titles are intentionally kept in their authored language.
   ========================================================================== */
(function () {
  "use strict";
  var SEEK = window.SEEK;

  var I18N = {
    en: {
      "nav.home": "Home", "nav.movies": "Movies", "nav.tv": "TV Shows", "nav.trailers": "Trailers",
      "nav.categories": "Categories", "nav.translators": "Translators",
      "nav.search": "Search", "nav.signin": "Sign in", "nav.join": "Join SEEK", "nav.profile": "Profile",
      "nav.library": "My library", "nav.admin": "Admin studio", "nav.logout": "Sign out",
      "nav.settings": "Preferences", "nav.menu": "Menu",
      "common.viewAll": "View all", "common.watchTrailer": "Watch trailer", "common.details": "View details",
      "common.favorite": "Favorite", "common.favorited": "In favorites", "common.watchlist": "Watchlist",
      "common.inWatchlist": "In watchlist", "common.watchMovie": "Watch movie", "common.download": "Download",
      "common.share": "Share", "common.report": "Report an issue", "common.play": "Play", "common.pause": "Pause",
      "common.resume": "Resume", "common.next": "Next", "common.prev": "Previous", "common.close": "Close",
      "common.cancel": "Cancel", "common.save": "Save", "common.delete": "Delete", "common.edit": "Edit",
      "common.clear": "Clear", "common.all": "All", "common.loadMore": "Load more", "common.search": "Search",
      "common.searchPlaceholder": "Search movies, shows, trailers, translators…",
      "common.noResults": "No results found", "common.noResultsHint": "Try a different title, genre, translator or language.",
      "common.min": "min", "common.rating": "Rating", "common.year": "Year", "common.genre": "Genre",
      "common.language": "Language", "common.translator": "Translator", "common.cast": "Cast",
      "common.director": "Director", "common.synopsis": "Synopsis", "common.related": "You may also like",
      "common.seasons": "Seasons", "common.episodes": "Episodes", "common.parts": "Available parts",
      "common.shareCopied": "Link copied to clipboard", "common.addedFav": "Added to favorites",
      "common.removedFav": "Removed from favorites", "common.addedWatchlist": "Added to watchlist",
      "common.removedWatchlist": "Removed from watchlist", "common.seeAll": "See all", "common.clearFilters": "Clear filters",
      "common.results": "results", "common.sortBy": "Sort by", "common.newest": "Newest first", "common.popular": "Most popular",
      "common.alphabetical": "A to Z", "common.topRated": "Top rated", "common.latest": "Latest",
      "common.upcoming": "Upcoming", "common.trending": "Trending", "common.minRating": "Minimum rating",
      "common.learnMore": "Learn more", "common.watchParty": "Watch party", "common.helpful": "Helpful",
      "common.reviews": "Community reviews", "common.rate": "Rate this title", "common.writeReview": "Share your thoughts",
      "common.submit": "Submit", "common.signInToReview": "Sign in to post a review.",
      "common.noReviews": "No community reviews yet. Start the conversation.",
      "common.loading": "Loading", "common.optional": "optional", "common.required": "required",
      "shelf.trending": "Trending now", "shelf.recent": "Recently added", "shelf.popularMovies": "Popular movies",
      "shelf.topRated": "Top rated movies", "shelf.recommended": "Recommended for you", "shelf.latestTrailers": "Latest trailers",
      "shelf.popularTV": "Popular TV shows", "shelf.continue": "Continue watching",
      "shelf.kinyarwanda": "Movies translated into Kinyarwanda", "shelf.luganda": "Movies translated into Luganda",
      "shelf.translators": "Featured translators", "shelf.top10": "Top 10 this week",
      "footer.tagline": "Discover. Watch. Explore.", "footer.explore": "Explore", "footer.company": "Company",
      "footer.legal": "Legal", "footer.about": "About SEEK", "footer.contact": "Contact us", "footer.privacy": "Privacy policy",
      "footer.terms": "Terms of service", "footer.help": "Help centre", "footer.dmca": "Content removal & copyright",
      "footer.newsletter": "The SEEK brief", "footer.newsletterHint": "New releases and translated cinema, once a week.",
      "footer.subscribe": "Subscribe", "footer.rights": "All rights reserved.", "footer.language": "Language",
      "footer.lowData": "Low-data mode", "footer.backToTop": "Back to top", "footer.made": "Made for people who love stories.",
      "auth.signin": "Sign in", "auth.signup": "Create account", "auth.email": "Email address", "auth.password": "Password",
      "auth.name": "Display name", "auth.confirmPassword": "Confirm password", "auth.forgot": "Forgot your password?",
      "auth.reset": "Reset password", "auth.noAccount": "New to SEEK?", "auth.hasAccount": "Already have an account?",
      "auth.logout": "Sign out", "auth.welcome": "Welcome back", "auth.invalid": "Email or password is incorrect.",
      "auth.created": "Your SEEK account is ready.", "auth.required": "Please complete the highlighted fields.",
      "auth.emailTaken": "An account already uses that email.", "auth.passwordShort": "Use at least 8 characters.",
      "auth.passwordMismatch": "Passwords do not match.", "auth.resetSent": "Reset code generated.",
      "auth.session": "You are signed in on this device.", "auth.guest": "You are browsing as a guest.",
      "player.previewMode": "Preview mode", "player.previewNote": "Simulated playback. Connect an authorised video source in production.",
      "player.quality": "Quality", "player.speed": "Speed", "player.subtitles": "Subtitles", "player.fullscreen": "Fullscreen",
      "player.officialTrailer": "Find the official trailer", "player.upNext": "Up next", "player.saved": "Progress saved",
      "library.title": "My library", "library.favorites": "Favorites", "library.watchlist": "Watchlist",
      "library.continue": "Continue watching", "library.recent": "Recently viewed", "library.savedTrailers": "Saved trailers",
      "library.empty": "Nothing here yet", "library.emptyHint": "Save something from the catalogue and it will appear here.",
      "library.remove": "Remove", "library.guestNote": "Your library is stored on this device. Sign in to keep it with your profile.",
      "search.title": "Search SEEK", "search.placeholder": "Titles, people, genres, translators…", "search.history": "Recent searches",
      "search.clearHistory": "Clear history", "search.movies": "Movies", "search.tv": "TV shows",
      "search.trailers": "Trailers", "search.translators": "Translators", "search.episodes": "Episodes",
      "home.customize": "Personalise home", "home.spotlight": "SEEK spotlight", "home.movieOfDay": "Movie of the day",
      "home.why": "Why we picked it", "home.moodTitle": "What are you in the mood for?", "home.moodHint": "Start with a feeling, not a title.",
      "home.moodCta": "Explore the mood", "home.guestNote": "Sign in to tune recommendations with your history.",
      "home.hero": "Featured this week"
    },

    fr: {
      "nav.home": "Accueil", "nav.movies": "Films", "nav.tv": "Séries", "nav.trailers": "Bandes-annonces",
      "nav.categories": "Catégories", "nav.translators": "Traducteurs", "nav.search": "Rechercher",
      "nav.signin": "Connexion", "nav.join": "Rejoindre SEEK", "nav.profile": "Profil", "nav.library": "Ma bibliothèque",
      "nav.admin": "Studio admin", "nav.logout": "Déconnexion", "nav.settings": "Préférences", "nav.menu": "Menu",
      "common.viewAll": "Tout voir", "common.watchTrailer": "Voir la bande-annonce", "common.details": "Détails",
      "common.favorite": "Favori", "common.favorited": "Dans les favoris", "common.watchlist": "À regarder",
      "common.inWatchlist": "Dans la liste", "common.watchMovie": "Regarder le film", "common.download": "Télécharger",
      "common.share": "Partager", "common.report": "Signaler", "common.play": "Lecture", "common.pause": "Pause",
      "common.resume": "Reprendre", "common.next": "Suivant", "common.prev": "Précédent", "common.close": "Fermer",
      "common.save": "Enregistrer", "common.cancel": "Annuler", "common.all": "Tout", "common.loadMore": "Charger plus",
      "common.search": "Rechercher", "common.searchPlaceholder": "Films, séries, bandes-annonces, traducteurs…",
      "common.noResults": "Aucun résultat", "common.noResultsHint": "Essayez un autre titre, genre, traducteur ou langue.",
      "common.year": "Année", "common.genre": "Genre", "common.language": "Langue", "common.translator": "Traducteur",
      "common.related": "Vous aimerez aussi", "common.seasons": "Saisons", "common.episodes": "Épisodes",
      "common.sortBy": "Trier par", "common.newest": "Plus récents", "common.popular": "Plus populaires",
      "common.alphabetical": "A à Z", "common.topRated": "Mieux notés", "common.latest": "Derniers",
      "common.upcoming": "À venir", "common.trending": "Tendances", "common.minRating": "Note minimale",
      "common.viewAll": "Tout voir", "common.loading": "Chargement", "common.submit": "Envoyer",
      "shelf.trending": "Tendances", "shelf.recent": "Ajouts récents", "shelf.popularMovies": "Films populaires",
      "shelf.topRated": "Mieux notés", "shelf.recommended": "Recommandés pour vous", "shelf.latestTrailers": "Dernières bandes-annonces",
      "shelf.popularTV": "Séries populaires", "shelf.continue": "Reprendre",
      "shelf.kinyarwanda": "Films traduits en kinyarwanda", "shelf.luganda": "Films traduits en luganda",
      "shelf.translators": "Traducteurs en vedette", "shelf.top10": "Top 10 de la semaine",
      "footer.tagline": "Découvrez. Regardez. Explorez.", "footer.explore": "Explorer", "footer.company": "Société",
      "footer.legal": "Légal", "footer.about": "À propos", "footer.contact": "Contact", "footer.privacy": "Confidentialité",
      "footer.terms": "Conditions", "footer.help": "Aide", "footer.dmca": "Retrait de contenu et droits",
      "footer.newsletter": "La lettre SEEK", "footer.newsletterHint": "Sorties et cinéma traduit, une fois par semaine.",
      "footer.subscribe": "S'abonner", "footer.rights": "Tous droits réservés.", "footer.language": "Langue",
      "footer.lowData": "Mode économie de données", "footer.backToTop": "Haut de page",
      "auth.signin": "Connexion", "auth.signup": "Créer un compte", "auth.email": "Adresse e-mail", "auth.password": "Mot de passe",
      "auth.name": "Nom d'affichage", "auth.confirmPassword": "Confirmer le mot de passe", "auth.forgot": "Mot de passe oublié ?",
      "auth.noAccount": "Nouveau sur SEEK ?", "auth.hasAccount": "Vous avez déjà un compte ?", "auth.logout": "Déconnexion",
      "library.title": "Ma bibliothèque", "library.favorites": "Favoris", "library.watchlist": "À regarder",
      "library.continue": "Reprendre", "library.recent": "Vus récemment", "library.savedTrailers": "Bandes-annonces enregistrées",
      "library.empty": "Rien pour l'instant", "library.emptyHint": "Enregistrez un titre pour le retrouver ici.",
      "search.title": "Rechercher sur SEEK", "search.history": "Recherches récentes", "search.clearHistory": "Effacer l'historique",
      "home.customize": "Personnaliser l'accueil", "home.spotlight": "Pleins feux SEEK", "home.movieOfDay": "Film du jour",
      "home.why": "Pourquoi ce choix", "home.moodTitle": "De quelle humeur êtes-vous ?", "home.moodHint": "Commencez par une émotion, pas par un titre.",
      "home.moodCta": "Explorer cette humeur", "home.guestNote": "Connectez-vous pour affiner vos recommandations."
    },

    sw: {
      "nav.home": "Nyumbani", "nav.movies": "Filamu", "nav.tv": "Vipindi", "nav.trailers": "Trela",
      "nav.categories": "Makundi", "nav.translators": "Watafsiri", "nav.search": "Tafuta",
      "nav.signin": "Ingia", "nav.join": "Jiunge na SEEK", "nav.profile": "Wasifu", "nav.library": "Maktaba yangu",
      "nav.admin": "Studio ya msimamizi", "nav.logout": "Toka", "nav.settings": "Mapendeleo", "nav.menu": "Menyu",
      "common.viewAll": "Tazama zote", "common.watchTrailer": "Tazama trela", "common.details": "Maelezo",
      "common.favorite": "Kipendwa", "common.favorited": "Ipo kwenye vipendwa", "common.watchlist": "Orodha ya kutazama",
      "common.inWatchlist": "Ipo kwenye orodha", "common.watchMovie": "Tazama filamu", "common.download": "Pakua",
      "common.share": "Shiriki", "common.report": "Ripoti", "common.play": "Cheza", "common.pause": "Sitisha",
      "common.resume": "Endelea", "common.next": "Ifuatayo", "common.prev": "Iliyotangulia", "common.close": "Funga",
      "common.save": "Hifadhi", "common.cancel": "Ghairi", "common.all": "Zote", "common.loadMore": "Pakia zaidi",
      "common.search": "Tafuta", "common.searchPlaceholder": "Filamu, vipindi, trela, watafsiri…",
      "common.noResults": "Hakuna matokeo", "common.noResultsHint": "Jaribu jina, aina, mtafsiri au lugha nyingine.",
      "common.year": "Mwaka", "common.genre": "Aina", "common.language": "Lugha", "common.translator": "Mtafsiri",
      "common.related": "Unaweza pia kupenda", "common.seasons": "Misimu", "common.episodes": "Vipindi",
      "common.sortBy": "Panga kwa", "common.newest": "Mpya kwanza", "common.popular": "Maarufu zaidi",
      "common.alphabetical": "A hadi Z", "common.topRated": "Zilizokadiriwa juu", "common.latest": "Mpya",
      "common.upcoming": "Zinazokuja", "common.trending": "Maarufu", "common.minRating": "Kiwango cha chini",
      "common.loading": "Inapakia", "common.submit": "Wasilisha",
      "shelf.trending": "Maarufu sasa", "shelf.recent": "Zilizoongezwa hivi karibuni", "shelf.popularMovies": "Filamu maarufu",
      "shelf.topRated": "Zilizokadiriwa juu", "shelf.recommended": "Inapendekezwa kwako", "shelf.latestTrailers": "Trela mpya",
      "shelf.popularTV": "Vipindi maarufu", "shelf.continue": "Endelea kutazama",
      "shelf.kinyarwanda": "Filamu kwa Kinyarwanda", "shelf.luganda": "Filamu kwa Luganda",
      "shelf.translators": "Watafsiri maarufu", "shelf.top10": "Nyota 10 wiki hii",
      "footer.tagline": "Gundua. Tazama. Chunguza.", "footer.explore": "Chunguza", "footer.company": "Kampuni",
      "footer.legal": "Kisheria", "footer.about": "Kuhusu SEEK", "footer.contact": "Wasiliana nasi", "footer.privacy": "Faragha",
      "footer.terms": "Masharti", "footer.help": "Msaada", "footer.dmca": "Uondoaji wa maudhui na hakimiliki",
      "footer.newsletter": "Barua ya SEEK", "footer.newsletterHint": "Matoleo mapya na sinema zilizotafsiriwa, kila wiki.",
      "footer.subscribe": "Jisajili", "footer.rights": "Haki zote zimehifadhiwa.", "footer.language": "Lugha",
      "footer.lowData": "Hali ya data ndogo", "footer.backToTop": "Juu",
      "auth.signin": "Ingia", "auth.signup": "Fungua akaunti", "auth.email": "Barua pepe", "auth.password": "Nenosiri",
      "auth.name": "Jina la kuonyesha", "auth.confirmPassword": "Rudia nenosiri", "auth.forgot": "Umesahau nenosiri?",
      "auth.noAccount": "Mgeni SEEK?", "auth.hasAccount": "Tayari una akaunti?", "auth.logout": "Toka",
      "library.title": "Maktaba yangu", "library.favorites": "Vipendwa", "library.watchlist": "Orodha ya kutazama",
      "library.continue": "Endelea kutazama", "library.recent": "Zilizotazamwa hivi karibuni", "library.savedTrailers": "Trela zilizohifadhiwa",
      "library.empty": "Hakuna kitu bado", "library.emptyHint": "Hifadhi kitu kutoka katalogi na kitaonekana hapa.",
      "search.title": "Tafuta SEEK", "search.history": "Utafutaji wa hivi karibuni", "search.clearHistory": "Futa historia",
      "home.customize": "Binafsisha nyumbani", "home.spotlight": "Angalizo la SEEK", "home.movieOfDay": "Filamu ya leo",
      "home.why": "Kwa nini tumeichagua", "home.moodTitle": "Uko katika hali gani?", "home.moodHint": "Anza na hisia, sio jina.",
      "home.moodCta": "Chunguza hisia hii", "home.guestNote": "Ingia ili kuboresha mapendekezo kwa historia yako."
    },

    rw: {
      "nav.home": "Ahabanza", "nav.movies": "Filimi", "nav.tv": "Seri", "nav.trailers": "Amatangazo",
      "nav.categories": "Ibyiciro", "nav.translators": "Abasobanuzi", "nav.search": "Shakisha",
      "nav.signin": "Injira", "nav.join": "Iyandikishe", "nav.profile": "Umwirondoro", "nav.library": "Isomero ryanjye",
      "nav.admin": "Ubuyobozi", "nav.logout": "Sohoka", "nav.settings": "Ibyifuzo", "nav.menu": "Menyu",
      "common.viewAll": "Reba byose", "common.watchTrailer": "Reba trailer", "common.details": "Ibisobanuro",
      "common.favorite": "Ibyakunzwe", "common.favorited": "Biri mu byakunzwe", "common.watchlist": "Urutonde rwo kureba",
      "common.inWatchlist": "Biri ku rutonde", "common.watchMovie": "Reba filimi", "common.download": "Kurura",
      "common.share": "Sangiza", "common.report": "Menyesha", "common.play": "Kina", "common.pause": "Hagarika",
      "common.resume": "Komeza", "common.next": "Ikurikira", "common.prev": "Ibanza", "common.close": "Funga",
      "common.save": "Bika", "common.cancel": "Reka", "common.all": "Byose", "common.loadMore": "Reba ibindi",
      "common.search": "Shakisha", "common.searchPlaceholder": "Filimi, seri, amatangazo, Abasobanuzi…",
      "common.noResults": "Nta byabonetse", "common.noResultsHint": "Gerageza izina, ubwoko, umusemuzi cyangwa ururimi undi.",
      "common.year": "Umwaka", "common.genre": "Ubwoko", "common.language": "Ururimi", "common.translator": "Umusemuzi",
      "common.related": "Ushobora no gukunda", "common.seasons": "Ibyiciro", "common.episodes": "Ibice",
      "common.sortBy": "Shungura", "common.newest": "Bishya mbere", "common.popular": "Bikunzwe cyane",
      "common.alphabetical": "A kugeza Z", "common.topRated": "Byasuzumwe cyane", "common.latest": "Bishya",
      "common.upcoming": "Biri kuza", "common.trending": "Birebwa cyane", "common.minRating": "Amanota ntarengwa",
      "common.loading": "Biratangira", "common.submit": "Ohereza",
      "shelf.trending": "Birebwa cyane", "shelf.recent": "Vya vuba", "shelf.popularMovies": "Filimi zikunzwe",
      "shelf.topRated": "Zisuzumwa cyane", "shelf.recommended": "Ibyakugenewe", "shelf.latestTrailers": "Amatangazo mashya",
      "shelf.popularTV": "Seri zikunzwe", "shelf.continue": "Komeza urebe",
      "shelf.kinyarwanda": "Filimi mu Kinyarwanda", "shelf.luganda": "Filimi mu Luganda",
      "shelf.translators": "Abasobanuzi bagaragara", "shelf.top10": "Icyiciro cya 10 iki cyumweru",
      "footer.tagline": "Menya. Reba. Shakisha.", "footer.explore": "Shakisha", "footer.company": "Ikigo",
      "footer.legal": "Amategeko", "footer.about": "Kuri SEEK", "footer.contact": "Twandikire", "footer.privacy": "Amabanga",
      "footer.terms": "Amabwiriza", "footer.help": "Ubufasha", "footer.dmca": "Gukuraho ibirimo n'uburenganzira",
      "footer.newsletter": "Amakuru ya SEEK", "footer.newsletterHint": "Filimi nshya na sinema zisemuwe, buri cyumweru.",
      "footer.subscribe": "Iyandikishe", "footer.rights": "Uburenganzira bwose burafitwe.", "footer.language": "Ururimi",
      "footer.lowData": "Uburyo bwa data nkeya", "footer.backToTop": "Subira hejuru",
      "auth.signin": "Injira", "auth.signup": "Fungura konti", "auth.email": "Imeyili", "auth.password": "Ijambo ry'ibanga",
      "auth.name": "Izina", "auth.confirmPassword": "Emeza ijambo ry'ibanga", "auth.forgot": "Wibagiwe ijambo ry'ibanga?",
      "auth.noAccount": "Uri mushya kuri SEEK?", "auth.hasAccount": "Usanzwe ufite konti?", "auth.logout": "Sohoka",
      "library.title": "Isomero ryanjye", "library.favorites": "Ibyakunzwe", "library.watchlist": "Urutonde rwo kureba",
      "library.continue": "Komeza urebe", "library.recent": "Byarebwe vuba", "library.savedTrailers": "Amatangazo yabitswe",
      "library.empty": "Nta kintu kirahari", "library.emptyHint": "Bika ikintu mu isomero kigaragare hano.",
      "search.title": "Shakisha kuri SEEK", "search.history": "Ibyashakishijwe vuba", "search.clearHistory": "Siba amateka",
      "home.customize": "Hindura ahabanza", "home.spotlight": "Icyagaragajwe na SEEK", "home.movieOfDay": "Filimi y'umunsi",
      "home.why": "Impamvu twahisemo iyi", "home.moodTitle": "Uri mu mutima ki?", "home.moodHint": "Tangira ku mutima, ntabwo ku izina.",
      "home.moodCta": "Reba iyi nzira", "home.guestNote": "Injira kugira ngo ibyakugenewe bibe byiza."
    },

    lg: {
      "nav.home": "Awaka", "nav.movies": "Firimu", "nav.tv": "Pulogulaamu", "nav.trailers": "Trailer",
      "nav.categories": "Ebika", "nav.translators": "Abavvuunuzi", "nav.search": "Noonya",
      "nav.signin": "Yingira", "nav.join": "Weewandiise", "nav.profile": "Ebikukwatako", "nav.library": "Ekitabo kyange",
      "nav.admin": "Obukulembeze", "nav.logout": "Fuluma", "nav.settings": "Ebikyagalwa", "nav.menu": "Menyu",
      "common.viewAll": "Laba byonna", "common.watchTrailer": "Laba trailer", "common.details": "Ebikwata ku",
      "common.favorite": "Kyagalwa", "common.favorited": "Kiri mu byagalwa", "common.watchlist": "Olukalala lw'okulaba",
      "common.inWatchlist": "Kiri ku lukalala", "common.watchMovie": "Laba firimu", "common.download": "Ggya",
      "common.share": "Gabana", "common.report": "Tegeeza", "common.play": "Zannya", "common.pause": "Jja",
      "common.resume": "Weyongere", "common.next": "Ekiddako", "common.prev": "Ekyayita", "common.close": "Ggalawo",
      "common.save": "Tereka", "common.cancel": "Lekera awo", "common.all": "Byonna", "common.loadMore": "Laba ebirala",
      "common.search": "Noonya", "common.searchPlaceholder": "Firimu, pulogulaamu, trailer, abavvuunuzi…",
      "common.noResults": "Tewali kizuuliddwa", "common.noResultsHint": "Gezaako erinnya, ekika, omuvvuunuzi oba olulimi olulala.",
      "common.year": "Omwaka", "common.genre": "Ekika", "common.language": "Olulimi", "common.translator": "Omuvvuunuzi",
      "common.related": "Oyinza okwagala", "common.seasons": "Ebiseera", "common.episodes": "Ebipande",
      "common.sortBy": "Tegeka", "common.newest": "Ebipya kubere", "common.popular": "Ebisinga okumanyibwa",
      "common.alphabetical": "A okutuuka Z", "common.topRated": "Ebisinga okusiimibwa", "common.latest": "Ebipya",
      "common.upcoming": "Ebidda", "common.trending": "Ebikoleeza", "common.minRating": "Obubonero obutono",
      "common.loading": "Bitandika", "common.submit": "Weereza",
      "shelf.trending": "Biwagala ennyo", "shelf.recent": "Ebikyakaggyibwa", "shelf.popularMovies": "Firimu ezimanyiddwa",
      "shelf.topRated": "Ezisinga okusiimibwa", "shelf.recommended": "Ebikusingira", "shelf.latestTrailers": "Trailer empya",
      "shelf.popularTV": "Pulogulaamu ezimanyiddwa", "shelf.continue": "Weyongere okutunuulira",
      "shelf.kinyarwanda": "Firimu mu Kinyarwanda", "shelf.luganda": "Firimu mu Luganda",
      "shelf.translators": "Abavvuunuzi abalondemu", "shelf.top10": "10 abasinga ku wiiki eno",
      "footer.tagline": "Zuula. Laba. Noonya.", "footer.explore": "Zuula", "footer.company": "Kkampuni",
      "footer.legal": "Amateeka", "footer.about": "Ku SEEK", "footer.contact": "Tukwatire", "footer.privacy": "Ekyama",
      "footer.terms": "Obukwakkulizo", "footer.help": "Obuyambi", "footer.dmca": "Okuggyamu ebirimu n'obuyinza",
      "footer.newsletter": "Amawulire ga SEEK", "footer.newsletterHint": "Firimu empya ne sinema ezivvuunuddwa, buli wiiki.",
      "footer.subscribe": "Weewandiise", "footer.rights": "Eddembe lyonna literekeddwa.", "footer.language": "Olulimi",
      "footer.lowData": "Enkola ya data ntono", "footer.backToTop": "Ddayo waggulu",
      "auth.signin": "Yingira", "auth.signup": "Tonda akawunti", "auth.email": "Imeyili", "auth.password": "Ekigambo ky'ekyama",
      "auth.name": "Erinnya", "auth.confirmPassword": "Kakasa ekigambo", "auth.forgot": "Weerabidde ekigambo?",
      "auth.noAccount": "Muggya ku SEEK?", "auth.hasAccount": "Olina akawunti?", "auth.logout": "Fuluma",
      "library.title": "Ekitabo kyange", "library.favorites": "Byagalwa", "library.watchlist": "Olukalala lw'okulaba",
      "library.continue": "Weyongere okutunuulira", "library.recent": "Ebyalabye kumpi", "library.savedTrailers": "Trailer eziterekeddwa",
      "library.empty": "Tewali kintu", "library.emptyHint": "Tereka ekintu okuva mu katalogi kirabike wano.",
      "search.title": "Noonya SEEK", "search.history": "Ebyanoonyeddwa kumpi", "search.clearHistory": "Sangula ebyafaayo",
      "home.customize": "Tegeka awaka", "home.spotlight": "Ekyasinze okulabika ku SEEK", "home.movieOfDay": "Firimu ya leero",
      "home.why": "Lwaki twagichagudde", "home.moodTitle": "Oli mu mbeera ki?", "home.moodHint": "Tangira n'embeera, si linnya.",
      "home.moodCta": "Laba embeera eno", "home.guestNote": "Yingira okuyisa obulungi ebikusingira."
    }
  };

  function t(key, vars) {
    var dict = I18N[SEEK.prefs.lang] || I18N.en;
    var value = dict[key] || I18N.en[key] || key;
    if (vars) {
      Object.keys(vars).forEach(function (name) {
        value = value.replace(new RegExp("\\{" + name + "\\}", "g"), vars[name]);
      });
    }
    return value;
  }

  function applyI18n(root) {
    SEEK.$$("[data-i18n]", root || document).forEach(function (node) {
      node.textContent = t(node.getAttribute("data-i18n"));
    });
    SEEK.$$("[data-i18n-placeholder]", root || document).forEach(function (node) {
      node.setAttribute("placeholder", t(node.getAttribute("data-i18n-placeholder")));
    });
    SEEK.$$("[data-i18n-aria]", root || document).forEach(function (node) {
      node.setAttribute("aria-label", t(node.getAttribute("data-i18n-aria")));
    });
  }

  SEEK.t = t;
  SEEK.applyI18n = applyI18n;
  SEEK.translations = I18N;
})();
