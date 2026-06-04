# Landing de pré-cadastro — Roster oficial de fotógrafos

**Status:** anotado, não executado. Levantar quando o usuário pedir pra construir.

## Objetivo

Página teaser focada em **geração de leads de fotógrafos** pro lançamento da plataforma.

Audiência alvo: fotógrafos profissionais e semi-pro de eventos ao vivo, especialmente no México (mercado de lançamento). Copy em espanhol.

## Wireframe sugerido (a definir na hora de construir)

1. Hero teaser com copy abaixo + foto de fundo escura tipo backstage
2. Form de pré-cadastro (campos abaixo)
3. Mini explainer de 3 steps "Te credenciamos · Cubres · Recibes"
4. Tiers (Standard / Pro / VIP) com commission explicada
5. CTA único: "QUIERO ESTAR EN EL ROSTER"
6. FAQ curto (3-4 perguntas)

## Copy do hero (espanhol)

**Título:**
> CAPTURA LO QUE NADIE OLVIDA.

**Subtítulo / body:**
> Cada concierto, convención, obra y fiesta es un momento que merece quedarse. Tu cámara lo convierte en algo que se puede tocar, regalar, recordar. Nosotros ponemos la tecnología, la audiencia y el escenario. Tú pones la mirada y nosotros hacemos el resto. Bienvenido al roster oficial de FanSnap.

> _(nota: "haciemos" → "hacemos" no original. Corrigir.)_

## Campos do formulário

### Obrigatórios

| Campo | Tipo | Notas |
|---|---|---|
| Nombre completo | text | required |
| Email | email | required + validation |
| Teléfono / WhatsApp | tel | required, format MX +52 |
| Ciudad de operación | text + autocomplete | CDMX, GDL, MTY como sugestões |
| Portafolio / Instagram / Web | url | required, aceita @handle ou URL completa |

### Opcionais (recomendados — ajudam a filtrar o tier)

**Tipos de evento que cobre** (checkbox múltiple):
- Música en vivo
- Conventions
- Deportes
- Fiestas
- Teatro
- Corporativos
- Maratones

**Equipo propio** (checkbox múltiple):
- Cámara profesional
- Lentes teleobjetivos
- Flash externo
- Laptop en campo
- Drone

**Experiencia previa con grandes eventos** (radio SI / NO):
- ¿Ya cubriste algún evento Ocesa, CCXP o festival grande?
- Se SI → campo livre "¿Cuáles?" pra listar

## Onde guardar os leads

Quando construir:
- Tabela nova no D1: `photographer_applications`
  - Campos: id, nome, email, telefone, cidade, portfolio, event_types JSON, equipment JSON, has_big_event_experience, big_event_list, language, created_at, source ('landing_v1'), status enum('pending', 'invited', 'rejected', 'archived')
- Endpoint: `POST /api/photographers/apply`
- Confirmação por email via Cloudflare Email Service ("Recebemos sua aplicação...")
- Aparece no dashboard de admin em "Pending applications" (já documentado no brief do admin)

## URL sugerida

- Subpath do site principal: `/fansnap/photographers/apply` ou `/fansnap/aplica`
- OU dedicated subdomain pra campanha: `fotografos.fansnap.com.mx`

## Linguagem visual

Mesma identidade FanSnap (brutalist + festival pass + tech vibe):
- Dark mode default
- Space Grotesk + JetBrains Mono
- Corner brackets cyan
- 2px hard borders
- Section markers `01`, `02`, `03`
- CTAs purple primary

## Connections com o resto da plataforma

- Footer e seção "FOR PHOTOGRAPHERS" da home devem linkar pra essa landing
- Mensagem de submit redireciona pra um state "Recebemos sua aplicação" com código de protocolo
- Beto/equipe revisa no admin dashboard (banco de fotógrafos, queue de pending)
- Aprovação → vira `users` com role='photographer' e tier='standard' por default

## Open questions (pra quando construir)

1. Domínio próprio ou subpath?
2. Reaproveitar o mesmo header/footer do site principal ou versão minimalista da landing?
3. Adicionar logo do CCXP/Omelete pra credibilidade?
4. Form em uma página única (one-step) ou em 2-3 steps (multi-step wizard, melhor conversion)?
5. Coletar consentimento LGPD/LFPDPPP explícito?
6. Pré-popular city dropdown ou texto livre?
7. Limite de tamanho de portfólio (URL única ou múltiplas)?

---

_Anotado em 2026-06-03. Construir quando o Beto pedir._
