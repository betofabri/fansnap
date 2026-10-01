# FanSnap — Roadmap de lançamento (trilha de negócio)

> Escrito 01/out/2026. Anda em paralelo ao roadmap técnico
> (`docs/roadmap-real-pipeline.md`). Versão navegável em
> `betofabri.com/fansnap/roadmap` (cookie de preview).
> Alvo: **piloto num evento OCESA em janeiro de 2027**, escala na
> **CCXP MX em abril de 2027**.

Status: só a campanha de fotógrafos está em andamento (landing `/aplica` no ar).
Todo o resto pendente.

## Agora (out 2026)

| Marco | Status | Depende do produto |
|---|---|---|
| Negociação com a OCESA: % sobre vendas, exclusividade por evento, quem fatura no MX, formato do evento patrocinado | Pendente | Sistema já suporta os três modelos; só falta o número |
| Registro da marca FanSnap: IMPI (MX) + INPI (BR), domínios fansnap.com.mx e fansnap.mx | Pendente | |
| Perfis da plataforma nas redes: reservar @fansnap (IG, TikTok, X, LinkedIn), bio, identidade, primeiros posts | Pendente | |
| Campanha de recrutamento de fotógrafos: divulgar /aplica em redes, grupos de fotógrafos da CDMX, indicação. Meta sugerida: 50 cadastros até novembro | Em andamento | Landing e fila de candidaturas no admin prontas |
| Jurídico MX: escritório pra aviso de privacidade biométrico (LFPDPPP), termos de uso e contrato do fotógrafo | Pendente | Textos entram na Fase 6 |

## Pré-piloto (nov a dez 2026)

| Marco | Status | Depende do produto |
|---|---|---|
| Escolher o evento piloto da OCESA: show ou venue médio na CDMX, autorização, credenciais, contato da produção | Pendente | |
| Selecionar e credenciar 5 a 8 fotógrafos do /aplica, alta no painel, treino e teste real de upload | Pendente | Upload + marca d'água já em prod |
| Preço final por foto e pacote, IVA, empresa que fatura no MX (JV, OCESA ou CCXP), conta no meio de pagamento | Pendente | |
| Material no evento: sinalização, QR code, roteiro de ativação, canal de atendimento (WhatsApp/email) | Pendente | |
| Abrir o site ao público (flip `SITE_LIVE`) | Pendente | Fases 2b, 3, 6 e #43 |

## Piloto OCESA (jan 2027)

| Marco | Status | Depende do produto |
|---|---|---|
| Rodar o piloto: cobertura, fotos publicadas no mesmo dia, vendas e suporte ao vivo | Pendente | |
| Pagamento real ligado (cartão + OXXO) antes ou logo após o piloto; até lá, modelo patrocinado | Pendente | Gateway fora do escopo técnico atual |
| Medir e decidir: fotos subidas, buscas, conversão, ticket médio, satisfação. Go/no-go CCXP MX | Pendente | |

## Escala (CCXP MX, abr 2027)

| Marco | Status |
|---|---|
| FanSnap na CCXP MX: dezenas de fotógrafos, eventos patrocinados, comunicação integrada ao evento e ao app | Pendente |
| Plano LATAM: próximos países e verticais (maratonas, esportes) | Pendente |

## Próximos passos macro (01/out/2026)

| Técnico | Negócio | Marketing |
|---|---|---|
| Destravar fase 2b e fechar fase 3 | Fechar % e modelo com a OCESA | Reservar @fansnap nas redes e publicar identidade |
| Fase 6: consentimento + legal MX | Definir budget e time inicial mínimo | Campanha de recrutamento de fotógrafos (em andamento) |
| Fase 5: magic-link | Escolher evento piloto e data | Plano de conteúdo pré-lançamento |
| #43: Access no /admin | Registrar marca (IMPI + INPI) e domínios | Material de ativação no venue |
| Email Sending + fase 7 | Contratar jurídico MX | Anúncio do piloto com a OCESA (release, kit de imprensa) |
| | Definir preço, IVA e empresa que fatura | Comunicação pós-evento ao fã |

## Time inicial mínimo e budget (estimativa de referência, USD/mês)

Validar com RH e com os números da OCESA antes de usar fora deste doc.

| Função | O que faz | Dedicação | USD/mês |
|---|---|---|---|
| Comercial | Negociação OCESA, patrocínios, pricing, venues | Meio período | 1.500 a 2.500 |
| Suporte técnico (atendimento) | Fã por WhatsApp/email, pedidos, downloads, reembolsos | Meio período, integral em evento | 800 a 1.200 |
| Suporte a fotógrafos | Credenciamento, treino de upload, acompanhamento no evento | Meio período, integral em evento | 1.000 a 1.500 |
| Marketing | Redes, recrutamento, material no venue, imprensa | Meio período | 1.200 a 2.000 |
| TI (desenvolvimento) | Fases 2b a 7, operação do pipeline, plantão no evento | Integral | 3.000 a 5.000 |
| **Time / mês** | | | **7.500 a 12.200** |

| Outros custos | USD |
|---|---|
| Mídia paga (recrutamento + pré-lançamento) | 500 a 1.000 / mês |
| Infra Cloudflare (Workers, R2, D1, Queues, Containers) | 100 a 300 / mês |
| Jurídico MX (uma vez) | 3.000 a 6.000 |
| Marca IMPI + INPI + domínios (uma vez) | 1.000 a 2.000 |
| Material no venue do piloto (uma vez) | 500 a 1.500 |
| **Piloto completo, 6 meses** | **53.000 a 90.000** |

Comercial e marketing podem ser absorvidos pelo time atual no começo. TI é o único integral desde já.

## Timeline geral (01/out/2026)

MVP = piloto em evento OCESA, janeiro de 2027. Uma etapa por linha, com o
percentual que falta. Percentual da frente = média das etapas até o MVP.

| Frente | Etapa | Quando | Falta |
|---|---|---|---|
| Técnico (falta 77%) | Upload, marca d'água, compra e entrega | jul 26 | 0% |
| | Leitura de rostos + busca por selfie | out a nov 26 | 100% |
| | Consentimento biométrico + legal | nov a dez 26 | 100% |
| | Login, trava do admin, emails | dez 26 | 85% |
| | Abrir o site + piloto | jan 27 | 100% |
| | Pós-MVP: pagamento real (fev a mar), escala CCXP MX (abr), busca em escala + SDK (mai a jun) | | |
| Negócio (falta 100%) | Negociação com a OCESA | out a nov 26 | 100% |
| | Budget, time, marca, jurídico | out a dez 26 | 100% |
| | Evento piloto, preço, empresa que fatura | nov a dez 26 | 100% |
| | Fotógrafos credenciados | dez 26 a jan 27 | 100% |
| | Piloto OCESA | jan 27 | 100% |
| | Pós-MVP: go/no-go + patrocínios CCXP MX (fev a abr), plano LATAM (mai a jun) | | |
| Marketing (falta 90%) | Landing + recrutamento de fotógrafos | jul a dez 26 | 60% |
| | Redes + conteúdo pré-lançamento | nov a dez 26 | 100% |
| | Material no venue + anúncio do piloto | dez 26 a jan 27 | 100% |
| | Piloto OCESA | jan 27 | 100% |
| | Pós-MVP: pós-evento + campanha CCXP MX (fev a abr), lançamento LATAM (mai a jun) | | |
