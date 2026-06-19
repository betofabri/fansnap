// FanSnap copy bundle — EN/PT/ES. Source of truth lives here.
// Keep keys in sync across the three languages.

export type Lang = "en" | "pt" | "es";

export const LANGS: readonly Lang[] = ["en", "pt", "es"] as const;

export interface Copy {
  // Header / nav
  nav_how: string;
  nav_events: string;
  nav_photographers: string;
  nav_brand: string;
  nav_login: string;
  powered_by: string;

  // New pitch sections (Fatia 1.5)
  how_kicker: string;
  how_title: string;
  how_sub: string;
  how_step1_title: string;
  how_step1_body: string;
  how_step2_title: string;
  how_step2_body: string;
  how_step3_title: string;
  how_step3_body: string;
  photographers_kicker: string;
  photographers_title: string;
  photographers_body: string;
  photographers_cta: string;
  brand_kicker: string;
  brand_title: string;
  brand_body: string;
  brand_cta: string;

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
  camera_position: string;
  camera_capture: string;
  camera_retake: string;
  camera_use: string;
  camera_cancel: string;
  camera_blocked: string;
  camera_loading: string;
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
  gallery_showing_all: string;
  gallery_event: string;
  gallery_no_match: string;  // uses %p% (photos) + %f% (faces) tokens
  gallery_no_face: string;
  no_results: string;
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

  cart_title: string;
  cart_kicker: string;
  cart_empty_title: string;
  cart_empty_sub: string;
  cart_empty_cta: string;
  cart_item_qty: string;
  cart_item_format: string;
  cart_item_remove: string;
  cart_subtotal: string;
  cart_iva: string;
  cart_total: string;
  cart_continue: string;
  cart_keep_shopping: string;

  checkout_title: string;
  checkout_kicker: string;
  checkout_section_contact: string;
  checkout_section_shipping: string;
  checkout_section_payment: string;
  checkout_section_summary: string;
  checkout_name: string;
  checkout_first_name: string;
  checkout_last_name: string;
  checkout_email: string;
  checkout_phone: string;
  checkout_address: string;
  checkout_address2: string;
  checkout_city: string;
  checkout_state: string;
  checkout_zip: string;
  checkout_country: string;
  checkout_pay_card: string;
  checkout_pay_card_desc: string;
  checkout_pay_oxxo: string;
  checkout_pay_oxxo_desc: string;
  checkout_shipping_free: string;
  checkout_terms: string;
  checkout_place_order: string;
  checkout_processing: string;
  checkout_back_to_cart: string;
  checkout_digital_only: string;

  confirmation_kicker: string;
  confirmation_title: string;
  confirmation_sub: string;
  confirmation_order_number: string;
  confirmation_email_to: string;
  confirmation_digital_title: string;
  confirmation_digital_sub: string;
  confirmation_digital_download: string;
  confirmation_physical_title: string;
  confirmation_physical_sub: string;
  confirmation_tracking_soon: string;
  confirmation_continue: string;

  oxxo_reference_label: string;
  oxxo_pay_at: string;
}

export const I18N: Record<Lang, Copy> = {
  en: {
    nav_how: "How it works",
    nav_events: "Events",
    nav_photographers: "For photographers",
    nav_brand: "For your brand",
    nav_login: "Sign in",
    powered_by: "powered by",
    how_kicker: "01 · HOW IT WORKS",
    how_title: "Three steps from selfie to your photos.",
    how_sub: "Search is free. You pay only for the ones you love.",
    how_step1_title: "PICK AN EVENT",
    how_step1_body: "Choose the show, convention or race you went to.",
    how_step2_title: "TAKE A SELFIE",
    how_step2_body: "One frontal photo. Encrypted, never sold, deletable on request.",
    how_step3_title: "WE FIND YOU",
    how_step3_body: "AI sweeps every photo, returns the ones you're in. Buy a single shot or your whole reel.",
    photographers_kicker: "03 · FOR PHOTOGRAPHERS",
    photographers_title: "Cover an event. Get paid per fan match.",
    photographers_body: "Upload your gallery, we watermark + face-index it, and split the revenue every time a fan finds themselves. Standard 50% commission, Pro and VIP tiers available for credentialed pros.",
    photographers_cta: "Apply to shoot",
    brand_kicker: "04 · FOR YOUR BRAND",
    brand_title: "Turn fan photos into a memory channel.",
    brand_body: "Sponsor an event and give every attendee their photos for free — branded, watermarked, downloadable. Optional merch upsell. Flat fee, predictable cost, deep engagement metrics. Perfect for activations, conventions, weddings, corporate parties.",
    brand_cta: "Talk to sales",

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
    camera_position: "Center your face in the frame",
    camera_capture: "CAPTURE",
    camera_retake: "RETAKE",
    camera_use: "USE THIS SELFIE",
    camera_cancel: "CANCEL",
    camera_blocked: "Camera access blocked. Please use upload instead, or check browser settings.",
    camera_loading: "Starting camera…",
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
    gallery_showing_all: "SHOWING ALL",
    gallery_event: "EVENT",
    gallery_no_match: "Scanned %p% photos · %f% faces · 0 matches in this event. Showing the full coverage as a preview.",
    gallery_no_face: "Couldn't detect a face in the selfie — try one with better lighting / clearer angle. Showing the full coverage so you can still browse the event.",
    no_results: "NO RESULTS",
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

    cart_title: "YOUR CART",
    cart_kicker: "REVIEW · ADJUST · CHECK OUT",
    cart_empty_title: "NOTHING IN THE CART YET",
    cart_empty_sub: "Pick an event, find yourself, add the keepers.",
    cart_empty_cta: "BROWSE EVENTS",
    cart_item_qty: "QTY",
    cart_item_format: "FORMAT",
    cart_item_remove: "REMOVE",
    cart_subtotal: "SUBTOTAL",
    cart_iva: "IVA · 16%",
    cart_total: "TOTAL",
    cart_continue: "CONTINUE TO CHECKOUT",
    cart_keep_shopping: "KEEP SHOPPING",

    checkout_title: "CHECKOUT",
    checkout_kicker: "ALMOST THERE",
    checkout_section_contact: "01 · CONTACT",
    checkout_section_shipping: "02 · SHIPPING ADDRESS",
    checkout_section_payment: "03 · PAYMENT",
    checkout_section_summary: "ORDER SUMMARY",
    checkout_name: "Full name",
    checkout_first_name: "First name",
    checkout_last_name: "Last name",
    checkout_email: "Email",
    checkout_phone: "Phone",
    checkout_address: "Street + number",
    checkout_address2: "Apt / suite / interior (optional)",
    checkout_city: "City",
    checkout_state: "State",
    checkout_zip: "ZIP / postal code",
    checkout_country: "Country",
    checkout_pay_card: "PAY WITH CARD",
    checkout_pay_card_desc: "Visa, Mastercard, Amex. Secured by Stripe.",
    checkout_pay_oxxo: "PAY WITH OXXO",
    checkout_pay_oxxo_desc: "Pay in cash at any OXXO. Settles in 24-48h.",
    checkout_shipping_free: "FREE",
    checkout_terms: "I agree to FanSnap's terms + privacy notice.",
    checkout_place_order: "PLACE ORDER",
    checkout_processing: "PROCESSING…",
    checkout_back_to_cart: "Back to cart",
    checkout_digital_only: "Digital order — no shipping required.",

    confirmation_kicker: "PAYMENT CONFIRMED",
    confirmation_title: "ORDER PLACED",
    confirmation_sub: "Thanks for trusting FanSnap with your memories.",
    confirmation_order_number: "ORDER",
    confirmation_email_to: "Receipt sent to",
    confirmation_digital_title: "DIGITAL DOWNLOADS · READY NOW",
    confirmation_digital_sub: "High-resolution, no watermark. Yours forever.",
    confirmation_digital_download: "DOWNLOAD",
    confirmation_physical_title: "PHYSICAL ITEMS · IN PRODUCTION",
    confirmation_physical_sub: "Tracking link arrives by email once shipped.",
    confirmation_tracking_soon: "ETA",
    confirmation_continue: "BACK TO EVENTS",

    oxxo_reference_label: "OXXO REFERENCE",
    oxxo_pay_at: "Pay this code at any OXXO within 72h.",
  },
  pt: {
    nav_how: "Como funciona",
    nav_events: "Eventos",
    nav_photographers: "Para fotógrafos",
    nav_brand: "Para sua marca",
    nav_login: "Entrar",
    powered_by: "powered by",
    how_kicker: "01 · COMO FUNCIONA",
    how_title: "Três passos da selfie até as suas fotos.",
    how_sub: "Buscar é grátis. Você paga só pelas que quiser.",
    how_step1_title: "ESCOLHA UM EVENTO",
    how_step1_body: "Show, convenção ou corrida — selecione onde você esteve.",
    how_step2_title: "TIRA UMA SELFIE",
    how_step2_body: "Uma foto frontal. Criptografada, nunca vendida, pode ser apagada a pedido.",
    how_step3_title: "A GENTE ACHA VOCÊ",
    how_step3_body: "IA varre todas as fotos e devolve só as suas. Compra uma foto ou o pacote inteiro.",
    photographers_kicker: "03 · PARA FOTÓGRAFOS",
    photographers_title: "Cubra um evento. Receba por cada fã encontrado.",
    photographers_body: "Suba sua galeria, a gente coloca marca d'água + indexa os rostos, e divide a receita toda vez que um fã se encontra. Comissão Standard 50%, tiers Pro e VIP pra fotógrafos credenciados.",
    photographers_cta: "Quero cobrir eventos",
    brand_kicker: "04 · PARA SUA MARCA",
    brand_title: "Transforme fotos de fãs num canal de memória.",
    brand_body: "Patrocine um evento e dê as fotos de graça pra todo mundo — com sua marca, marca d'água e download. Upsell de produto opcional. Tarifa fixa, custo previsível, métricas de engajamento profundas. Perfeito pra ativações, convenções, casamentos, festas corporativas.",
    brand_cta: "Quero falar com vendas",

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
    camera_position: "Centralize seu rosto no quadro",
    camera_capture: "CAPTURAR",
    camera_retake: "REFAZER",
    camera_use: "USAR ESSA SELFIE",
    camera_cancel: "CANCELAR",
    camera_blocked: "Acesso à câmera bloqueado. Use o upload, ou libere nas permissões do browser.",
    camera_loading: "Ligando câmera…",
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
    gallery_showing_all: "MOSTRANDO TUDO",
    gallery_event: "EVENTO",
    gallery_no_match: "Buscamos em %p% fotos · %f% rostos · 0 correspondências neste evento. Mostrando a cobertura completa como prévia.",
    gallery_no_face: "Não detectamos um rosto na selfie — tente uma com melhor luz / ângulo mais claro. Mostrando a cobertura completa para você navegar mesmo assim.",
    no_results: "SEM RESULTADOS",
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

    cart_title: "SEU CARRINHO",
    cart_kicker: "REVISA · AJUSTA · FINALIZA",
    cart_empty_title: "NADA NO CARRINHO AINDA",
    cart_empty_sub: "Escolhe um evento, se acha nas fotos, adiciona as que vão pra parede.",
    cart_empty_cta: "VER EVENTOS",
    cart_item_qty: "QTD",
    cart_item_format: "FORMATO",
    cart_item_remove: "REMOVER",
    cart_subtotal: "SUBTOTAL",
    cart_iva: "IVA · 16%",
    cart_total: "TOTAL",
    cart_continue: "IR PRO CHECKOUT",
    cart_keep_shopping: "CONTINUAR COMPRANDO",

    checkout_title: "CHECKOUT",
    checkout_kicker: "QUASE LÁ",
    checkout_section_contact: "01 · CONTATO",
    checkout_section_shipping: "02 · ENDEREÇO DE ENTREGA",
    checkout_section_payment: "03 · PAGAMENTO",
    checkout_section_summary: "RESUMO DO PEDIDO",
    checkout_name: "Nome completo",
    checkout_first_name: "Nome",
    checkout_last_name: "Sobrenome",
    checkout_email: "Email",
    checkout_phone: "Telefone",
    checkout_address: "Rua + número",
    checkout_address2: "Apto / complemento (opcional)",
    checkout_city: "Cidade",
    checkout_state: "Estado",
    checkout_zip: "CEP / código postal",
    checkout_country: "País",
    checkout_pay_card: "PAGAR COM CARTÃO",
    checkout_pay_card_desc: "Visa, Mastercard, Amex. Processado pela Stripe.",
    checkout_pay_oxxo: "PAGAR COM OXXO",
    checkout_pay_oxxo_desc: "Em dinheiro em qualquer OXXO. Liquida em 24-48h.",
    checkout_shipping_free: "GRÁTIS",
    checkout_terms: "Concordo com os termos + política de privacidade da FanSnap.",
    checkout_place_order: "FINALIZAR PEDIDO",
    checkout_processing: "PROCESSANDO…",
    checkout_back_to_cart: "Voltar ao carrinho",
    checkout_digital_only: "Pedido digital — não precisa de endereço de entrega.",

    confirmation_kicker: "PAGAMENTO CONFIRMADO",
    confirmation_title: "PEDIDO FEITO",
    confirmation_sub: "Obrigado por confiar suas memórias à FanSnap.",
    confirmation_order_number: "PEDIDO",
    confirmation_email_to: "Recibo enviado pra",
    confirmation_digital_title: "DOWNLOADS DIGITAIS · PRONTOS AGORA",
    confirmation_digital_sub: "Alta resolução, sem marca d'água. Suas pra sempre.",
    confirmation_digital_download: "BAIXAR",
    confirmation_physical_title: "PRODUTOS FÍSICOS · EM PRODUÇÃO",
    confirmation_physical_sub: "Link de rastreio chega no email quando despachar.",
    confirmation_tracking_soon: "ENTREGA EM",
    confirmation_continue: "VOLTAR AOS EVENTOS",

    oxxo_reference_label: "REFERÊNCIA OXXO",
    oxxo_pay_at: "Pague esse código em qualquer OXXO em até 72h.",
  },
  es: {
    nav_how: "Cómo funciona",
    nav_events: "Eventos",
    nav_photographers: "Para fotógrafos",
    nav_brand: "Para tu marca",
    nav_login: "Entrar",
    powered_by: "powered by",
    how_kicker: "01 · CÓMO FUNCIONA",
    how_title: "Tres pasos desde la selfie hasta tus fotos.",
    how_sub: "Buscar es gratis. Pagas solo por las que quieras.",
    how_step1_title: "ELIGE UN EVENTO",
    how_step1_body: "Concierto, convención o carrera — selecciona dónde estuviste.",
    how_step2_title: "TÓMATE UNA SELFIE",
    how_step2_body: "Una foto frontal. Encriptada, nunca se vende, se puede eliminar a solicitud.",
    how_step3_title: "TE ENCONTRAMOS",
    how_step3_body: "La IA recorre todas las fotos y te devuelve solo las tuyas. Compra una sola o el paquete completo.",
    photographers_kicker: "03 · PARA FOTÓGRAFOS",
    photographers_title: "Cubre un evento. Recibe por cada fan encontrado.",
    photographers_body: "Sube tu galería, ponemos marca de agua + indexamos rostros, y dividimos los ingresos cada vez que un fan se encuentra. Comisión Standard 50%, tiers Pro y VIP para fotógrafos credenciados.",
    photographers_cta: "Quiero cubrir eventos",
    brand_kicker: "04 · PARA TU MARCA",
    brand_title: "Convierte las fotos de fans en un canal de memoria.",
    brand_body: "Patrocina un evento y entrega las fotos gratis a todos los asistentes — con tu marca, marca de agua y descarga. Upsell de merch opcional. Tarifa fija, costo previsible, métricas de engagement profundas. Perfecto para activaciones, convenciones, bodas, fiestas corporativas.",
    brand_cta: "Hablar con ventas",

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
    camera_position: "Centra tu rostro en el marco",
    camera_capture: "CAPTURAR",
    camera_retake: "REPETIR",
    camera_use: "USAR ESTA SELFIE",
    camera_cancel: "CANCELAR",
    camera_blocked: "Acceso a la cámara bloqueado. Usa la opción de subir, o revisa los permisos del navegador.",
    camera_loading: "Iniciando cámara…",
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
    gallery_showing_all: "MOSTRANDO TODO",
    gallery_event: "EVENTO",
    gallery_no_match: "Buscamos en %p% fotos · %f% rostros · 0 coincidencias en este evento. Mostramos la cobertura completa como vista previa.",
    gallery_no_face: "No detectamos un rostro en la selfie — prueba con mejor luz / ángulo más claro. Mostramos la cobertura completa para que explores el evento.",
    no_results: "SIN RESULTADOS",
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

    cart_title: "TU CARRITO",
    cart_kicker: "REVISA · AJUSTA · FINALIZA",
    cart_empty_title: "NADA EN EL CARRITO TODAVÍA",
    cart_empty_sub: "Elige un evento, encuéntrate, suma las que más te gustaron.",
    cart_empty_cta: "VER EVENTOS",
    cart_item_qty: "CANT",
    cart_item_format: "FORMATO",
    cart_item_remove: "QUITAR",
    cart_subtotal: "SUBTOTAL",
    cart_iva: "IVA · 16%",
    cart_total: "TOTAL",
    cart_continue: "IR AL CHECKOUT",
    cart_keep_shopping: "SEGUIR COMPRANDO",

    checkout_title: "CHECKOUT",
    checkout_kicker: "CASI LISTO",
    checkout_section_contact: "01 · CONTACTO",
    checkout_section_shipping: "02 · DIRECCIÓN DE ENVÍO",
    checkout_section_payment: "03 · PAGO",
    checkout_section_summary: "RESUMEN DEL PEDIDO",
    checkout_name: "Nombre completo",
    checkout_first_name: "Nombre",
    checkout_last_name: "Apellido",
    checkout_email: "Email",
    checkout_phone: "Teléfono",
    checkout_address: "Calle + número",
    checkout_address2: "Depto / interior (opcional)",
    checkout_city: "Ciudad",
    checkout_state: "Estado",
    checkout_zip: "CP / código postal",
    checkout_country: "País",
    checkout_pay_card: "PAGAR CON TARJETA",
    checkout_pay_card_desc: "Visa, Mastercard, Amex. Procesado por Stripe.",
    checkout_pay_oxxo: "PAGAR EN OXXO",
    checkout_pay_oxxo_desc: "En efectivo en cualquier OXXO. Liquida en 24-48h.",
    checkout_shipping_free: "GRATIS",
    checkout_terms: "Acepto los términos + aviso de privacidad de FanSnap.",
    checkout_place_order: "FINALIZAR PEDIDO",
    checkout_processing: "PROCESANDO…",
    checkout_back_to_cart: "Volver al carrito",
    checkout_digital_only: "Pedido digital — no necesita dirección de envío.",

    confirmation_kicker: "PAGO CONFIRMADO",
    confirmation_title: "PEDIDO REALIZADO",
    confirmation_sub: "Gracias por confiar tus recuerdos a FanSnap.",
    confirmation_order_number: "PEDIDO",
    confirmation_email_to: "Recibo enviado a",
    confirmation_digital_title: "DESCARGAS DIGITALES · LISTAS YA",
    confirmation_digital_sub: "Alta resolución, sin marca de agua. Tuyas para siempre.",
    confirmation_digital_download: "DESCARGAR",
    confirmation_physical_title: "PRODUCTOS FÍSICOS · EN PRODUCCIÓN",
    confirmation_physical_sub: "El link de seguimiento llega por email cuando se envíe.",
    confirmation_tracking_soon: "ENTREGA EN",
    confirmation_continue: "VOLVER A LOS EVENTOS",

    oxxo_reference_label: "REFERENCIA OXXO",
    oxxo_pay_at: "Paga este código en cualquier OXXO dentro de 72h.",
  },
};
