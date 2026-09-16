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
      calcGlimpseTitle: "Paste any listing. Get the math instantly.",
      calcGlimpseBody: "Manzanas, varas², tareas, hectares: units a normal calculator doesn't know. This one's built for El Salvador.",
      calcGlimpseExample: "1 manzana equals",
      calcGlimpseCta: "Try the full calculator",
      sellPromoTitle: "List your land on terrenoSV",
      sellPromoBody: "Reach buyers in El Salvador and abroad. Every listing is reviewed before it goes live.",
      sellPromoCta: "Submit your listing",
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
      share: "Share",
      linkCopied: "Link copied",
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
      modeManual: "Manual",
      modePaste: "Paste a Listing",
      pasteTitle: "Paste the listing text (Facebook, Encuentra24, etc.)",
      pastePlaceholder: "Ex: 20m frente y 60m largo. $75,000",
      calculateButton: "Calculate",
      noDetection: "Couldn't detect a measurement. Try the manual tab instead.",
      detectedFrenteFondo: (frente: string, fondo: string, sideUnit: string, area: string, areaUnit: string) =>
        `Detected: ${frente} x ${fondo} ${sideUnit} = ${area} ${areaUnit}`,
      detectedArea: (value: string, unitLabel: string) => `Detected: ${value} ${unitLabel}`,
      detectedManzanaRemainder: (manzanas: string, varas: string, total: string) =>
        `Detected: ${manzanas} manzanas + ${varas} varas² = ${total} varas²`,
      detectedConstructionOnly: (value: string, unitLabel: string) => `Detected (construction): ${value} ${unitLabel}`,
      detectedConstructionNote: (value: string, unitLabel: string) => `Construction: ${value} ${unitLabel}`,
      costPerUnitLine: (unitLabel: string, price: string) => `Cost per ${unitLabel}: ${price}`,
    },
    footer: {
      tagline: "Land, property and the guidance to buy it right, for El Salvador.",
      listings: "Listings",
      calculator: "Calculator",
      book: "The book",
      contact: "Contact",
      rights: "All rights reserved.",
      company: "Company",
      about: "About us",
      glossary: "Measurement glossary",
      sell: "List your property",
      privacy: "Privacy policy",
    },
    bookPage: {
      eyebrow: "The guidebook behind terrenoSV",
      title: "Moving to El Salvador",
      body: "A practical, first-hand guide to relocating, buying land, and settling in El Salvador, written for repatriados, retirees, and anyone considering the move. terrenoSV and this site grew directly out of the questions the book kept getting asked.",
      cta: "Visit Flores Publishing",
      listingsCta: "Browse land & property listings",
    },
    about: {
      title: "About terrenoSV",
      missionTitle: "Our mission",
      missionText: "To make real estate transactions in El Salvador safe and transparent, no matter where you live.",
      body: "terrenoSV connects buyers, in El Salvador and abroad, with verified properties and trustworthy sellers. Every listing goes through a review process before it's published, so you can browse land with confidence, no matter where you're searching from.",
      verificationNote: "We verify every seller's identity before approving their listings, to protect our community of buyers.",
      developedWith: "Made with care to connect people with the land they're looking for.",
      cta: "Browse listings",
    },
    glossary: {
      title: "Salvadoran land measurements, explained",
      subtitle: "Manzanas, varas², tareas: units you won't find on a normal calculator. Here's what they actually mean.",
      cta: "Try the full calculator",
      items: [
        { unit: "Vara²", body: "Traditional Salvadoran measurement. One vara² equals 0.699 square meters (official)." },
        { unit: "Tarea", body: "Common agricultural measurement. 16 tareas = 1 manzana. One tarea = 437 square meters." },
        { unit: "Manzana", body: "10,000 varas² = 6,989 square meters (official Central American measurement)." },
        { unit: "Hectare", body: "International measurement used by government. 1 hectare = 10,000 square meters." },
        { unit: "Meter²", body: "The international metric system, used worldwide including in official Salvadoran land records." },
        { unit: "Foot²", body: "Imperial system, common in the US, used by many American buyers and retirees." },
        { unit: "Acre", body: "Traditional English land measurement, still widely used in the US and other English-speaking countries." },
      ],
    },
    sell: {
      title: "List your land or property",
      subtitle: "Reach thousands of buyers in El Salvador and abroad",
      body: "terrenoSV connects sellers with verified buyers, in El Salvador and around the world. Submit your listing and our team reviews it before it goes live, so buyers can browse with confidence.",
      benefit1Title: "Reach real buyers",
      benefit1Body: "Your listing appears on both the terrenoSV app and this site, seen by buyers actively searching for land in El Salvador.",
      benefit2Title: "Verified process",
      benefit2Body: "We verify every seller's identity before approving a listing, protecting both you and the buyers who reach out.",
      benefit3Title: "No cost to list",
      benefit3Body: "Submitting a listing is free. You control your own price, photos, and contact details.",
      cta: "Submit your listing",
      formUrl: "https://forms.gle/49eZm51XyUMfdHqs8",
    },
    privacy: {
      title: "Privacy policy",
      lastUpdated: "Last updated: September 16, 2026",
      intro: "This policy covers both the terrenoSV app and terrenosv.org (together, \"terrenoSV\").",
      sections: [
        {
          heading: "Overview",
          body: "terrenoSV is a free service for converting Salvadoran land measurements and browsing property listings, available as a mobile app and at terrenosv.org.",
        },
        {
          heading: "No account required",
          body: "terrenoSV operates without requiring user registration, login credentials, or personal information to access its core features, on both the app and the website.",
        },
        {
          heading: "What's stored on your device",
          body: "The app and website save a small set of preferences locally on your own device: your favorited listings, language, and (in the app) theme and whether you've seen the onboarding tour. None of this is sent to us or to anyone else, and none of it identifies you personally.",
        },
        {
          heading: "Anonymous usage data",
          body: "We may collect non-identifying usage data such as action types, timestamps, and language preference, to understand how the app and site are used. This never includes your name, email, phone number, or any way to identify you personally.",
        },
        {
          heading: "Liking a listing",
          body: "Tapping the heart on a listing sends only that listing's ID and whether you liked or unliked it, no personal information, to record a like count. This works the same way on the app and the website.",
        },
        {
          heading: "Property listings",
          body: "Sellers who submit a property listing (via our Google Form) have their information, including name, contact details, and property specifics, displayed publicly on the app and website. Submission and management of listings happen through Google Forms and Google Sheets, separately from the app and site's own code.",
        },
        {
          heading: "Contacting sellers",
          body: "When you contact a seller through WhatsApp, email, or phone, terrenoSV does not see, store, or have access to the content of those messages. That communication is governed by WhatsApp's, your email provider's, or your phone carrier's own privacy practices.",
        },
        {
          heading: "Third-party services",
          body: "Listings data and photos are served from Google Sheets, Google Forms, and Google Drive, and are subject to Google's own privacy policies. The website is hosted on Cloudflare, which, like any web host, processes standard technical logs (such as IP address and browser type) for security and performance.",
        },
        {
          heading: "No ads, no selling data",
          body: "terrenoSV does not run advertising, does not use third-party tracking or analytics cookies on the website, and does not sell your data to anyone.",
        },
        {
          heading: "Children's privacy",
          body: "terrenoSV is not directed toward minors and does not knowingly collect information from anyone under 13.",
        },
        {
          heading: "Changes to this policy",
          body: "This policy may be updated as features evolve. Material changes will be reflected with an updated date above.",
        },
        {
          heading: "Contact",
          body: "Questions about this policy can be sent to vflores.sv@gmail.com.",
        },
      ],
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
      calcGlimpseTitle: "Pega cualquier anuncio. La cuenta al instante.",
      calcGlimpseBody: "Manzanas, varas², tareas, hectáreas: unidades que una calculadora normal no conoce. Esta está hecha para El Salvador.",
      calcGlimpseExample: "1 manzana equivale a",
      calcGlimpseCta: "Probar la calculadora completa",
      sellPromoTitle: "Publica tu terreno en terrenoSV",
      sellPromoBody: "Llega a compradores en El Salvador y en el exterior. Cada anuncio se revisa antes de publicarse.",
      sellPromoCta: "Publicar mi terreno",
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
      share: "Compartir",
      linkCopied: "Enlace copiado",
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
      modeManual: "Manual",
      modePaste: "Pega un Anuncio",
      pasteTitle: "Pega el texto del anuncio (Facebook, Encuentra24, etc.)",
      pastePlaceholder: "Ej: 20m de frente y 60m de largo. $75,000",
      calculateButton: "Calcular",
      noDetection: "No se detectó ninguna medida. Intenta con la pestaña manual.",
      detectedFrenteFondo: (frente: string, fondo: string, sideUnit: string, area: string, areaUnit: string) =>
        `Detectado: ${frente} x ${fondo} ${sideUnit} = ${area} ${areaUnit}`,
      detectedArea: (value: string, unitLabel: string) => `Detectado: ${value} ${unitLabel}`,
      detectedManzanaRemainder: (manzanas: string, varas: string, total: string) =>
        `Detectado: ${manzanas} manzanas + ${varas} varas² = ${total} varas²`,
      detectedConstructionOnly: (value: string, unitLabel: string) => `Detectado (construcción): ${value} ${unitLabel}`,
      detectedConstructionNote: (value: string, unitLabel: string) => `Construcción: ${value} ${unitLabel}`,
      costPerUnitLine: (unitLabel: string, price: string) => `Costo por ${unitLabel}: ${price}`,
    },
    footer: {
      tagline: "Terrenos, propiedades y la guía para comprarlas bien, en El Salvador.",
      listings: "Propiedades",
      calculator: "Calculadora",
      book: "El libro",
      contact: "Contacto",
      rights: "Todos los derechos reservados.",
      company: "Compañía",
      about: "Sobre nosotros",
      glossary: "Glosario de medidas",
      sell: "Publica tu terreno",
      privacy: "Política de privacidad",
    },
    bookPage: {
      eyebrow: "La guía detrás de terrenoSV",
      title: "Moving to El Salvador",
      body: "Una guía práctica y de primera mano para mudarte, comprar terreno y establecerte en El Salvador, escrita para repatriados, jubilados y cualquiera que esté considerando el cambio. terrenoSV y este sitio nacieron directamente de las preguntas que el libro seguía recibiendo.",
      cta: "Visitar Flores Publishing",
      listingsCta: "Ver propiedades y terrenos",
    },
    about: {
      title: "Sobre terrenoSV",
      missionTitle: "Nuestra misión",
      missionText: "Facilitar transacciones de bienes raíces seguras y transparentes en El Salvador, sin importar dónde vivas.",
      body: "terrenoSV conecta a compradores dentro y fuera de El Salvador con propiedades verificadas y vendedores confiables. Cada anuncio pasa por un proceso de revisión antes de publicarse, para que puedas explorar terrenos con confianza, sin importar en qué país te encuentres.",
      verificationNote: "Verificamos la identidad de cada vendedor antes de aprobar sus anuncios, para proteger a nuestra comunidad de compradores.",
      developedWith: "Hecho con cariño para conectar a las personas con la tierra que buscan.",
      cta: "Ver propiedades",
    },
    glossary: {
      title: "Medidas de terreno salvadoreñas, explicadas",
      subtitle: "Manzanas, varas², tareas: unidades que no encontrarás en una calculadora normal. Esto es lo que realmente significan.",
      cta: "Probar la calculadora completa",
      items: [
        { unit: "Vara²", body: "Medida tradicional salvadoreña. Una vara² equivale a 0.699 metros² (oficial)." },
        { unit: "Tarea", body: "Medida agrícola común. 16 tareas = 1 manzana. Una tarea = 437 metros²." },
        { unit: "Manzana", body: "10,000 varas² = 6,989 metros² (medida oficial centroamericana)." },
        { unit: "Hectárea", body: "Medida internacional usada por el gobierno. 1 hectárea = 10,000 metros²." },
        { unit: "Metro²", body: "El sistema métrico internacional, usado en todo el mundo, incluyendo los registros oficiales de tierras en El Salvador." },
        { unit: "Pie²", body: "Sistema imperial, común en EE.UU., usado por muchos compradores y jubilados estadounidenses." },
        { unit: "Acre", body: "Medida tradicional inglesa, todavía muy usada en EE.UU. y otros países de habla inglesa." },
      ],
    },
    sell: {
      title: "Publica tu terreno o propiedad",
      subtitle: "Llega a miles de compradores en El Salvador y en el exterior",
      body: "terrenoSV conecta a vendedores con compradores verificados, en El Salvador y alrededor del mundo. Envía tu anuncio y nuestro equipo lo revisa antes de publicarlo, para que los compradores puedan explorar con confianza.",
      benefit1Title: "Llega a compradores reales",
      benefit1Body: "Tu anuncio aparece tanto en la app terrenoSV como en este sitio, visto por compradores que buscan activamente terreno en El Salvador.",
      benefit2Title: "Proceso verificado",
      benefit2Body: "Verificamos la identidad de cada vendedor antes de aprobar un anuncio, protegiendo tanto a ti como a los compradores que te contactan.",
      benefit3Title: "Sin costo por publicar",
      benefit3Body: "Publicar un anuncio es gratis. Tú controlas tu propio precio, fotos y datos de contacto.",
      cta: "Publicar mi terreno",
      formUrl: "https://forms.gle/49eZm51XyUMfdHqs8",
    },
    privacy: {
      title: "Política de privacidad",
      lastUpdated: "Última actualización: 16 de septiembre de 2026",
      intro: "Esta política cubre tanto la app terrenoSV como terrenosv.org (juntos, \"terrenoSV\").",
      sections: [
        {
          heading: "Resumen",
          body: "terrenoSV es un servicio gratuito para convertir medidas de terreno salvadoreñas y explorar propiedades, disponible como app móvil y en terrenosv.org.",
        },
        {
          heading: "No se requiere cuenta",
          body: "terrenoSV funciona sin requerir registro, credenciales de acceso, ni información personal para usar sus funciones principales, tanto en la app como en el sitio web.",
        },
        {
          heading: "Qué se guarda en tu dispositivo",
          body: "La app y el sitio guardan un pequeño conjunto de preferencias localmente en tu propio dispositivo: tus propiedades favoritas, tu idioma, y (en la app) el tema y si ya viste el tour de bienvenida. Nada de esto se nos envía ni se comparte con nadie más, y nada de esto te identifica personalmente.",
        },
        {
          heading: "Datos de uso anónimos",
          body: "Podemos recopilar datos de uso no identificables, como tipos de acción, marcas de tiempo y preferencia de idioma, para entender cómo se usan la app y el sitio. Esto nunca incluye tu nombre, correo, teléfono, ni ninguna forma de identificarte personalmente.",
        },
        {
          heading: "Dar like a una propiedad",
          body: "Tocar el corazón en una propiedad envía únicamente el ID de esa propiedad y si le diste o quitaste like, sin información personal, para registrar un conteo de likes. Esto funciona igual en la app y en el sitio web.",
        },
        {
          heading: "Anuncios de propiedades",
          body: "Los vendedores que envían un anuncio (mediante nuestro formulario de Google) tienen su información, incluyendo nombre, datos de contacto y detalles de la propiedad, mostrada públicamente en la app y el sitio web. El envío y manejo de anuncios ocurre mediante Google Forms y Google Sheets, por separado del código de la app y el sitio.",
        },
        {
          heading: "Contactar a un vendedor",
          body: "Cuando contactas a un vendedor por WhatsApp, correo o teléfono, terrenoSV no ve, almacena, ni tiene acceso al contenido de esos mensajes. Esa comunicación está sujeta a las prácticas de privacidad de WhatsApp, tu proveedor de correo, o tu compañía telefónica.",
        },
        {
          heading: "Servicios de terceros",
          body: "Los datos y fotos de las propiedades se sirven desde Google Sheets, Google Forms y Google Drive, y están sujetos a las políticas de privacidad de Google. El sitio web está alojado en Cloudflare, que, como cualquier proveedor de hosting, procesa registros técnicos estándar (como dirección IP y tipo de navegador) por seguridad y rendimiento.",
        },
        {
          heading: "Sin anuncios, sin vender datos",
          body: "terrenoSV no muestra publicidad, no usa cookies de rastreo o análisis de terceros en el sitio web, y no vende tus datos a nadie.",
        },
        {
          heading: "Privacidad de menores",
          body: "terrenoSV no está dirigido a menores de edad y no recopila información a sabiendas de nadie menor de 13 años.",
        },
        {
          heading: "Cambios a esta política",
          body: "Esta política puede actualizarse a medida que evolucionen las funciones. Los cambios importantes se reflejarán con una fecha actualizada arriba.",
        },
        {
          heading: "Contacto",
          body: "Preguntas sobre esta política pueden enviarse a vflores.sv@gmail.com.",
        },
      ],
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
