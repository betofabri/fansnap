# FanSnap — Do protótipo ao pipeline real (sem gateway de pagamento)

> Plano de execução. Escrito 21/jun/2026. Excluído desta rodada: **gateway/fluxo de
> pagamento** (Stripe/MercadoPago/OXXO) e **repasse financeiro ao fotógrafo**.
> Incluído: armazenamento, upload real, processamento (marca d'água + índice
> facial), match por evento, entrega do original, auth de produto, consentimento
> biométrico, emails. Trava de segurança do `/admin` (Cloudflare Access, #43)
> segue como item separado.

---

## Princípio inegociável: não desconfigurar o que já existe

Tudo é **aditivo e atrás de flag**. O protótipo atual (demo) tem que continuar
funcionando o tempo todo:

- Eventos ganham `photo_source` (`'mock'` | `'live'`). Os 10 eventos de demo
  ficam `mock`; só eventos novos/de teste viram `live`.
- Os scripts de build (`process-photos.mjs`, `build-face-index.mjs`) e o
  `public/face-index.json` **permanecem** — são o caminho dos eventos `mock`.
- D1 só por `ALTER TABLE ADD COLUMN` (rodar **uma vez**, remote + local) e
  **usando as tabelas que já existem** (`photos`, `scans`, `scan_matches`,
  `orders`, `order_lines` — desenhadas na Fatia 2, ainda não wired).
- Não tocar: tuning facial (mirror-invariance, inputSize, threshold), `EVENTS`
  mock em `src/lib/mock.ts`, gate `SITE_LIVE` + cookie de preview.
- Cada fase fica atrás de flag até ser verificada em prod com dado de teste +
  limpeza, igual fizemos com onboarding/upload.

---

## Estado atual: real x simulado

| Peça | Hoje | Alvo |
|---|---|---|
| Upload do fotógrafo | UI simulada (timers + localStorage) | Stream real → R2 |
| Armazenamento | `public/mock/...` no build | R2 (original privado + preview) |
| Marca d'água / resize | Script no build, set fixo | Server-side, por upload |
| Índice facial | `face-index.json` estático global | Por evento, a partir dos uploads |
| Match | Client-side vs JSON estático | Client por evento (grátis) / server em escala |
| Pedido | `localStorage` (cart.ts) | `orders`/`order_lines` no D1 |
| Entrega do original | Não existe | Token + stream do R2 (sem marca) |
| Auth | Nenhuma | Magic-link fotógrafo + fã |
| Consentimento biométrico | Só checkbox no carrinho | Step versionado antes da selfie + log |

## O que já está pronto no schema (aproveitar, não recriar)

- `photos`: `r2_key`, `r2_thumb_key`, `width/height`, `taken_at` (EXIF),
  `watermarked`, `face_indexed`, `rekog_image_id`, `photographer_id`, `event_id`.
- `scans` + `scan_matches`: log de cada scan com `consent_text_id` (versionado),
  `consent_accepted_at`, `selfie_hash`, `face_vector_hash`, `match_count`.
- `orders` + `order_lines`: IVA, `business_model`, snapshot de comissão por linha,
  e `payment_rail` com **`'free_sponsored'`** → dá pra rodar o ciclo
  pedido→entrega **sem gateway** (rail grátis/patrocinado + status `paid` stub).

---

## Decisões (BATIDAS — Beto, 21/jun/2026, "vamos na sua decisão")

**1. Índice facial server-side → (A) Cloudflare Queue → Container Node.** ✅ FECHADO.
`@vladmandic/face-api` precisa de `canvas` nativo, não roda no runtime de Workers.
Upload → enfileira → um Container (Node) pega o job e roda **o mesmo código de
`build-face-index.mjs`** → grava em `photo_faces`. Reusa a lógica validada, mantém
o match client-side grátis em eventos normais, e biometria **não sai da Cloudflare**.
Descartadas: (B) AWS Rekognition (custo + biometria sai pra AWS), (C) Vectorize +
embedding (trocaria o motor facial atual, re-tuning do zero).

**2. Auth de produto → magic-link por email.** ✅ FECHADO. Passwordless, reusa
`env.EMAIL` / Cloudflare Email; sessão = JWT assinado em cookie httpOnly. Vale p/
fã e fotógrafo. (Google OAuth pro fotógrafo descartado por ora — magic-link já
cobre, menos fricção no MX.)

**3. Match em escala.** Client-side por evento (grátis) até ~1.500–2.000 fotos;
acima disso, o mesmo Container faz o match server-side (consequência da #1).

---

## Fases (ordem de execução)

### Fase 0 — Provisão + flag (fundação, 100% aditivo) — *amanhã*
- Criar bucket R2 `fansnap-photos` (`wrangler r2 bucket create`), descomentar o
  binding em `wrangler.jsonc`, rodar `cf-typegen`.
- `db/migrate-004-pipeline.sql` (run-once remote + local):
  - `ALTER TABLE events ADD COLUMN photo_source TEXT NOT NULL DEFAULT 'mock';`
  - `ALTER TABLE photos ADD COLUMN status TEXT;` (`uploading|processing|published|rejected`)
  - `ALTER TABLE photos ADD COLUMN reject_reason TEXT;`
  - `ALTER TABLE photos ADD COLUMN content_hash TEXT;` (dedupe)
  - nova `photo_faces (photo_id, face_idx, descriptor TEXT, PRIMARY KEY(photo_id, face_idx))` — descriptors 128-d por rosto.
- Layout R2: `originals/<code>/<photoId>.<ext>` (privado), `previews/<code>/<photoId>.webp` (servido por Worker).
- **Verif:** binding responde, `SELECT` em photos vazio, os 10 eventos mock intactos no site.

### Fase 1 — Upload real (mantém a UI do `UploadPanel`)
- Rotas: `POST /api/photographer/uploads/init` (cria `photos` row, devolve id) →
  `PUT /api/photographer/uploads/<id>` (stream → R2 originals) →
  `POST .../complete` (enfileira processamento).
- `UploadPanel.tsx`: trocar os timers simulados por chamadas reais **mantendo a
  validação client-side** (formato/resolução/tamanho) e o status async; o status
  agora vem de `GET /api/events/<code>/photos` (polling). localStorage vira cache.
- Atrás de `event.photo_source === 'live'`; eventos mock seguem com a simulação.
- **Verif:** subir foto real → original no R2 + `photos` row `status=processing`.

### Fase 2 — Processamento: marca d'água + índice [decisão #1]
**2a ✅ (jul/2026):** fila `fansnap-process` + Worker `fansnap-processor`
(`processor/`, deploy separado: `npx wrangler deploy -c processor/wrangler.jsonc`).
Consumer: resize 1600px + marca d'água (pill + carimbo central, PNGs pré-rendidos
compostos via Photon WASM) → `previews/<CODE>/<id>.jpg` → `status='published'`
(+ `photo_count`). PUT do upload enfileira; `POST ?reprocess=<id>` re-enfileira
travadas; painel faz polling 5s (Procesando → Publicado ao vivo). Verificado em
prod com inspeção visual do preview.
**2b ⏳ (bloqueada por ambiente):** descriptors → `photo_faces` via Queue →
**Container Node** reusando `build-face-index.mjs`. Exige **Docker Desktop**
instalado pra build da imagem (não tem na máquina hoje) e plano com Containers.
Até lá `face_indexed=0` e o match (Fase 3) só funciona pros eventos mock.
- **Verif. 2b:** `photo_faces` populado, `face_indexed=1`, rosto encontrado no
  scan de um evento live.

### Fase 3 — Match por evento (cliente)
- `GET /api/events/<code>/face-index` → `{photos:[{id, previewUrl, descriptors}]}`
  do D1 (só `live`).
- `face-recognition.ts`: `loadIndex(code, source)` — `live` busca o endpoint,
  `mock` mantém o JSON estático. **Threshold/mirror-invariance idênticos.**
- Gravar `scans` + `scan_matches` (com `consent_text_id`, `selfie_hash`).
- Escala: `> N` fotos → match server-side.
- **Verif:** scan acha fotos reais de um evento `live`; evento mock inalterado.

### Fase 4 — Entrega do original (sem pagamento, via rail `free_sponsored`)
- Checkout grava em `orders`/`order_lines` (em vez de só localStorage), com
  `payment_rail='free_sponsored'` e `status='paid'` **stub** (quando o gateway
  entrar, ele só flipa o status — nada a refazer).
- Entitlement: `GET /api/download/<token>` valida a `order_line` paga → stream do
  original do R2 (sem marca) com token expirável + contador.
- `cart.ts` (localStorage) segue como cache/fallback até a auth entrar.
- **Verif:** pedido stub → download do original funciona, preview pública
  continua com marca.

### Fase 5 — Auth de produto [decisão #2]
- `POST /api/auth/request` (envia magic-link) → `GET /api/auth/callback`
  (set cookie JWT httpOnly assinado).
- Dashboard fotógrafo: eventos via `event_photographers` do user logado; vendas
  via `order_lines` das fotos dele. Substitui `ME`/`ASSIGNED` mock (mock fica de
  fallback p/ não-logado/preview).
- Conta fã: histórico de compras + re-download (entitlements).
- Admin SSO = trava separada (#43, Cloudflare Access).

### Fase 6 — Consentimento biométrico + legal (MX)
- **Step de consentimento antes da selfie** (aviso de privacidade + checkbox
  versionado) → grava `scans.consent_text_id` / `consent_accepted_at`.
- Páginas `/privacidad`, `/terminos`, `/aviso-biometrico`; fluxo ARCO +
  "apaga meus dados" (apaga `selfie_hash`/`face_vector` + descriptors do fã).
- **Verif:** scan sem consentimento é bloqueado; registro gravado e apagável.

### Fase 7 — Emails transacionais
- Estender `src/lib/email.ts`: "tus fotos están listas" (quando publica/ dá
  match), recibo de compra com links de download. Reusa `env.EMAIL`.

### Fase 8 — Polish / dívida (paralelo, baixo risco)
- Dedupe dos dois forms de cadastro (`/fotografos#cadastro` + `/aplica`).
- Reconciliar brutalismo da SPA vs. superfícies flat das landings.
- a11y (micro-labels 9–11px, alvos de toque). Analytics de funil.

---

## Riscos / "não quebrar"

- **Maior risco:** face-api fora do Worker (Fase 2) — bater a decisão #1 **antes**
  de codar.
- **R2:** originals **nunca** públicos; previews só via Worker. Token de download
  expirável.
- **Migrations:** `ADD COLUMN` não é idempotente — rodar uma vez (remote + local),
  como o migrate-003.
- **Coexistência:** sempre testar que um evento `mock` e um `live` funcionam lado
  a lado antes de fechar a fase.

## Primeiros passos concretos (amanhã)
1. Bater decisão #1 (infra de processamento) e #2 (auth).
2. **Fase 0** inteira: bucket + binding + `migrate-004` + `photo_source`
   (aditivo, seguro, não muda nada visível).
3. Esqueleto da **Fase 1**: rotas de upload + virar 1 evento de teste pra `live`
   e subir uma foto real ponta a ponta (sem processamento ainda).
