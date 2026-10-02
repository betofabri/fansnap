// FanSnap · Roadmap — /fansnap/roadmap
//
// Opens with the macro next steps in three columns (técnico, negócio,
// marketing), then two tracks:
//   02 Produto    — the technical phases from docs/roadmap-real-pipeline.md,
//                   explained in plain language first, with the technical
//                   detail (items + verification) behind a native <details>.
//   03 Lançamento — the business track that runs in parallel
//                   (docs/roadmap-lancamento.md): photographers, brand, OCESA,
//                   legal, pilot event, scale at CCXP MX.
//   04 Time       — minimum team + budget estimate for the pilot.
// Then the technical appendix: real vs simulated and locked decisions.
//
// Internal: gated behind the PREVIEW cookie (same rule as /mapa) and noindex.
// Keep the data below in sync with the two markdown docs.

import type { Metadata } from "next";
import type React from "react";
import { notFound } from "next/navigation";
import { hasPreviewCookie } from "@/lib/gate";
import { DARK as c, FONT_GROTESK, FONT_MONO } from "@/lib/theme";
import FanSnapLogo from "@/components/FanSnapLogo";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Roadmap · FanSnap (interno)",
  robots: { index: false, follow: false },
};

const UPDATED = "01 out 2026";

type Status = "done" | "progress" | "partial" | "blocked" | "pending" | "scope";

const STATUS: Record<Status, { label: string; color: string }> = {
  done: { label: "Concluída", color: c.ok },
  progress: { label: "Em andamento", color: c.premium },
  partial: { label: "Parcial", color: c.warn },
  blocked: { label: "Bloqueada", color: c.magenta },
  pending: { label: "Pendente", color: c.inkSoft },
  scope: { label: "Fora do escopo", color: c.inkMute },
};

// ─── 00 Timeline ────────────────────────────────────────────────────────────
// Gantt: one column per month, one bar per stage (start..end, inclusive).
// pct = how much of the stage is done. MVP = piloto OCESA, jan 2027.

const MONTHS = ["jul", "ago", "set", "out", "nov", "dez", "jan", "fev", "mar", "abr", "mai", "jun"];
const YEAR_BREAK = 6;   // jan 2027
const TODAY = 3;        // out 2026
const MVP = 6;          // jan 2027

type Stage = { label: string; start: number; end: number; pct: number; detail: string };
type Lane = { title: string; accent: string; stages: Stage[] };

const TIMELINE: Lane[] = [
  {
    title: "Técnico",
    accent: c.accent,
    stages: [
      { label: "Upload, marca d'água, compra e entrega", start: 0, end: 0, pct: 100, detail: "Fases 0, 1, 2a e 4: armazenamento R2, upload pelo painel, processador de marca d'água, pedidos no D1 e download por link assinado. Em produção desde julho." },
      { label: "Leitura de rostos + busca por selfie", start: 3, end: 4, pct: 0, detail: "Fases 2b e 3: container com o leitor de rostos alimentando o índice por evento, endpoint de busca e registro de cada scan. Bloqueado por Docker Desktop e plano Containers." },
      { label: "Consentimento biométrico + legal", start: 4, end: 5, pct: 0, detail: "Fase 6: step de consentimento antes da selfie, páginas de privacidade, termos e aviso biométrico, apagar meus dados." },
      { label: "Login, trava do admin, emails", start: 5, end: 5, pct: 15, detail: "Fases 5, #43 e 7: login por magic-link, Cloudflare Access no admin, email de fotos prontas e envio ativado no domínio. Recibo já pronto." },
      { label: "Abrir o site + piloto", start: 6, end: 6, pct: 0, detail: "Tirar a página de em breve depois das etapas anteriores. Plantão técnico no evento." },
      { label: "Pagamento real", start: 7, end: 8, pct: 0, detail: "Gateway com cartão e OXXO e repasse ao fotógrafo. Só muda como o status do pedido vira pago." },
      { label: "Escala CCXP MX", start: 9, end: 9, pct: 0, detail: "Dezenas de fotógrafos, eventos patrocinados, integração com a comunicação do evento." },
      { label: "Busca em escala + SDK", start: 10, end: 11, pct: 0, detail: "Busca no servidor acima de cerca de 2.000 fotos por evento. SDK para embutir no app do promotor." },
    ],
  },
  {
    title: "Negócio",
    accent: c.premium,
    stages: [
      { label: "Negociação com a OCESA", start: 3, end: 4, pct: 0, detail: "Percentual sobre vendas, exclusividade por evento, quem fatura no México, formato do evento patrocinado." },
      { label: "Budget, time, marca, jurídico", start: 3, end: 5, pct: 0, detail: "Aprovar time mínimo e budget do piloto. Pedido de marca no IMPI e INPI, domínios. Escritório jurídico para privacidade biométrica, termos e contrato do fotógrafo." },
      { label: "Evento piloto, preço, empresa que fatura", start: 4, end: 5, pct: 0, detail: "Show ou venue médio na CDMX com autorização e credenciais. Preço por foto e pacote, IVA, empresa emissora, conta no meio de pagamento." },
      { label: "Fotógrafos credenciados", start: 5, end: 6, pct: 0, detail: "5 a 8 fotógrafos vindos do /aplica, com alta no painel, treino e teste real de upload." },
      { label: "Piloto OCESA", start: 6, end: 6, pct: 0, detail: "Cobertura, vendas e suporte ao vivo no evento." },
      { label: "Go/no-go + patrocínios CCXP MX", start: 7, end: 9, pct: 0, detail: "Métricas do piloto (fotos, buscas, conversão, ticket médio, satisfação), decisão e venda de patrocínio para a CCXP MX." },
      { label: "Plano LATAM", start: 10, end: 11, pct: 0, detail: "Próximos países e verticais." },
    ],
  },
  {
    title: "Marketing",
    accent: c.magenta,
    stages: [
      { label: "Landing + recrutamento de fotógrafos", start: 0, end: 5, pct: 40, detail: "Landing /aplica no ar. Divulgação em redes, grupos de fotógrafos da CDMX e indicação. Meta: 50 cadastros até novembro." },
      { label: "Redes + conteúdo pré-lançamento", start: 4, end: 5, pct: 0, detail: "Reservar @fansnap (Instagram, TikTok, X, LinkedIn), bio e identidade. Posts de bastidores, fotógrafos do roster, como funciona." },
      { label: "Material no venue + anúncio do piloto", start: 5, end: 6, pct: 0, detail: "Sinalização, QR code, roteiro de ativação. Release e kit de imprensa com a OCESA." },
      { label: "Piloto OCESA", start: 6, end: 6, pct: 0, detail: "Cobertura em redes durante o evento." },
      { label: "Pós-evento + campanha CCXP MX", start: 7, end: 9, pct: 0, detail: "Email de fotos prontas e redes depois do piloto. Campanha para a CCXP MX." },
      { label: "Lançamento LATAM", start: 10, end: 11, pct: 0, detail: "Comunicação por país." },
    ],
  },
];

function remaining(lane: Lane): number {
  const upToMvp = lane.stages.filter((st) => st.start <= MVP);
  if (!upToMvp.length) return 100;
  return Math.round(upToMvp.reduce((n, st) => n + (100 - st.pct), 0) / upToMvp.length);
}

// ─── 01 Produto ─────────────────────────────────────────────────────────────

type Phase = {
  id: string;
  title: string;      // plain-language title
  status: Status;
  when?: string;
  plain: string;      // what it means for the business, no jargon
  techTitle: string;  // original technical name
  items: string[];    // technical scope
  verify?: string;
};

const PHASES: Phase[] = [
  {
    id: "0",
    title: "Preparar onde as fotos vão morar",
    status: "done",
    when: "jul 2026",
    plain: "Criamos o armazenamento das fotos na nuvem e a marcação que separa os eventos de demonstração dos eventos reais.",
    techTitle: "Provisão + flag",
    items: [
      "Bucket R2 fansnap-photos + binding PHOTOS",
      "migrate-004: photo_source (mock | live), photos.status, content_hash, tabela photo_faces",
      "Layout R2: originals/<code>/<id> privado, previews/<code>/<id> via Worker",
    ],
  },
  {
    id: "1",
    title: "O fotógrafo envia as fotos de verdade",
    status: "done",
    when: "jul 2026",
    plain: "Pelo painel dele, o fotógrafo sobe as fotos do evento direto pro nosso armazenamento, com checagem de formato e tamanho. Já funciona em produção.",
    techTitle: "Upload real",
    items: [
      "POST init, PUT stream para R2, complete enfileira o processamento",
      "UploadPanel mantém validação client-side e faz polling do status",
      "Atrás de photo_source = live; eventos mock seguem com a simulação",
    ],
  },
  {
    id: "2a",
    title: "Cada foto ganha marca d'água sozinha",
    status: "done",
    when: "jul 2026",
    plain: "Assim que a foto chega, o sistema reduz o tamanho e aplica a marca d'água FanSnap. É essa versão que o fã vê na galeria. O original fica guardado e protegido. O admin escolhe a intensidade da marca por evento.",
    techTitle: "Processamento: marca d'água",
    items: [
      "Fila fansnap-process + Worker fansnap-processor (deploy separado)",
      "Resize 1600px + marca d'água v3 (lattice diagonal) via Photon WASM",
      "Nível por evento: suave, media, forte (migrate-007), chave de preview versionada",
      "Reprocesso sob demanda, status published",
    ],
    verify: "Verificado em prod com inspeção visual da preview.",
  },
  {
    id: "2b",
    title: "Ensinar o sistema a achar rostos nas fotos reais",
    status: "blocked",
    plain: "Hoje a busca por selfie só funciona nos eventos de demonstração. Pra funcionar num evento real, cada foto precisa passar por um leitor de rostos logo depois do upload. Está travado por dois motivos práticos: falta instalar uma ferramenta na máquina (Docker) e contratar um plano extra na Cloudflare. É o bloqueio mais importante do projeto.",
    techTitle: "Processamento: índice facial",
    items: [
      "Descriptors por foto em photo_faces, via Queue para um Container Node que reusa build-face-index.mjs",
      "Bloqueio: Docker Desktop (build da imagem) + plano Cloudflare com Containers",
      "Até lá face_indexed = 0 e o match só funciona em eventos mock",
      "Destravar: containers/face-index/ com Node + tfjs-node + canvas, consumer da fila",
    ],
    verify: "photo_faces populado, face_indexed = 1, rosto encontrado no scan de um evento live.",
  },
  {
    id: "3",
    title: "A selfie do fã encontra as fotos dele",
    status: "pending",
    plain: "Com os rostos lidos, a busca por selfie passa a funcionar em qualquer evento ao vivo, não só na demonstração. Também guardamos o registro de cada busca. Depende da fase anterior.",
    techTitle: "Match por evento",
    items: [
      "GET /api/events/<code>/face-index com previews + descriptors do D1",
      "loadIndex(code, source): live busca o endpoint, mock mantém o JSON estático",
      "Threshold e mirror-invariance idênticos aos de hoje",
      "Gravar scans + scan_matches com consent_text_id e selfie_hash",
      "Aposentar o stub /api/scan",
    ],
    verify: "Scan acha fotos reais de um evento live; evento mock inalterado.",
  },
  {
    id: "4",
    title: "O fã compra e recebe a foto original",
    status: "done",
    when: "jul 2026",
    plain: "Pedido, pagamento (por enquanto simulado, ninguém é cobrado) e download do original sem marca d'água por um link que vale 24 horas. Se o link vencer, o fã recupera com o código do pedido e o email. Quando o pagamento real entrar, nada disso precisa ser refeito.",
    techTitle: "Entrega do original sem gateway",
    items: [
      "POST /api/orders grava orders + order_lines no rail free_sponsored, status paid",
      "Código curto FS-XXXXXX + email para lookup em /pedidos",
      "Download com link assinado HMAC, 24h, original limpo byte-idêntico",
      "Link vencido reemite após código + email",
    ],
    verify: "E2E em prod: original idêntico, tampering rejeitado, mock faz 302.",
  },
  {
    id: "5",
    title: "Entrar sem senha",
    status: "pending",
    plain: "Fã e fotógrafo entram com um link enviado por email, sem criar senha. O fotógrafo passa a ver os eventos e as vendas reais dele; o fã vê o histórico de compras e baixa de novo quando quiser.",
    techTitle: "Auth de produto (magic-link)",
    items: [
      "POST /api/auth/request e GET /api/auth/callback, sessão JWT em cookie httpOnly",
      "Dashboard do fotógrafo em dado real (eventos atribuídos, vendas)",
      "Conta do fã: histórico + re-download",
    ],
  },
  {
    id: "6",
    title: "Permissão pra usar a selfie, como a lei mexicana pede",
    status: "pending",
    plain: "Antes de tirar a selfie, o fã lê e aceita o aviso de privacidade. Guardamos essa aceitação e o fã pode pedir pra apagar os dados dele. Inclui as páginas de privacidade e termos. Sem isso o site não pode abrir no México.",
    techTitle: "Consentimento biométrico + legal MX",
    items: [
      "Step versionado antes da selfie, gravando consent_text_id e consent_accepted_at",
      "Páginas /privacidad, /terminos, /aviso-biometrico",
      "Fluxo ARCO e apagar meus dados",
    ],
    verify: "Scan sem consentimento bloqueado; registro gravado e apagável.",
  },
  {
    id: "7",
    title: "Emails automáticos",
    status: "partial",
    plain: "O recibo de compra com as fotos já está pronto. Falta o aviso de que as fotos estão disponíveis e ligar o envio de verdade no domínio. Hoje os emails ainda não saem.",
    techTitle: "Emails transacionais",
    items: [
      "Feito: recibo com thumbs marcadas e links assinados",
      "Pendente: tus fotos están listas ao publicar ou dar match",
      "Pendente: ativar Email Sending em betofabri.com + DNS; hoje falha em silêncio",
    ],
  },
  {
    id: "8",
    title: "Acabamento",
    status: "pending",
    plain: "Unificar os dois formulários de cadastro, alinhar o visual das páginas, acessibilidade e medir onde o fã desiste no caminho da compra.",
    techTitle: "Polish e dívida",
    items: [
      "Dedupe dos dois forms de cadastro (/fotografos#cadastro e /aplica)",
      "Reconciliar brutalismo da SPA com as landings flat",
      "a11y (micro-labels, alvos de toque), analytics de funil",
    ],
  },
  {
    id: "#43",
    title: "Trancar a área administrativa",
    status: "pending",
    plain: "Hoje o painel do admin não pede login. Vamos colocar o login Google da empresa na frente dele. Obrigatório antes de abrir o site.",
    techTitle: "Cloudflare Access no /admin",
    items: ["Google SSO via Cloudflare Access na rota /fansnap/admin*"],
  },
  {
    id: "$",
    title: "Pagamento de verdade e repasse ao fotógrafo",
    status: "scope",
    plain: "Fora desta rodada. Cartão, OXXO e repasse ao fotógrafo entram quando o modelo comercial estiver fechado. O sistema já está preparado pra receber.",
    techTitle: "Gateway de pagamento + payout",
    items: ["Stripe / MercadoPago / OXXO: quando entrar, só muda como orders.status flipa pra paid"],
  },
];

// ─── 02 Lançamento ──────────────────────────────────────────────────────────

type Milestone = {
  title: string;
  status: Status;
  body: string;
  dep?: string; // dependency on the product track
};

type Horizon = { title: string; when: string; accent: string; items: Milestone[] };

const LAUNCH: Horizon[] = [
  {
    title: "Agora",
    when: "out 2026",
    accent: c.accent,
    items: [
      {
        title: "Negociação com a OCESA",
        status: "pending",
        body: "Fechar a porcentagem sobre as vendas, exclusividade por evento, quem fatura no México e como funciona o evento patrocinado. Define o preço final da foto.",
        dep: "O sistema já suporta os três modelos de negócio; só precisa do número.",
      },
      {
        title: "Registro da marca FanSnap",
        status: "pending",
        body: "Pedido no IMPI (México) e INPI (Brasil), mais os domínios fansnap.com.mx e fansnap.mx. Leva meses.",
      },
      {
        title: "Perfis da plataforma nas redes",
        status: "pending",
        body: "Reservar o @fansnap no Instagram, TikTok, X e LinkedIn, montar bio, identidade e os primeiros posts. ",
      },
      {
        title: "Campanha de recrutamento de fotógrafos",
        status: "progress",
        body: "A landing de pré-cadastro em /aplica está no ar. Falta divulgar: redes, grupos de fotógrafos de eventos na CDMX, indicação entre pares. Meta sugerida: 50 cadastros até novembro.",
        dep: "Landing e fila de candidaturas no admin já prontas.",
      },
      {
        title: "Jurídico no México",
        status: "pending",
        body: "Contratar escritório pra escrever o aviso de privacidade biométrico (LFPDPPP), termos de uso e o contrato com o fotógrafo.",
        dep: "Os textos entram na fase 6 do produto.",
      },
    ],
  },
  {
    title: "Pré-piloto",
    when: "nov a dez 2026",
    accent: c.premium,
    items: [
      {
        title: "Escolher o evento piloto da OCESA",
        status: "pending",
        body: "Um show ou venue de porte médio na CDMX. Garantir autorização pra fotografar, credenciais e um ponto de contato da produção.",
      },
      {
        title: "Selecionar e credenciar os fotógrafos do piloto",
        status: "pending",
        body: "Entre 5 e 8 fotógrafos da base do /aplica. Fazer a alta no painel, treinar o upload e rodar um teste real antes do evento.",
        dep: "Upload e marca d'água já funcionam em produção.",
      },
      {
        title: "Preço final e empresa que fatura",
        status: "pending",
        body: "Definir preço por foto e por pacote, IVA, qual empresa emite a nota no México (JV, OCESA ou CCXP) e abrir a conta no meio de pagamento.",
      },
      {
        title: "Material no evento",
        status: "pending",
        body: "Sinalização, QR code nos pontos de fluxo, roteiro da ativação e canal de atendimento ao fã (WhatsApp ou email).",
      },
      {
        title: "Abrir o site ao público",
        status: "pending",
        body: "Tirar a página de 'em breve' e liberar o fluxo completo pra qualquer pessoa.",
        dep: "Depende das fases 2b, 3 e 6 e da trava do admin.",
      },
    ],
  },
  {
    title: "Piloto OCESA",
    when: "jan 2027",
    accent: c.magenta,
    items: [
      {
        title: "Rodar o piloto",
        status: "pending",
        body: "Cobertura do evento, fotos publicadas no mesmo dia, vendas e suporte ao vivo.",
      },
      {
        title: "Pagamento real ligado",
        status: "pending",
        body: "Cartão e OXXO funcionando antes do piloto ou logo depois, conforme a negociação. Até lá, o piloto pode rodar no modelo patrocinado (foto grátis pro fã, pago pelo patrocinador).",
        dep: "Gateway está fora do escopo técnico atual; entra quando o comercial fechar.",
      },
      {
        title: "Medir e decidir",
        status: "pending",
        body: "Fotos subidas, buscas feitas, conversão, ticket médio, satisfação do fã e do fotógrafo. Com isso, decisão de ir ou não pra CCXP MX.",
      },
    ],
  },
  {
    title: "Escala",
    when: "CCXP MX, abr 2027",
    accent: c.ok,
    items: [
      {
        title: "FanSnap na CCXP MX",
        status: "pending",
        body: "Dezenas de fotógrafos, eventos patrocinados por marcas, comunicação integrada ao evento e ao app.",
      },
      {
        title: "Plano LATAM",
        status: "pending",
        body: "Próximos países e verticais (maratonas, esportes), com base no que o piloto e a CCXP MX ensinaram.",
      },
    ],
  },
];

// ─── Technical appendix ─────────────────────────────────────────────────────

type Row = { piece: string; today: string; real: boolean; target: string };

const REAL_VS_SIM: Row[] = [
  { piece: "Upload do fotógrafo", today: "Stream direto pro R2 quando o evento é live", real: true, target: "Igual" },
  { piece: "Armazenamento", today: "R2: originals privados, previews via Worker", real: true, target: "Igual" },
  { piece: "Marca d'água / resize", today: "Server-side por upload, nível por evento, chave versionada", real: true, target: "Igual" },
  { piece: "Índice facial", today: "JSON estático só pros eventos mock", real: false, target: "Por evento, a partir dos uploads (2b)" },
  { piece: "Match", today: "Client-side vs JSON estático, só mock", real: false, target: "Client por evento (3), server em escala" },
  { piece: "Pedido", today: "orders + order_lines no D1, rail free_sponsored", real: true, target: "Gateway só flipa o status" },
  { piece: "Entrega do original", today: "Link assinado 24h, original limpo", real: true, target: "Igual" },
  { piece: "Auth", today: "Nenhuma; id do pedido é a capability", real: false, target: "Magic-link (5) + Access no admin (#43)" },
  { piece: "Consentimento biométrico", today: "Checkbox no carrinho", real: false, target: "Step versionado antes da selfie (6)" },
  { piece: "Emails", today: "Template pronto, envio depende do domínio", real: false, target: "Fotos listas + envio confirmado (7)" },
];

const DECISIONS = [
  { n: "1", title: "Índice facial server-side: Queue para Container Node", body: "face-api precisa de canvas nativo e não roda no runtime de Workers. O Container reusa o código validado de build-face-index.mjs e a biometria não sai da Cloudflare. Rekognition e Vectorize descartados." },
  { n: "2", title: "Auth de produto: magic-link por email", body: "Passwordless, reusa o binding de Email. Sessão em JWT assinado, cookie httpOnly. Google OAuth descartado por ora." },
  { n: "3", title: "Match em escala", body: "Client-side por evento até cerca de 1.500 a 2.000 fotos. Acima disso o mesmo Container faz o match server-side." },
  { n: "4", title: "Entrega sem gateway: rail free_sponsored", body: "Executado na Fase 4. Pedido nasce paid por stub; o gateway, quando entrar, só muda como esse status flipa." },
];

type Column = { title: string; accent: string; items: { text: string; status?: Status; href?: string }[] };

const NEXT_STEPS: Column[] = [
  {
    title: "Técnico",
    accent: c.accent,
    items: [
      { text: "Destravar a fase 2b (Docker Desktop + plano Containers) e fechar a fase 3", status: "blocked" },
      { text: "Fase 6: consentimento e páginas legais, pré-requisito de abrir o site no MX" },
      { text: "Fase 5: magic-link e dashboard do fotógrafo em dado real" },
      { text: "#43: Cloudflare Access no /admin" },
      { text: "Confirmar Email Sending no domínio e completar a fase 7", status: "partial" },
    ],
  },
  {
    title: "Negócio",
    accent: c.premium,
    items: [
      { text: "Fechar a porcentagem e o modelo com a OCESA (quem fatura, exclusividade, evento patrocinado)" },
      { text: "Definir budget e time inicial mínimo", href: "#time" },
      { text: "Escolher o evento piloto da OCESA (janeiro de 2027)" },
      { text: "Registrar a marca FanSnap (IMPI + INPI) e os domínios" },
      { text: "Contratar jurídico no México: privacidade biométrica, termos, contrato do fotógrafo" },
      { text: "Definir preço por foto e pacote, IVA e a empresa que fatura" },
    ],
  },
  {
    title: "Marketing",
    accent: c.magenta,
    items: [
      { text: "Reservar o @fansnap nas redes e publicar a identidade" },
      { text: "Campanha de recrutamento de fotógrafos a partir do /aplica", status: "progress" },
      { text: "Plano de conteúdo pré-lançamento: bastidores, fotógrafos do roster, como funciona" },
      { text: "Material de ativação no venue: QR code, sinalização, roteiro" },
      { text: "Anúncio do piloto com a OCESA: release e kit de imprensa" },
      { text: "Comunicação pós-evento ao fã: email de fotos prontas e redes" },
    ],
  },
];

type Role = { role: string; what: string; dedication: string; cost: string };

// Estimativas de referência para o período do piloto (6 meses), em USD/mês.
// Validar com RH e com os números da OCESA antes de usar fora daqui.
const TEAM: Role[] = [
  { role: "Comercial", what: "Negociação OCESA, patrocínios, pricing, parceiros de venue", dedication: "Meio período", cost: "1.500 a 2.500" },
  { role: "Suporte técnico (atendimento)", what: "Atendimento ao fã por WhatsApp e email, pedidos, downloads, reembolsos", dedication: "Meio período, integral nos dias de evento", cost: "800 a 1.200" },
  { role: "Suporte a fotógrafos", what: "Credenciamento, treino de upload, acompanhamento no evento, dúvidas de pagamento", dedication: "Meio período, integral nos dias de evento", cost: "1.000 a 1.500" },
  { role: "Marketing", what: "Redes, campanha de recrutamento, material no venue, imprensa", dedication: "Meio período", cost: "1.200 a 2.000" },
  { role: "TI (desenvolvimento)", what: "Fases 2b a 7, operação do pipeline, plantão no evento", dedication: "Integral", cost: "3.000 a 5.000" },
];

const BUDGET_OTHER = [
  { item: "Mídia paga (recrutamento + pré-lançamento)", cost: "500 a 1.000 por mês" },
  { item: "Infra Cloudflare (Workers, R2, D1, Queues, Containers)", cost: "100 a 300 por mês" },
  { item: "Jurídico MX (uma vez)", cost: "3.000 a 6.000" },
  { item: "Registro de marca IMPI + INPI + domínios (uma vez)", cost: "1.000 a 2.000" },
  { item: "Material no venue do piloto (uma vez)", cost: "500 a 1.500" },
];

// ─── Page ───────────────────────────────────────────────────────────────────

export default async function RoadmapPage() {
  if (!(await hasPreviewCookie())) notFound();

  return (
    <div style={{ background: c.bg, color: c.ink, minHeight: "100vh", fontFamily: FONT_GROTESK }}>
      <style>{css}</style>

      <header style={{ borderBottom: `1px solid ${c.border}`, background: c.surface, position: "sticky", top: 0, zIndex: 5 }}>
        <div style={{ maxWidth: 1040, margin: "0 auto", padding: "18px clamp(20px,4vw,40px)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
          <FanSnapLogo size="sm" />
          <nav style={{ display: "flex", gap: 18, alignItems: "center", flexWrap: "wrap", fontFamily: FONT_MONO, fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase" }}>
            <a href="#timeline" className="rm-nav">Timeline</a>
            <a href="#proximos" className="rm-nav">Próximos passos</a>
            <a href="#produto" className="rm-nav">Produto</a>
            <a href="#lancamento" className="rm-nav">Lançamento</a>
            <a href="#time" className="rm-nav">Time</a>
            <a href="#real" className="rm-nav">Técnico</a>
            <a href="/fansnap/mapa" className="rm-nav" style={{ color: c.inkMute }}>Mapa</a>
          </nav>
        </div>
      </header>

      <main style={{ maxWidth: 1040, margin: "0 auto", padding: "clamp(36px,6vw,72px) clamp(20px,4vw,40px) 120px" }}>
        <div style={{ fontFamily: FONT_MONO, fontSize: 11, color: c.accent, letterSpacing: "0.16em", textTransform: "uppercase", marginBottom: 20 }}>
          Roadmap · interno · atualizado {UPDATED}
        </div>

        {/* 00 Timeline */}
        <SectionTitle id="timeline" n="00" title="Timeline Geral" accent={c.magenta}
          sub="MVP: piloto em evento OCESA, janeiro de 2027. Uma barra por etapa, preenchida pelo que já está feito." />
        <Timeline />

        {/* 01 Próximos passos */}
        <SectionTitle id="proximos" n="01" title="Próximos passos" accent={c.ok}
          sub="Prioridades por frente." />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 1, background: c.border, border: `1px solid ${c.border}`, marginBottom: 72 }}>
          {NEXT_STEPS.map((col) => (
            <div key={col.title} style={{ background: c.surface, padding: "18px 20px 20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                <span style={{ width: 8, height: 8, background: col.accent }} />
                <h3 style={{ fontFamily: FONT_MONO, fontSize: 12, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", margin: 0 }}>{col.title}</h3>
              </div>
              <ol style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 10 }}>
                {col.items.map((it, i) => (
                  <li key={it.text} style={{ display: "flex", gap: 12, alignItems: "baseline" }}>
                    <span style={{ fontFamily: FONT_MONO, fontSize: 12, color: col.accent, fontWeight: 700, minWidth: 22 }}>{String(i + 1).padStart(2, "0")}</span>
                    <span style={{ fontSize: 14, lineHeight: 1.5 }}>
                      {it.href ? <a href={it.href} className="rm-link">{it.text}</a> : it.text}
                      {it.status && <span style={{ marginLeft: 8, verticalAlign: "middle" }}><Pill status={it.status} /></span>}
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </div>

        {/* 02 Produto */}
        <SectionTitle id="produto" n="02" title="Produto" accent={c.accent}
          sub="Fases do produto. Texto simples na frente, detalhe técnico em cada card." />
        <div style={{ display: "flex", flexDirection: "column", gap: 1, background: c.border, border: `1px solid ${c.border}`, marginBottom: 72 }}>
          {PHASES.map((p) => <PhaseCard key={p.id} p={p} />)}
        </div>

        {/* 02 Lançamento */}
        <SectionTitle id="lancamento" n="03" title="Lançamento" accent={c.premium}
          sub="Marcos de negócio e marketing em paralelo ao produto. Dependência do produto indicada no card." />
        <div style={{ display: "flex", flexDirection: "column", gap: 28, marginBottom: 72 }}>
          {LAUNCH.map((h) => (
            <div key={h.title}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 10 }}>
                <span style={{ width: 8, height: 8, background: h.accent, alignSelf: "center" }} />
                <h3 style={{ fontFamily: FONT_MONO, fontSize: 13, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", margin: 0 }}>{h.title}</h3>
                <span style={{ fontFamily: FONT_MONO, fontSize: 11, color: c.inkMute }}>{h.when}</span>
                <span style={{ flex: 1, height: 1, background: c.border, alignSelf: "center" }} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 1, background: c.border, border: `1px solid ${c.border}` }}>
                {h.items.map((m) => <MilestoneCard key={m.title} m={m} />)}
              </div>
            </div>
          ))}
        </div>

        {/* 04 Time e budget */}
        <SectionTitle id="time" n="04" title="Time inicial mínimo e budget" accent={c.warn}
          sub="Time para operar o piloto. Custos em USD por mês, estimativa a validar." />
        <div style={{ border: `1px solid ${c.border}`, marginBottom: 20, overflowX: "auto" }}>
          <table className="rm-table">
            <thead>
              <tr>
                <th>Função</th>
                <th>O que faz</th>
                <th>Dedicação</th>
                <th>USD / mês</th>
              </tr>
            </thead>
            <tbody>
              {TEAM.map((r) => (
                <tr key={r.role}>
                  <td style={{ fontWeight: 700, color: c.ink, whiteSpace: "nowrap" }}>{r.role}</td>
                  <td>{r.what}</td>
                  <td style={{ color: c.inkSoft, whiteSpace: "nowrap" }}>{r.dedication}</td>
                  <td style={{ fontFamily: FONT_MONO, fontSize: 12.5, color: c.warn, whiteSpace: "nowrap" }}>{r.cost}</td>
                </tr>
              ))}
              <tr>
                <td style={{ fontWeight: 700, color: c.ink }}>Time / mês</td>
                <td colSpan={2} style={{ color: c.inkSoft }}>Soma das cinco funções</td>
                <td style={{ fontFamily: FONT_MONO, fontSize: 12.5, color: c.warn, fontWeight: 700, whiteSpace: "nowrap" }}>7.500 a 12.200</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div style={{ border: `1px solid ${c.border}`, marginBottom: 12, overflowX: "auto" }}>
          <table className="rm-table">
            <thead>
              <tr>
                <th>Outros custos</th>
                <th>USD</th>
              </tr>
            </thead>
            <tbody>
              {BUDGET_OTHER.map((b) => (
                <tr key={b.item}>
                  <td>{b.item}</td>
                  <td style={{ fontFamily: FONT_MONO, fontSize: 12.5, color: c.warn, whiteSpace: "nowrap" }}>{b.cost}</td>
                </tr>
              ))}
              <tr>
                <td style={{ fontWeight: 700, color: c.ink }}>Piloto completo, 6 meses (time + mídia + infra + custos únicos)</td>
                <td style={{ fontFamily: FONT_MONO, fontSize: 12.5, color: c.warn, fontWeight: 700, whiteSpace: "nowrap" }}>53.000 a 90.000</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p style={{ fontFamily: FONT_MONO, fontSize: 11, color: c.inkMute, lineHeight: 1.7, margin: "0 0 64px" }}>
          Comercial e marketing podem ser absorvidos pelo time atual no início. TI integral. Suporte integral só nos dias de evento.
        </p>

        {/* 05 Real vs simulated */}
        <SectionTitle id="real" n="05" title="Real x simulado" accent={c.warn} sub="O que roda de verdade e o que ainda é demonstração." />
        <div style={{ border: `1px solid ${c.border}`, marginBottom: 64, overflowX: "auto" }}>
          <table className="rm-table">
            <thead>
              <tr>
                <th>Peça</th>
                <th>Hoje</th>
                <th>Alvo</th>
              </tr>
            </thead>
            <tbody>
              {REAL_VS_SIM.map((r) => (
                <tr key={r.piece}>
                  <td style={{ fontWeight: 700, color: c.ink, whiteSpace: "nowrap" }}>{r.piece}</td>
                  <td>
                    <span style={{ display: "inline-block", width: 7, height: 7, background: r.real ? c.ok : c.warn, marginRight: 9, verticalAlign: "middle" }} />
                    <span style={{ fontFamily: FONT_MONO, fontSize: 9.5, letterSpacing: "0.1em", textTransform: "uppercase", color: r.real ? c.ok : c.warn, marginRight: 10 }}>{r.real ? "real" : "simulado"}</span>
                    {r.today}
                  </td>
                  <td style={{ color: c.inkSoft }}>{r.target}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 04 Decisions */}
        <SectionTitle id="decisoes" n="06" title="Decisões batidas" accent={c.magenta} />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 1, background: c.border, border: `1px solid ${c.border}`, marginBottom: 64 }}>
          {DECISIONS.map((d) => (
            <div key={d.n} style={{ background: c.surface, padding: "20px 22px" }}>
              <div style={{ fontFamily: FONT_MONO, fontSize: 11, color: c.magenta, letterSpacing: "0.14em", marginBottom: 10 }}>DECISÃO {d.n} · FECHADA</div>
              <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: "-0.01em", marginBottom: 8 }}>{d.title}</div>
              <p style={{ fontSize: 13.5, color: c.inkSoft, lineHeight: 1.6, margin: 0 }}>{d.body}</p>
            </div>
          ))}
        </div>

        <div style={{ fontFamily: FONT_MONO, fontSize: 11, color: c.inkMute, lineHeight: 1.7, borderTop: `1px solid ${c.border}`, paddingTop: 18 }}>
          Princípio: tudo aditivo e atrás de flag. Eventos mock seguem intactos. Migrations rodam uma vez (remote + local).
          Não flipar SITE_LIVE antes da fase 6 e do #43. Fontes: docs/roadmap-real-pipeline.md e docs/roadmap-lancamento.md.
        </div>
      </main>
    </div>
  );
}

function Timeline() {
  const N = MONTHS.length;
  const pctLeft = (i: number) => `${(i / N) * 100}%`;
  const markers = (
    <>
      <span style={{ position: "absolute", top: 0, bottom: 0, left: pctLeft(TODAY), width: 1, background: c.accent, opacity: 0.5 }} />
      <span style={{ position: "absolute", top: 0, bottom: 0, left: pctLeft(YEAR_BREAK), width: 1, background: c.borderStrong }} />
      <span style={{ position: "absolute", top: 0, bottom: 0, left: pctLeft(MVP + 1), width: 2, background: c.magenta }} />
    </>
  );
  return (
    <div style={{ border: `1px solid ${c.border}`, marginBottom: 72, overflowX: "auto" }}>
      <div style={{ minWidth: 820 }}>
        {/* month header */}
        <div className="rm-gantt-row" style={{ background: c.surface, borderBottom: `1px solid ${c.borderStrong}` }}>
          <div style={{ padding: "10px 14px", fontFamily: FONT_MONO, fontSize: 10, color: c.inkMute, letterSpacing: "0.14em", textTransform: "uppercase" }}>Etapa</div>
          <div style={{ position: "relative", display: "grid", gridTemplateColumns: `repeat(${N}, 1fr)` }}>
            {MONTHS.map((mo, i) => (
              <div key={mo} style={{ padding: "10px 6px", fontFamily: FONT_MONO, fontSize: 10.5, letterSpacing: "0.1em", textTransform: "uppercase", color: i === MVP ? c.magenta : i === TODAY ? c.accent : i > MVP ? c.inkMute : c.inkSoft, fontWeight: i === MVP || i === TODAY ? 700 : 500, borderLeft: `1px solid ${c.border}` }}>
                {mo}{i === 0 ? " 26" : i === YEAR_BREAK ? " 27" : ""}
                {i === TODAY && <span style={{ display: "block", fontSize: 9, letterSpacing: "0.14em" }}>hoje</span>}
                {i === MVP && <span style={{ display: "block", fontSize: 9, letterSpacing: "0.14em" }}>MVP</span>}
                {i === MVP + 1 && <span style={{ display: "block", fontSize: 9, letterSpacing: "0.14em" }}>pós-MVP</span>}
              </div>
            ))}
          </div>
        </div>

        {TIMELINE.map((lane) => {
          const left = remaining(lane);
          return (
            <details key={lane.title} className="rm-lane">
              <summary className="rm-gantt-row" style={{ background: c.surfaceHi, borderTop: `1px solid ${c.borderStrong}` }}>
                <div style={{ padding: "10px 14px", display: "flex", alignItems: "center", gap: 8 }}>
                  <span className="rm-caret" style={{ color: lane.accent }} />
                  <span style={{ width: 8, height: 8, background: lane.accent }} />
                  <span style={{ fontFamily: FONT_MONO, fontSize: 12, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase" }}>{lane.title}</span>
                  <span style={{ fontFamily: FONT_MONO, fontSize: 10, color: c.inkMute, marginLeft: "auto" }}>{lane.stages.length} etapas</span>
                </div>
                <div style={{ position: "relative", padding: "12px 10px", display: "flex", alignItems: "center", gap: 12 }}>
                  {markers}
                  <div style={{ flex: 1, height: 8, background: c.surface, border: `1px solid ${c.border}`, position: "relative", maxWidth: pctLeft(MVP + 1) }}>
                    <span style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${100 - left}%`, background: lane.accent }} />
                  </div>
                  <span style={{ fontFamily: FONT_MONO, fontSize: 11, color: lane.accent, fontWeight: 700, whiteSpace: "nowrap", position: "relative" }}>falta {left}% até o MVP</span>
                </div>
              </summary>
              {lane.stages.map((st) => {
                const post = st.start > MVP;
                return (
                  <details key={st.label} className="rm-stage" style={{ opacity: post ? 0.6 : 1 }}>
                    <summary className="rm-gantt-row" style={{ background: c.surface, borderTop: `1px solid ${c.border}` }}>
                      <div style={{ padding: "9px 14px 9px 24px", fontSize: 12.5, lineHeight: 1.35, color: st.pct === 100 ? c.inkSoft : c.ink, display: "flex", gap: 8, alignItems: "baseline" }}>
                        <span className="rm-caret" style={{ color: c.inkMute }} />
                        <span>{st.label}</span>
                      </div>
                      <div style={{ position: "relative", height: 36 }}>
                        {markers}
                        <div style={{
                          position: "absolute", top: 9, height: 18,
                          left: pctLeft(st.start), width: `${((st.end - st.start + 1) / N) * 100}%`,
                          background: c.surfaceHi, border: `1px solid ${post ? c.border : lane.accent}`, boxSizing: "border-box",
                        }}>
                          <span style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${st.pct}%`, background: lane.accent }} />
                          <span style={{ position: "absolute", right: 5, top: 0, bottom: 0, display: "flex", alignItems: "center", fontFamily: FONT_MONO, fontSize: 9.5, fontWeight: 700, color: st.pct === 100 ? c.bg : c.ink, letterSpacing: "0.04em" }}>
                            {st.pct === 100 ? "ok" : `${100 - st.pct}%`}
                          </span>
                        </div>
                      </div>
                    </summary>
                    <div className="rm-gantt-row" style={{ background: c.surface }}>
                      <div style={{ gridColumn: "1 / -1", padding: "2px 14px 12px 46px", fontSize: 12.5, color: c.inkSoft, lineHeight: 1.6, maxWidth: 760 }}>
                        <span style={{ fontFamily: FONT_MONO, fontSize: 10, color: lane.accent, letterSpacing: "0.1em", marginRight: 8 }}>{MONTHS[st.start]}{st.end !== st.start ? ` a ${MONTHS[st.end]}` : ""} · {st.pct}% feito</span>
                        {st.detail}
                      </div>
                    </div>
                  </details>
                );
              })}
            </details>
          );
        })}

        <div style={{ display: "flex", gap: 18, flexWrap: "wrap", padding: "10px 14px", borderTop: `1px solid ${c.borderStrong}`, background: c.surface, fontFamily: FONT_MONO, fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: c.inkMute }}>
          <span>Clique na frente ou na etapa para abrir</span>
          <span>Barra = duração</span>
          <span>Preenchido = feito</span>
          <span>Número = falta</span>
          <span style={{ color: c.magenta }}>Linha magenta = MVP</span>
        </div>
      </div>
    </div>
  );
}

function SectionTitle({ id, n, title, accent, sub }: { id: string; n: string; title: string; accent: string; sub?: string }) {
  return (
    <div style={{ marginBottom: 18, scrollMarginTop: 90 }} id={id}>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <span style={{ fontFamily: FONT_MONO, fontSize: 12, color: accent, fontWeight: 700 }}>{n}</span>
        <h2 style={{ fontSize: "clamp(22px,3vw,30px)", fontWeight: 800, letterSpacing: "-0.02em", margin: 0 }}>{title}</h2>
        <span style={{ flex: 1, height: 1, background: c.border }} />
      </div>
      {sub && <p style={{ color: c.inkSoft, fontSize: 14, lineHeight: 1.6, margin: "10px 0 0", maxWidth: 680 }}>{sub}</p>}
    </div>
  );
}

function Pill({ status }: { status: Status }) {
  const s = STATUS[status];
  return (
    <span style={{ fontFamily: FONT_MONO, fontSize: 9.5, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: s.color, border: `1px solid ${s.color}`, padding: "3px 7px", whiteSpace: "nowrap" }}>{s.label}</span>
  );
}

function PhaseCard({ p }: { p: Phase }) {
  const s = STATUS[p.status];
  const dim = p.status === "scope";
  return (
    <article className="rm-phase" style={{ background: c.surface, display: "grid", gridTemplateColumns: "72px 1fr", opacity: dim ? 0.7 : 1 }}>
      <div style={{ borderRight: `1px solid ${c.border}`, padding: "20px 0", display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
        <span style={{ fontFamily: FONT_MONO, fontSize: 20, fontWeight: 700, color: s.color, letterSpacing: "-0.02em" }}>{p.id}</span>
        <span style={{ width: 8, height: 8, background: s.color }} />
      </div>
      <div style={{ padding: "18px 22px 18px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 8 }}>
          <h3 style={{ fontSize: 18, fontWeight: 700, letterSpacing: "-0.015em", margin: 0 }}>{p.title}</h3>
          <Pill status={p.status} />
          {p.when && <span style={{ fontFamily: FONT_MONO, fontSize: 10.5, color: c.inkMute }}>{p.when}</span>}
        </div>
        <p style={{ fontSize: 14.5, color: c.inkSoft, lineHeight: 1.6, margin: 0, maxWidth: 760 }}>{p.plain}</p>
        <details className="rm-details">
          <summary>
            <span className="rm-details-label" />
            <span style={{ color: c.inkMute }}> · {p.techTitle}</span>
          </summary>
          <ul style={{ margin: "10px 0 0", padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 5 }}>
            {p.items.map((it) => (
              <li key={it} style={{ fontSize: 13, color: c.ink, lineHeight: 1.5, paddingLeft: 14, position: "relative" }}>
                <span style={{ position: "absolute", left: 0, top: 9, width: 5, height: 1, background: c.inkMute }} />
                {it}
              </li>
            ))}
          </ul>
          {p.verify && (
            <div style={{ fontFamily: FONT_MONO, fontSize: 11, color: c.accent, marginTop: 10, lineHeight: 1.6 }}>
              VERIF · {p.verify}
            </div>
          )}
        </details>
      </div>
    </article>
  );
}

function MilestoneCard({ m }: { m: Milestone }) {
  return (
    <div className="rm-milestone" style={{ background: c.surface, padding: "18px 20px", display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
        <h4 style={{ fontSize: 15.5, fontWeight: 700, letterSpacing: "-0.01em", margin: 0, lineHeight: 1.3 }}>{m.title}</h4>
        <Pill status={m.status} />
      </div>
      <p style={{ fontSize: 13.5, color: c.inkSoft, lineHeight: 1.6, margin: 0 }}>{m.body}</p>
      {m.dep && (
        <div style={{ fontFamily: FONT_MONO, fontSize: 10.5, color: c.accent, lineHeight: 1.6, borderTop: `1px solid ${c.border}`, paddingTop: 8, marginTop: 2 }}>
          PRODUTO · {m.dep}
        </div>
      )}
    </div>
  );
}

const css = `
  .rm-nav { color: ${c.inkSoft}; text-decoration: none; }
  .rm-nav:hover { color: ${c.accent}; }
  .rm-gantt-row { display: grid; grid-template-columns: 240px 1fr; }
  .rm-lane > summary, .rm-stage > summary { list-style: none; cursor: pointer; }
  .rm-lane > summary::-webkit-details-marker, .rm-stage > summary::-webkit-details-marker { display: none; }
  .rm-lane > summary:hover, .rm-stage > summary:hover { background: ${c.surfaceAlt} !important; }
  .rm-caret { font-family: ${FONT_MONO}; font-size: 11px; font-weight: 700; width: 10px; display: inline-block; }
  .rm-caret::before { content: "+"; }
  details[open] > summary .rm-caret::before { content: "-"; }
  .rm-link { color: ${c.ink}; text-decoration: underline; text-decoration-color: ${c.premium}; text-underline-offset: 3px; }
  .rm-link:hover { color: ${c.premium}; }
  .rm-phase:hover, .rm-milestone:hover { background: ${c.surfaceHi} !important; }
  .rm-details { margin-top: 12px; }
  .rm-details summary { list-style: none; cursor: pointer; font-family: ${FONT_MONO}; font-size: 10.5px; letter-spacing: 0.12em; text-transform: uppercase; color: ${c.accent}; user-select: none; display: inline-block; }
  .rm-details summary::-webkit-details-marker { display: none; }
  .rm-details summary:hover { text-decoration: underline; }
  .rm-details-label::before { content: "+ Ver detalhe técnico"; }
  .rm-details[open] .rm-details-label::before { content: "- Esconder detalhe técnico"; }
  .rm-table { width: 100%; border-collapse: collapse; font-family: ${FONT_GROTESK}; font-size: 13.5px; }
  .rm-table th { text-align: left; font-family: ${FONT_MONO}; font-size: 10.5px; letter-spacing: 0.14em; text-transform: uppercase; color: ${c.inkMute}; padding: 12px 16px; border-bottom: 1px solid ${c.borderStrong}; background: ${c.surface}; }
  .rm-table td { padding: 12px 16px; border-bottom: 1px solid ${c.border}; vertical-align: top; line-height: 1.5; background: ${c.surface}; }
  .rm-table tr:last-child td { border-bottom: none; }
  @media (max-width: 640px) {
    .rm-phase { grid-template-columns: 52px 1fr !important; }
    .rm-table td { min-width: 180px; }
  }
`;
