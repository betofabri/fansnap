# FanSnap — Do protótipo ao pipeline real (sem gateway de pagamento)

> Plano de execução. Escrito 21/jun/2026, **atualizado 01/out/2026** com o estado
> real de prod. Versão navegável: `betofabri.com/fansnap/roadmap` (cookie de preview).
> Excluído desta rodada: **gateway/fluxo de pagamento** (Stripe/MercadoPago/OXXO)
> e **repasse financeiro ao fotógrafo**. Trava de segurança do `/admin`
> (Cloudflare Access, #43) segue como item separado.

---

## Resumo em uma linha

Fases 0, 1, 2a e 4 **concluídas e verificadas em prod**. Fase 7 parcial (recibo
pronto, envio depende do domínio). Fases 2b, 3, 5, 6 e 8 **pendentes**. O bloqueio
crítico é a 2b (índice facial de eventos live), que trava a 3.

| Fase | Escopo | Status |
|---|---|---|
| 0 | R2 + `photo_source` + migrate-004 | Concluída (jul/2026) |
| 1 | Upload real para R2 (eventos `live`) | Concluída (jul/2026) |
| 2a | Fila + Worker processador: resize + marca d'água | Concluída (jul/2026), marca v3 com nível por evento |
| 2b | Índice facial por upload (Container Node) | **Bloqueada**: Docker Desktop + plano Containers |
| 3 | Match por evento live + log de `scans` | Pendente (depende da 2b) |
| 4 | Pedido no D1 + entrega do original sem gateway | Concluída (jul/2026), links assinados 24h |
| 5 | Auth magic-link (fã + fotógrafo) | Pendente |
| 6 | Consentimento biométrico + páginas legais MX | Pendente, **obrigatória antes de abrir o site** |
| 7 | Emails transacionais | Parcial: recibo pronto; "fotos listas" pendente; envio real depende do Email Sending em betofabri.com |
| 8 | Polish e dívida | Pendente |
| #43 | Cloudflare Access no `/admin` | Pendente |

---

## Princípio inegociável: não desconfigurar o que já existe

Tudo é **aditivo e atrás de flag**. O protótipo atual (demo) tem que continuar
funcionando o tempo todo:

- Eventos têm `photo_source` (`'mock'` | `'live'`). Os 10 eventos de demo são
  `mock`; só eventos novos/de teste são `live`.
- Os scripts de build (`process-photos.mjs`, `build-face-index.mjs`) e o
  `public/face-index.json` **permanecem**: são o caminho dos eventos `mock`.
- D1 só por `ALTER TABLE ADD COLUMN` (rodar **uma vez**, remote + local).
  Migrations aplicadas até agora: 002, 003, 004, 005, 006, 007.
- Não tocar: tuning facial (mirror-invariance, inputSize, threshold), `EVENTS`
  mock em `src/lib/mock.ts`, gate `SITE_LIVE` + cookie de preview.
- Cada fase fica atrás de flag até ser verificada em prod com dado de teste +
  limpeza.

---

## Estado atual: real x simulado (01/out/2026)

| Peça | Hoje | Alvo |
|---|---|---|
| Upload do fotógrafo | **Real** (stream → R2 `originals/<code>/<id>`) quando `photo_source='live'`; mock mantém simulação | Igual |
| Armazenamento | **R2** `fansnap-photos`: originals privados, previews via Worker | Igual |
| Marca d'água / resize | **Real**, server-side por upload no `fansnap-processor`, chave de preview versionada (`wm-v3`), nível por evento | Igual |
| Índice facial | `face-index.json` estático só para mock; eventos live com `face_indexed=0` | Por evento, a partir dos uploads (Fase 2b) |
| Match | Client-side vs JSON estático (só mock) | Client por evento (Fase 3) / server em escala |
| Pedido | **Real**: `orders`/`order_lines` no D1, rail `free_sponsored`, status `paid` stub; localStorage só fallback de demo | Gateway só flipa o status |
| Entrega do original | **Real**: link assinado HMAC (24h), original limpo byte-idêntico, recuperação em `/pedidos` por código + email | Igual |
| Auth | Nenhuma (id do pedido é a capability; admin sem trava) | Magic-link fotógrafo + fã (Fase 5) + Access no admin (#43) |
| Consentimento biométrico | Só checkbox no carrinho | Step versionado antes da selfie + log (Fase 6) |
| Emails | Template de recibo com thumbs marcadas, via `env.EMAIL`; envio só funciona com domínio onboarded | "Fotos listas" + confirmação de envio (Fase 7) |
| `/api/scan` | Ainda o stub da Fatia 1 (devolve mock) | Substituir ou remover na Fase 3 |

---

## Decisões (BATIDAS — Beto, 21/jun/2026, "vamos na sua decisão")

**1. Índice facial server-side → (A) Cloudflare Queue → Container Node.** FECHADO.
`@vladmandic/face-api` precisa de `canvas` nativo, não roda no runtime de Workers.
Upload → enfileira → um Container (Node) pega o job e roda **o mesmo código de
`build-face-index.mjs`** → grava em `photo_faces`. Reusa a lógica validada, mantém
o match client-side grátis em eventos normais, e biometria **não sai da Cloudflare**.
Descartadas: (B) AWS Rekognition (custo + biometria sai pra AWS), (C) Vectorize +
embedding (trocaria o motor facial atual, re-tuning do zero).

**2. Auth de produto → magic-link por email.** FECHADO. Passwordless, reusa
`env.EMAIL` / Cloudflare Email; sessão = JWT assinado em cookie httpOnly. Vale p/
fã e fotógrafo. (Google OAuth pro fotógrafo descartado por ora.)

**3. Match em escala.** Client-side por evento (grátis) até ~1.500–2.000 fotos;
acima disso, o mesmo Container faz o match server-side (consequência da #1).

**4. Entrega sem gateway → rail `free_sponsored` + status `paid` stub.** FECHADO e
executado na Fase 4. Quando o gateway entrar, ele só muda como o status flipa.

---

## Fases

### Fase 0 — Provisão + flag — CONCLUÍDA (jul/2026)
Bucket R2 `fansnap-photos`, binding `PHOTOS`, `migrate-004` (`photo_source`,
`photos.status`, `reject_reason`, `content_hash`, tabela `photo_faces`).
Layout R2: `originals/<code>/<id>.<ext>` (privado), `previews/<code>/<id>.jpg`.

### Fase 1 — Upload real — CONCLUÍDA (jul/2026)
`POST /api/photographer/uploads` (init) → `PUT` (stream → R2) → complete
(enfileira). `UploadPanel` com validação client-side mantida e polling de status.
Atrás de `event.photo_source === 'live'`.

### Fase 2 — Processamento
**2a — CONCLUÍDA (jul/2026).** Fila `fansnap-process` + Worker `fansnap-processor`
(`processor/`, deploy separado: `npx wrangler deploy -c processor/wrangler.jsonc`).
Resize 1600px + marca d'água v3 (lattice diagonal proprietário, três intensidades
`suave|media|forte` escolhidas por `events.watermark_level`, migrate-007) →
`previews/<CODE>/<id>.jpg` → `status='published'`. `POST ?reprocess=<id>`
re-enfileira. Verificado em prod com inspeção visual.

**2b — BLOQUEADA.** Descriptors → `photo_faces` via Queue → **Container Node**
reusando `build-face-index.mjs`. Exige **Docker Desktop** na máquina (build da
imagem) e plano Cloudflare com Containers. Até lá `face_indexed=0` e o match só
funciona pros eventos mock.
- Destravar: instalar Docker Desktop, confirmar plano, criar `containers/face-index/`
  com Dockerfile Node + tfjs-node + canvas, consumer da fila gravando em `photo_faces`.
- Verif.: `photo_faces` populado, `face_indexed=1`, rosto encontrado no scan de
  um evento live.

### Fase 3 — Match por evento (cliente) — PENDENTE
- `GET /api/events/<code>/face-index` → `{photos:[{id, previewUrl, descriptors}]}`
  do D1 (só `live`).
- `face-recognition.ts`: `loadIndex(code, source)`: `live` busca o endpoint,
  `mock` mantém o JSON estático. **Threshold/mirror-invariance idênticos.**
- Gravar `scans` + `scan_matches` (com `consent_text_id`, `selfie_hash`).
- Aposentar ou reescrever o stub `/api/scan`.
- Escala: `> N` fotos → match server-side.
- Verif.: scan acha fotos reais de um evento `live`; evento mock inalterado.

### Fase 4 — Entrega do original — CONCLUÍDA (jul/2026)
`POST /api/orders` grava `orders`/`order_lines` (rail `free_sponsored`, `paid`
stub), código curto `FS-XXXXXX` + email para lookup (migrate-006). `GET
/api/download?order&line&exp&sig` valida HMAC (`DOWNLOAD_KEY`, 24h) e streama o
original limpo; link vencido → `/pedidos?expired=1` reemite. `GET
/api/photos/preview?id` serve a preview marcada. E2E verificado em prod
(original byte-idêntico, tampering rejeitado, lookup por código + email).

### Fase 5 — Auth de produto — PENDENTE
- `POST /api/auth/request` (magic-link) → `GET /api/auth/callback` (cookie JWT
  httpOnly assinado).
- Dashboard fotógrafo: eventos via `event_photographers` do user logado; vendas
  via `order_lines` das fotos dele. Substitui `ME`/`ASSIGNED` mock.
- Conta fã: histórico de compras + re-download.
- Admin SSO = trava separada (#43, Cloudflare Access).

### Fase 6 — Consentimento biométrico + legal (MX) — PENDENTE, pré-requisito de lançamento
- Step de consentimento antes da selfie (aviso de privacidade + checkbox
  versionado) → grava `scans.consent_text_id` / `consent_accepted_at`.
- Páginas `/privacidad`, `/terminos`, `/aviso-biometrico`; fluxo ARCO +
  "apaga meus dados".
- Verif.: scan sem consentimento é bloqueado; registro gravado e apagável.

### Fase 7 — Emails transacionais — PARCIAL
- Feito: `orderReceiptEmail` com thumbs marcadas e links assinados.
- Pendente: "tus fotos están listas" (ao publicar / dar match); confirmar
  `wrangler email sending enable betofabri.com` + DNS, hoje o envio falha
  silenciosamente.

### Fase 8 — Polish / dívida — PENDENTE
- Dedupe dos dois forms de cadastro (`/fotografos#cadastro` + `/aplica`).
- Reconciliar brutalismo da SPA vs. superfícies flat das landings.
- a11y (micro-labels 9–11px, alvos de toque). Analytics de funil.
- Dashboard do fotógrafo ainda com dados mock de eventos atribuídos.

---

## Riscos / "não quebrar"

- **R2:** originals **nunca** públicos; previews só via Worker. Token de download
  expirável (feito).
- **Migrations:** `ADD COLUMN` não é idempotente, rodar uma vez (remote + local).
- **Coexistência:** sempre testar que um evento `mock` e um `live` funcionam lado
  a lado antes de fechar a fase.
- **Lançamento:** não flipar `SITE_LIVE` antes da Fase 6 e do #43.

## Próximos passos (ordem de alavancagem)
1. Destravar **Fase 2b** (Docker Desktop + plano Containers) e fechar a **Fase 3**.
2. **Fase 6** (consentimento + legal), pré-requisito de abrir o site no MX.
3. **Fase 5** (magic-link) e dashboard do fotógrafo em dado real.
4. **#43** Cloudflare Access no `/admin`.
5. Confirmar Email Sending no domínio e completar a **Fase 7**.
