// FanSnap copy bundle — EN/PT/ES. Source of truth lives here.
// Keep keys in sync across the three languages.

export type Lang = "en" | "pt" | "es";

export const LANGS: readonly Lang[] = ["en", "pt", "es"] as const;

export interface Copy {
  nav_events: string;
  nav_photographers: string;
  nav_business: string;
  nav_login: string;
  hero_kicker: string;
  hero_t1: string;
  hero_t2: string;
  hero_t3: string;
  hero_sub: string;
  hero_cta: string;
  search_placeholder: string;
  cat_all: string;
  cat_music: string;
  cat_conventions: string;
  cat_sports: string;
  cat_parties: string;
  section_recent: string;
  section_recent_sub: string;
  section_upcoming: string;
  section_upcoming_sub: string;
  photos_count: string;
  photographers_count: string;
  find_my_photos: string;
  view_event: string;
  back: string;
  event_highlights: string;
  highlights_sub: string;
  coverage: string;
  cover_panel: string;
  cta_start: string;
  cta_sub: string;
  live: string;
  featured: string;
  now_live: string;
  next: string;
  scan_pill: string;
  pass_no: string;
  step_label: string;
  selfie_title: string;
  selfie_sub: string;
  upload_selfie: string;
  take_selfie: string;
  consent_title: string;
  consent_text: string;
  privacy_link: string;
  continue: string;
  secured_by: string;
  scan_title: string;
  scan_indexing: string;
  scan_matching: string;
  scan_finalizing: string;
  scan_photos: string;
  gallery_kicker: string;
  gallery_title: string;
  gallery_photos: string;
  gallery_select_all: string;
  gallery_clear: string;
  gallery_selected: string;
  gallery_continue: string;
  gallery_tap: string;
  photo_back: string;
  photo_choose_format: string;
  photo_quality: string;
  photo_by: string;
  digital: string;
  digital_d: string;
  print: string;
  print_d: string;
  tshirt: string;
  tshirt_d: string;
  mug: string;
  mug_d: string;
  canvas: string;
  canvas_d: string;
  size: string;
  color: string;
  qty: string;
  add_to_cart: string;
  most_popular: string;
  new_format: string;
  instant: string;
  ships_in: string;
  days: string;
  starting_at: string;
}

export const I18N: Record<Lang, Copy> = {
  en: {
    nav_events: "Events", nav_photographers: "Photographers", nav_business: "Business", nav_login: "Sign in",
    hero_kicker: "FACIAL RECOGNITION · LIVE ENTERTAINMENT",
    hero_t1: "YOU WERE", hero_t2: "THERE.", hero_t3: "WE HAVE THE PROOF.",
    hero_sub: "Find yourself in thousands of photos from concerts, conventions and the moments that mattered. Powered by AI.",
    hero_cta: "FIND MY PHOTOS",
    search_placeholder: "Search artist, event or venue",
    cat_all: "All", cat_music: "Music", cat_conventions: "Conventions", cat_sports: "Sports", cat_parties: "Parties",
    section_recent: "RECENT", section_recent_sub: "Where we've been",
    section_upcoming: "UPCOMING", section_upcoming_sub: "Where we're going",
    photos_count: "PHOTOS", photographers_count: "PHOTOGRAPHERS",
    find_my_photos: "FIND MY PHOTOS", view_event: "VIEW EVENT",
    back: "Back",
    event_highlights: "HIGHLIGHTS",
    highlights_sub: "A curated glimpse. Find yourself in all of it.",
    coverage: "COVERAGE", cover_panel: "Stage · Pit · Crowd · Backstage",
    cta_start: "FIND MY PHOTOS",
    cta_sub: "30 seconds. Search is free, pay only for what you love.",
    live: "LIVE", featured: "FEATURED", now_live: "NOW LIVE", next: "NEXT",
    scan_pill: "FACIAL SCAN", pass_no: "PASS",
    step_label: "STEP",
    selfie_title: "TAKE A SELFIE",
    selfie_sub: "Frontal photo, good light. That's all we need.",
    upload_selfie: "UPLOAD SELFIE", take_selfie: "USE CAMERA",
    consent_title: "BIOMETRIC CONSENT",
    consent_text: "I authorize FanSnap to process my selfie as biometric data for the sole purpose of finding my photos in this event. Data is encrypted, never sold, and may be deleted on request.",
    privacy_link: "Read full privacy notice",
    continue: "CONTINUE",
    secured_by: "SECURED · LFPDPPP / GDPR COMPLIANT",
    scan_title: "SCANNING",
    scan_indexing: "Indexing photos", scan_matching: "Matching face vector", scan_finalizing: "Finalizing",
    scan_photos: "PHOTOS ANALYZED",
    gallery_kicker: "MATCH COMPLETE",
    gallery_title: "WE FOUND YOU",
    gallery_photos: "PHOTOS",
    gallery_select_all: "SELECT ALL", gallery_clear: "CLEAR", gallery_selected: "SELECTED",
    gallery_continue: "CONTINUE",
    gallery_tap: "Tap to view a photo and choose format",
    photo_back: "Back to gallery",
    photo_choose_format: "CHOOSE FORMAT",
    photo_quality: "RAW · 6048×4032 · 24MP",
    photo_by: "BY",
    digital: "DIGITAL", digital_d: "High-resolution download. No watermark. Yours forever.",
    print: "PRINT", print_d: "Premium photo print on Fuji Crystal Archive paper.",
    tshirt: "T-SHIRT", tshirt_d: "Your photo on a 100% cotton premium tee.",
    mug: "MUG", mug_d: "Ceramic 11oz mug. Dishwasher and microwave safe.",
    canvas: "CANVAS", canvas_d: "Gallery-wrapped canvas, ready to hang.",
    size: "SIZE", color: "COLOR", qty: "QTY",
    add_to_cart: "ADD TO CART",
    most_popular: "MOST POPULAR", new_format: "NEW",
    instant: "INSTANT", ships_in: "SHIPS IN", days: "DAYS",
    starting_at: "FROM",
  },
  pt: {
    nav_events: "Eventos", nav_photographers: "Fotógrafos", nav_business: "Empresas", nav_login: "Entrar",
    hero_kicker: "RECONHECIMENTO FACIAL · ENTRETENIMENTO AO VIVO",
    hero_t1: "VOCÊ ESTEVE", hero_t2: "LÁ.", hero_t3: "A GENTE TEM A PROVA.",
    hero_sub: "Encontre você em milhares de fotos de shows, conventions e nos momentos que ficaram. Movido por IA.",
    hero_cta: "ACHAR MINHAS FOTOS",
    search_placeholder: "Buscar artista, evento ou local",
    cat_all: "Todos", cat_music: "Música", cat_conventions: "Conventions", cat_sports: "Esportes", cat_parties: "Festas",
    section_recent: "RECENTES", section_recent_sub: "Onde estivemos",
    section_upcoming: "EM BREVE", section_upcoming_sub: "Onde vamos estar",
    photos_count: "FOTOS", photographers_count: "FOTÓGRAFOS",
    find_my_photos: "ACHAR MINHAS FOTOS", view_event: "VER EVENTO",
    back: "Voltar",
    event_highlights: "DESTAQUES",
    highlights_sub: "Um recorte curado. Encontre você no resto.",
    coverage: "COBERTURA", cover_panel: "Palco · Pit · Público · Bastidor",
    cta_start: "ACHAR MINHAS FOTOS",
    cta_sub: "30 segundos. Buscar é grátis, você só paga pelo que quiser.",
    live: "AO VIVO", featured: "DESTAQUE", now_live: "AO VIVO AGORA", next: "PRÓXIMO",
    scan_pill: "SCAN FACIAL", pass_no: "PASSE",
    step_label: "ETAPA",
    selfie_title: "TIRA UMA SELFIE",
    selfie_sub: "Foto frontal, luz boa. Só isso.",
    upload_selfie: "SUBIR SELFIE", take_selfie: "USAR CÂMERA",
    consent_title: "CONSENTIMENTO BIOMÉTRICO",
    consent_text: "Autorizo a FanSnap a processar minha selfie como dado biométrico com a finalidade exclusiva de encontrar minhas fotos neste evento. Os dados são criptografados, nunca vendidos, e podem ser excluídos a pedido.",
    privacy_link: "Ler aviso completo de privacidade",
    continue: "CONTINUAR",
    secured_by: "SEGURO · CONFORME LFPDPPP / LGPD / GDPR",
    scan_title: "ANALISANDO",
    scan_indexing: "Indexando fotos", scan_matching: "Comparando vetor facial", scan_finalizing: "Finalizando",
    scan_photos: "FOTOS ANALISADAS",
    gallery_kicker: "MATCH COMPLETO",
    gallery_title: "ENCONTRAMOS VOCÊ",
    gallery_photos: "FOTOS",
    gallery_select_all: "SELECIONAR TUDO", gallery_clear: "LIMPAR", gallery_selected: "SELECIONADAS",
    gallery_continue: "CONTINUAR",
    gallery_tap: "Toque numa foto para ver e escolher o formato",
    photo_back: "Voltar à galeria",
    photo_choose_format: "ESCOLHA O FORMATO",
    photo_quality: "RAW · 6048×4032 · 24MP",
    photo_by: "POR",
    digital: "DIGITAL", digital_d: "Download em alta resolução. Sem marca d'água. Suas pra sempre.",
    print: "IMPRESSÃO", print_d: "Impressão fotográfica premium em papel Fuji Crystal Archive.",
    tshirt: "CAMISETA", tshirt_d: "Sua foto numa camiseta 100% algodão premium.",
    mug: "CANECA", mug_d: "Caneca de cerâmica 325ml. Lavável em máquina e micro-ondas.",
    canvas: "QUADRO", canvas_d: "Tela em canvas com moldura interna, pronta pra pendurar.",
    size: "TAMANHO", color: "COR", qty: "QTD",
    add_to_cart: "ADICIONAR AO CARRINHO",
    most_popular: "MAIS POPULAR", new_format: "NOVO",
    instant: "INSTANTÂNEO", ships_in: "ENTREGA EM", days: "DIAS",
    starting_at: "A PARTIR DE",
  },
  es: {
    nav_events: "Eventos", nav_photographers: "Fotógrafos", nav_business: "Empresas", nav_login: "Entrar",
    hero_kicker: "RECONOCIMIENTO FACIAL · ENTRETENIMIENTO EN VIVO",
    hero_t1: "ESTUVISTE", hero_t2: "AHÍ.", hero_t3: "TENEMOS LA PRUEBA.",
    hero_sub: "Encuéntrate en miles de fotos de conciertos, conventions y los momentos que importaron. Con IA.",
    hero_cta: "ENCONTRAR MIS FOTOS",
    search_placeholder: "Buscar artista, evento o lugar",
    cat_all: "Todos", cat_music: "Música", cat_conventions: "Conventions", cat_sports: "Deportes", cat_parties: "Fiestas",
    section_recent: "RECIENTES", section_recent_sub: "Dónde estuvimos",
    section_upcoming: "PRÓXIMOS", section_upcoming_sub: "Dónde estaremos",
    photos_count: "FOTOS", photographers_count: "FOTÓGRAFOS",
    find_my_photos: "ENCONTRAR MIS FOTOS", view_event: "VER EVENTO",
    back: "Atrás",
    event_highlights: "DESTACADOS",
    highlights_sub: "Un vistazo curado. Encuéntrate en el resto.",
    coverage: "COBERTURA", cover_panel: "Escenario · Pit · Público · Backstage",
    cta_start: "ENCONTRAR MIS FOTOS",
    cta_sub: "30 segundos. Buscar es gratis, paga solo por lo que quieras.",
    live: "EN VIVO", featured: "DESTACADO", now_live: "EN VIVO AHORA", next: "PRÓXIMO",
    scan_pill: "SCAN FACIAL", pass_no: "PASE",
    step_label: "PASO",
    selfie_title: "TÓMATE UNA SELFIE",
    selfie_sub: "Foto frontal, buena luz. Eso es todo.",
    upload_selfie: "SUBIR SELFIE", take_selfie: "USAR CÁMARA",
    consent_title: "CONSENTIMIENTO BIOMÉTRICO",
    consent_text: "Autorizo a FanSnap a procesar mi selfie como dato biométrico con la única finalidad de encontrar mis fotos en este evento. Los datos están encriptados, nunca se venden y pueden eliminarse a solicitud.",
    privacy_link: "Leer aviso completo de privacidad",
    continue: "CONTINUAR",
    secured_by: "SEGURO · CONFORME LFPDPPP / GDPR",
    scan_title: "ANALIZANDO",
    scan_indexing: "Indexando fotos", scan_matching: "Comparando vector facial", scan_finalizing: "Finalizando",
    scan_photos: "FOTOS ANALIZADAS",
    gallery_kicker: "MATCH COMPLETO",
    gallery_title: "TE ENCONTRAMOS",
    gallery_photos: "FOTOS",
    gallery_select_all: "SELECCIONAR TODO", gallery_clear: "LIMPIAR", gallery_selected: "SELECCIONADAS",
    gallery_continue: "CONTINUAR",
    gallery_tap: "Toca una foto para ver y elegir el formato",
    photo_back: "Volver a la galería",
    photo_choose_format: "ELIGE EL FORMATO",
    photo_quality: "RAW · 6048×4032 · 24MP",
    photo_by: "POR",
    digital: "DIGITAL", digital_d: "Descarga en alta resolución. Sin marca de agua. Tuyas para siempre.",
    print: "IMPRESIÓN", print_d: "Impresión fotográfica premium en papel Fuji Crystal Archive.",
    tshirt: "PLAYERA", tshirt_d: "Tu foto en una playera 100% algodón premium.",
    mug: "TAZA", mug_d: "Taza de cerámica 325ml. Apta para lavavajillas y microondas.",
    canvas: "CUADRO", canvas_d: "Lienzo en canvas con marco interno, listo para colgar.",
    size: "TAMAÑO", color: "COLOR", qty: "CANT",
    add_to_cart: "AGREGAR AL CARRITO",
    most_popular: "MÁS POPULAR", new_format: "NUEVO",
    instant: "INSTANTÁNEO", ships_in: "ENVÍO EN", days: "DÍAS",
    starting_at: "DESDE",
  },
};
