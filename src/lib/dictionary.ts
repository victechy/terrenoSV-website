export type Locale = "en" | "es";

export const locales: Locale[] = ["en", "es"];
export const defaultLocale: Locale = "en";

export const dictionary = {
  en: {
    nav: {
      home: "Home",
      listings: "Listings",
      calculator: "Land Calculator",
      book: "The Book",
      app: "Get the App",
      langSwitch: "Español",
    },
    hero: {
      eyebrow: "Land & property in El Salvador",
      title: "Find your piece of El Salvador",
      subtitle:
        "Browse verified land and property listings, convert manzanas and varas to acres in seconds, and get the on-the-ground guidance the guidebook and app were built for.",
      ctaListings: "Browse listings",
      ctaCalculator: "Try the calculator",
    },
    home: {
      featuredTitle: "Recently listed",
      featuredSubtitle: "Pulled live from the same listings feed as the terrenoSV app.",
      viewAll: "View all listings",
      noListings: "New listings are added regularly, so check back soon.",
      featuresTitle: "Everything you need to buy land in El Salvador",
      feature1Title: "Real, structured listings",
      feature1Body:
        "Every listing shows department, municipality, exact land size, and price per manzana, vara² or acre, no guesswork.",
      feature2Title: "Salvadoran unit converter",
      feature2Body:
        "Manzanas, varas², tareas: units you won't find on a normal calculator, converted instantly to acres, feet² and meters².",
      feature3Title: "Talk to sellers directly",
      feature3Body:
        "One tap to WhatsApp or email the seller. No middleman, no account required.",
      appPromoTitle: "The terrenoSV app is coming soon",
      appPromoBody:
        "Everything on this site, in your pocket: browse listings offline, save favorites, and get notified about new land near you.",
      appPromoCta: "Get notified at launch",
      bookPromoTitle: "Moving to El Salvador",
      bookPromoBody:
        "The guidebook behind terrenoSV: practical, first-hand advice on relocating, buying land, and settling in El Salvador.",
      bookPromoCta: "Learn about the book",
    },
    listings: {
      title: "Property listings",
      subtitle: "Live from the same feed as the terrenoSV app, updated as new listings are approved.",
      searchPlaceholder: "Search by title, department or municipality…",
      filterType: "Property type",
      filterTransaction: "For",
      filterDepartment: "Department",
      sortBy: "Sort by",
      sortNewest: "Newest",
      sortPriceLow: "Price: low to high",
      sortPriceHigh: "Price: high to low",
      allTypes: "All types",
      allDepartments: "All departments",
      allTransactions: "Sale or rent",
      favoritesOnly: "Favorites only",
      resultsCount: (n: number) => `${n} ${n === 1 ? "listing" : "listings"}`,
      noResults: "No listings match your filters yet.",
      clearFilters: "Clear filters",
      viewDetails: "View details",
      forSale: "For sale",
      forRent: "For rent",
      loading: "Loading listings…",
      error: "Couldn't load listings right now. Please try again shortly.",
    },
    listingDetail: {
      back: "Back to listings",
      landSize: "Land size",
      constructionSize: "Construction size",
      pricePerUnit: "Price per",
      contactSeller: "Contact seller",
      whatsapp: "WhatsApp",
      email: "Email",
      viewOnMap: "View on map",
      listedBy: "Listed by",
      description: "Description",
      quickConversions: "Quick conversions",
      save: "Save",
      saved: "Saved",
      shareText: (title: string) => `Check out this property on terrenoSV: ${title}`,
      contactMessage: (title: string) => `Hi, I'm interested in "${title}" on terrenoSV.`,
    },
    calculator: {
      title: "Salvadoran land unit calculator",
      subtitle:
        "Manzanas, varas², tareas and hectares don't show up on a normal converter. This one's built for El Salvador.",
      inputLabel: "Amount",
      unitLabel: "Unit",
      resultsTitle: "Converts to",
      priceCalcTitle: "Price per unit",
      priceCalcSubtitle: "Enter a total price to see the cost per unit across every measurement.",
      priceLabel: "Total price (USD)",
    },
    footer: {
      tagline: "Land, property and the guidance to buy it right, for El Salvador.",
      listings: "Listings",
      calculator: "Calculator",
      book: "The book",
      contact: "Contact",
      rights: "All rights reserved.",
    },
    bookPage: {
      eyebrow: "The guidebook behind terrenoSV",
      title: "Moving to El Salvador",
      body: "A practical, first-hand guide to relocating, buying land, and settling in El Salvador, written for repatriados, retirees, and anyone considering the move. terrenoSV and this site grew directly out of the questions the book kept getting asked.",
      cta: "Visit Flores Publishing",
      listingsCta: "Browse land & property listings",
    },
  },
  es: {
    nav: {
      home: "Inicio",
      listings: "Propiedades",
      calculator: "Calculadora",
      book: "El Libro",
      app: "Descargar App",
      langSwitch: "English",
    },
    hero: {
      eyebrow: "Terrenos y propiedades en El Salvador",
      title: "Encuentra tu pedazo de El Salvador",
      subtitle:
        "Explora propiedades y terrenos verificados, convierte manzanas y varas a acres en segundos, y recibe la guía que inspiró el libro y la app.",
      ctaListings: "Ver propiedades",
      ctaCalculator: "Probar la calculadora",
    },
    home: {
      featuredTitle: "Publicadas recientemente",
      featuredSubtitle: "En tiempo real, desde el mismo feed que usa la app terrenoSV.",
      viewAll: "Ver todas las propiedades",
      noListings: "Se agregan propiedades nuevas regularmente, vuelve pronto.",
      featuresTitle: "Todo lo que necesitas para comprar terreno en El Salvador",
      feature1Title: "Propiedades reales y estructuradas",
      feature1Body:
        "Cada propiedad muestra departamento, municipio, tamaño exacto y precio por manzana, vara² o acre, sin adivinar.",
      feature2Title: "Convertidor de medidas salvadoreñas",
      feature2Body:
        "Manzanas, varas², tareas: unidades que no encontrarás en una calculadora normal, convertidas al instante a acres, pies² y metros².",
      feature3Title: "Habla directo con el vendedor",
      feature3Body: "Un toque para WhatsApp o correo. Sin intermediarios, sin cuenta.",
      appPromoTitle: "La app terrenoSV llega pronto",
      appPromoBody:
        "Todo este sitio, en tu bolsillo: explora propiedades sin conexión, guarda tus favoritas y recibe alertas de terrenos cerca de ti.",
      appPromoCta: "Avísenme cuando esté lista",
      bookPromoTitle: "Moving to El Salvador",
      bookPromoBody:
        "La guía detrás de terrenoSV: consejos prácticos y de primera mano para mudarte, comprar terreno y establecerte en El Salvador.",
      bookPromoCta: "Conocer el libro",
    },
    listings: {
      title: "Propiedades disponibles",
      subtitle: "En tiempo real, desde el mismo feed que usa la app terrenoSV.",
      searchPlaceholder: "Buscar por título, departamento o municipio…",
      filterType: "Tipo de propiedad",
      filterTransaction: "Para",
      filterDepartment: "Departamento",
      sortBy: "Ordenar por",
      sortNewest: "Más recientes",
      sortPriceLow: "Precio: menor a mayor",
      sortPriceHigh: "Precio: mayor a menor",
      allTypes: "Todos los tipos",
      allDepartments: "Todos los departamentos",
      allTransactions: "Venta o alquiler",
      favoritesOnly: "Solo favoritas",
      resultsCount: (n: number) => `${n} ${n === 1 ? "propiedad" : "propiedades"}`,
      noResults: "Ninguna propiedad coincide con tus filtros todavía.",
      clearFilters: "Limpiar filtros",
      viewDetails: "Ver detalles",
      forSale: "En venta",
      forRent: "En alquiler",
      loading: "Cargando propiedades…",
      error: "No se pudieron cargar las propiedades. Intenta de nuevo en un momento.",
    },
    listingDetail: {
      back: "Volver a propiedades",
      landSize: "Tamaño del terreno",
      constructionSize: "Área de construcción",
      pricePerUnit: "Precio por",
      contactSeller: "Contactar al vendedor",
      whatsapp: "WhatsApp",
      email: "Correo",
      viewOnMap: "Ver en el mapa",
      listedBy: "Publicado por",
      description: "Descripción",
      quickConversions: "Conversiones rápidas",
      save: "Guardar",
      saved: "Guardada",
      shareText: (title: string) => `Mira esta propiedad en terrenoSV: ${title}`,
      contactMessage: (title: string) => `Hola, me interesa "${title}" en terrenoSV.`,
    },
    calculator: {
      title: "Calculadora de medidas salvadoreñas",
      subtitle:
        "Manzanas, varas², tareas y hectáreas no aparecen en una calculadora normal. Esta está hecha para El Salvador.",
      inputLabel: "Cantidad",
      unitLabel: "Unidad",
      resultsTitle: "Equivale a",
      priceCalcTitle: "Precio por unidad",
      priceCalcSubtitle: "Ingresa un precio total para ver el costo por unidad en cada medida.",
      priceLabel: "Precio total (USD)",
    },
    footer: {
      tagline: "Terrenos, propiedades y la guía para comprarlas bien, en El Salvador.",
      listings: "Propiedades",
      calculator: "Calculadora",
      book: "El libro",
      contact: "Contacto",
      rights: "Todos los derechos reservados.",
    },
    bookPage: {
      eyebrow: "La guía detrás de terrenoSV",
      title: "Moving to El Salvador",
      body: "Una guía práctica y de primera mano para mudarte, comprar terreno y establecerte en El Salvador, escrita para repatriados, jubilados y cualquiera que esté considerando el cambio. terrenoSV y este sitio nacieron directamente de las preguntas que el libro seguía recibiendo.",
      cta: "Visitar Flores Publishing",
      listingsCta: "Ver propiedades y terrenos",
    },
  },
};

export type Dictionary = (typeof dictionary)["en"];

export function getDictionary(locale: Locale): Dictionary {
  return dictionary[locale];
}

export function otherLocale(locale: Locale): Locale {
  return locale === "en" ? "es" : "en";
}

export function localizedPath(path: string, locale: Locale): string {
  // English lives at the root (no prefix); Spanish is mirrored under /es.
  const clean = path.replace(/^\/(en|es)(?=\/|$)/, "") || "/";
  if (locale === "en") return clean;
  return clean === "/" ? "/es" : `/es${clean}`;
}
