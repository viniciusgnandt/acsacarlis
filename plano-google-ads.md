# Plano de Campanhas — Google Ads (Dra. Acsa Carlis)

Objetivo: gerar conversas no WhatsApp de trabalhadores com problemas trabalhistas em Mogi das Cruzes e Alto Tietê. Conversão = clique em qualquer botão de WhatsApp do site (já instrumentado via `trackConversion`).

---

## 1. Configuração de conversão (fazer ANTES de ativar a campanha)

1. No Google Ads: **Metas → Conversões → Nova ação de conversão → Site → Criar manualmente**.
   - Categoria: *Lead* (ou "Contato").
   - Nome: `Clique WhatsApp`.
   - Valor: sem valor (ou valor estimado por lead, se quiser otimizar depois).
   - Contagem: **Uma por clique** (evita contar 3 conversões se a pessoa clicar em 3 botões).
   - Janela de conversão: 30 dias.
2. Copie o **ID de conversão** (formato `AW-1234567890`) e o **rótulo** (label).
3. No servidor, edite o `.env`:
   ```
   GADS_ID=AW-1234567890
   GADS_LABEL=<label copiado>
   GADS_ENABLED=true
   ```
4. Reinicie o container (`docker compose up -d --force-recreate`). O entrypoint injeta o snippet gtag automaticamente.
5. Valide: abra o site, clique num botão de WhatsApp e confira em **Conversões → Diagnóstico** (pode levar algumas horas) ou use a extensão Google Tag Assistant.

> Importante: a conversão "clique no WhatsApp" mede intenção, não conversa iniciada. Quando houver volume, considere migrar para conversão importada (planilha de leads que viraram consulta) para o Google otimizar por qualidade.

---

## 2. Estrutura da campanha

**1 campanha de Pesquisa** (Search), sem Display, sem parceiros de pesquisa (desmarcar as duas opções na criação).

- **Nome:** `[Search] Trabalhista - Mogi e Região`
- **Localização:** Mogi das Cruzes, Suzano, Itaquaquecetuba, Poá, Ferraz de Vasconcelos, Arujá, Guararema. Opção de local: **"Presença: pessoas em ou regularmente em"** (não usar "interesse").
- **Idioma:** Português.
- **Lances:** começar com **Maximizar cliques** com limite de CPC de R$ 8–10. Após ~30 conversões (ou 4–6 semanas), trocar para **Maximizar conversões**.
- **Orçamento sugerido:** R$ 40–70/dia para começar (CPC de "advogado trabalhista" em SP costuma ficar entre R$ 4 e R$ 15). Menos que R$ 30/dia dificulta o aprendizado.
- **Programação:** 24h no início (muita busca acontece à noite, e o WhatsApp recebe a qualquer hora). Ajustar depois pelos dados.

### Grupos de anúncios (1 tema = 1 grupo)

| Grupo | Palavras-chave (correspondência de frase) |
|---|---|
| **1. Advogada trabalhista (local)** | "advogado trabalhista mogi das cruzes", "advogada trabalhista mogi das cruzes", "advogado trabalhista suzano", "advogado trabalhista itaquaquecetuba", "advogado trabalhista perto de mim", "advogado direito do trabalho mogi" |
| **2. Demissão / verbas rescisórias** | "fui demitido e não recebi", "empresa não pagou minha rescisão", "não recebi verbas rescisórias", "empresa não pagou fgts", "demitido sem justa causa direitos", "advogado para rescisão trabalhista" |
| **3. Horas extras** | "horas extras não pagas", "advogado horas extras", "como cobrar horas extras da empresa", "empresa não paga hora extra" |
| **4. Assédio moral** | "assédio moral no trabalho o que fazer", "advogado assédio moral", "indenização assédio moral trabalho", "assédio no trabalho denunciar" |
| **5. Sem registro / PJ** | "trabalhei sem carteira assinada direitos", "advogado reconhecimento de vínculo", "pj tem direitos trabalhistas", "trabalho sem registro processo" |
| **6. Rescisão indireta** | "rescisão indireta como funciona", "pedir demissão e receber direitos", "advogado rescisão indireta" |
| **7. Acidente de trabalho** | "advogado acidente de trabalho", "acidente de trabalho direitos", "demitido depois de acidente de trabalho", "doença ocupacional direitos" |

Dica: comece com correspondência de **frase** ("..."). Depois de 2–3 semanas, analise o relatório de **termos de pesquisa** e promova os termos bons para exata e negatize o lixo.

### Palavras-chave negativas (lista da campanha)

```
vaga, vagas, emprego, currículo, concurso, curso, cursos, faculdade, ead,
estágio em advocacia, salário advogado, quanto ganha, tabela, calculadora,
simulador, cálculo rescisão online, gov.br, dataprev, meu inss, caixa,
consultar fgts, extrato fgts, sindicato, defensoria pública, gratuito,
justiça gratuita, clt planalto, lei, artigo, jurisprudência, modelo de,
petição, para empresas, advogado empresarial, defesa da empresa, reclamada
```

(Ajustar "gratuito" se notar que bloqueia buscas boas — o intuito é filtrar quem procura serviço 100% gratuito/defensoria.)

---

## 3. Anúncios (RSA — 1 por grupo)

Regras: títulos até 30 caracteres, descrições até 90. Fixar o título 1 com o tema do grupo quando fizer sentido. URL final: `https://www.acsacarlis.adv.br/` (grupos 2–7 podem usar âncoras: `/#situacoes`, `/#servicos`).

**Títulos (misturar por grupo, 8–12 por anúncio):**
- Advogada Trabalhista em Mogi
- Dra. Acsa Carlis OAB 436.184
- Defesa Só de Trabalhadores
- Fale Agora pelo WhatsApp
- Análise do Caso Sem Custo
- Atendimento Online e Local
- Foi Demitido? Saiba o Que Fazer
- Horas Extras Não Pagas?
- Empresa Não Pagou a Rescisão?
- Assédio Moral no Trabalho?
- Trabalhou Sem Registro?
- Acidente de Trabalho?
- Você Tem Até 2 Anos Para Agir
- Resposta no Mesmo Dia

**Descrições (4 por anúncio, adaptar 1–2 ao tema do grupo):**
- Advogada trabalhista em Mogi das Cruzes e região. Atendimento direto pelo WhatsApp.
- Entenda seus direitos em linguagem simples, sem burocracia. Fale com a Dra. Acsa.
- Atuação exclusiva na defesa do trabalhador. Atendimento humanizado e sigiloso.
- Na maioria dos casos, honorários só sobre o que você receber. Consulte como funciona.
- FGTS, aviso prévio, 13º, férias e multa de 40%. Verifique o que a empresa deve a você.
- Horas extras, adicional noturno e intervalos dos últimos 5 anos podem ser cobrados.

**Extensões (recursos):**
- **Sitelinks:** Meu caso é esse? (`/#situacoes`) · Como funciona (`/#como-funciona`) · Quem é a Dra. Acsa (`/#sobre`) · Dúvidas frequentes (`/#faq`)
- **Frases de destaque (callouts):** OAB/SP 436.184 · Atendimento por WhatsApp · Sigilo profissional · Online e presencial · Resposta no mesmo dia
- **Snippets estruturados** (tipo "Serviços"): Verbas rescisórias, Horas extras, Assédio moral, Rescisão indireta, Acidente de trabalho, Vínculo empregatício
- **Chamada (telefone):** +55 11 94507-1408
- **Local:** vincular ao Perfil da Empresa no Google (criar um, se ainda não existir — também ajuda muito no orgânico local).

---

## 4. Conformidade OAB (Provimento 205/2021)

Anúncio pago é permitido, mas o conteúdo precisa ser sóbrio e informativo:
- ❌ Não prometer resultado ("garanta sua indenização", "você vai receber R$ X").
- ❌ Não usar "ganhe", "garantido", valores de causas ou % de êxito.
- ⚠️ "Consulta/análise gratuita" é zona cinzenta (pode ser lido como captação de clientela) — no anúncio, preferir "análise do caso sem custo" ou omitir; no site já existe, avalie com calma.
- ✅ Informar áreas de atuação, OAB, formas de contato — tudo ok.

---

## 5. Rotina pós-lançamento

| Quando | O quê |
|---|---|
| Dia 1–3 | Conferir se conversões estão registrando; conferir termos de pesquisa e negativar lixo. |
| Semanal | Relatório de termos de pesquisa → negativas + promoção a exata. Pausar anúncio/keyword sem clique. |
| ~30 dias / 30 conversões | Migrar lance para Maximizar conversões. Ajustar orçamento pro que converte. |
| Contínuo | Anotar no WhatsApp de onde veio cada lead e se virou cliente → alimenta decisões de orçamento. |
