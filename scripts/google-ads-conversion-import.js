/**
 * Google Ads Script — Importação de conversões offline via Google Sheets
 *
 * O que faz: lê a planilha "Conversões Ads - Acsa Carlis" e envia cada linha
 * ainda não enviada como uma conversão de clique (Conversion Import) para a
 * conta do Google Ads, usando o Google Click ID (GCLID) capturado no site.
 *
 * Cada linha da planilha representa um cliente real (contrato fechado) —
 * não um lead ou um contato. Não há valor monetário nem moeda: a própria
 * presença da linha já significa "1 conversão aconteceu".
 *
 * Instalação (feita direto na interface do Google Ads, não requer servidor):
 *   1. No Google Ads: Ferramentas e configurações > Ações em massa > Scripts.
 *   2. Clique em "+" para criar um script novo, cole este código.
 *   3. Autorize o acesso quando solicitado.
 *   4. Rode uma vez manualmente para conferir (verá o log de quantas linhas
 *      foram enviadas).
 *   5. Configure para rodar automaticamente (ex: diariamente) em
 *      "Agendamento" no próprio editor de scripts.
 *
 * Pré-requisito na conta do Ads: crie uma conversão do tipo
 * "Importar > Cliques" chamada exatamente como o valor usado na coluna
 * "Conversion Name" da planilha (ex: "Cliente Real"). Isso fica separado da
 * conversão automática "Conversation started", então nenhuma métrica
 * existente é afetada.
 */

var SPREADSHEET_URL = 'https://docs.google.com/spreadsheets/d/1x0p88V2l6dzEoV3z5M3031zpwWLK7cWplsUloxByVtg/edit';
var SHEET_NAME = 'Página1';

function main() {
    var sheet = SpreadsheetApp.openByUrl(SPREADSHEET_URL).getSheetByName(SHEET_NAME);
    var data = sheet.getDataRange().getValues();

    // Colunas esperadas (linha 1 = cabeçalho):
    // A: Google Click ID | B: Conversion Name | C: Conversion Time | D: Enviado
    var COL_GCLID = 0;
    var COL_NAME = 1;
    var COL_TIME = 2;
    var COL_ENVIADO = 3;

    // O Ads recusa (\"não foi possível decodificar o GCLID\") cliques muito
    // recentes — o próprio Google recomenda esperar pelo menos 1 dia antes de
    // importar. Confirmado na prática em 2026-09-08: de 3 linhas pendentes,
    // as 2 de clique com poucas horas falharam, só a mais antiga passou —
    // não tinha relação com o formato do GCLID, era só idade.
    var IDADE_MINIMA_MS = 24 * 60 * 60 * 1000;
    var agora = new Date();

    // Sanity check de formato — não garante que o GCLID vai ser aceito pelo Ads
    // (só o Ads sabe dizer isso, e nem devolve essa resposta na hora, ver nota
    // grande no fim do arquivo), mas pega lixo óbvio antes de gastar uma
    // tentativa de upload: GCLID de teste, célula com texto solto, etc.
    // GCLIDs reais do Google Ads são alfanuméricos (+ "-" e "_") e bem longos.
    var GCLID_FORMATO_VALIDO = /^[A-Za-z0-9_-]{20,120}$/;

    var pendentes = [];
    for (var i = 1; i < data.length; i++) {
        var row = data[i];
        var gclid = row[COL_GCLID];
        var nome = row[COL_NAME];
        var jaEnviado = row[COL_ENVIADO];
        // GCLID sozinho não basta: o webhook do site grava o clique automaticamente
        // (colunas F/G), mas a linha só vira conversão de verdade depois que a Dra.
        // confirma a conversa e preenche "Conversion Name" manualmente. Sem isso,
        // exigir só o GCLID enviaria todo clique do site como cliente real.
        // "FALHOU" e uma marcacao manual (nao usada pelo script) pra linha que
        // ja se confirmou sem jeito (ex: GCLID que nunca decodifica) - sem
        // isso o retry roda pra sempre em cima do mesmo erro permanente.
        if (!gclid || !nome || jaEnviado === true || jaEnviado === 'TRUE' || jaEnviado === 'FALHOU') continue;
        if (!GCLID_FORMATO_VALIDO.test(String(gclid).trim())) {
            Logger.log('Linha ' + (i + 1) + ': GCLID com formato inválido, pulando ("' + gclid + '").');
            continue;
        }
        var horaConversao = (row[COL_TIME] instanceof Date) ? row[COL_TIME] : new Date(row[COL_TIME]);
        if (isNaN(horaConversao.getTime()) || (agora - horaConversao) < IDADE_MINIMA_MS) continue; // ainda muito recente, tenta de novo amanhã
        pendentes.push({ linha: i + 1, row: row });
    }

    if (pendentes.length === 0) {
        Logger.log('Nenhuma conversão pendente para enviar.');
        return;
    }

    // API correta do Ads Scripts para conversões offline: bulkUploads().newCsvUpload(),
    // não "AdsApp.newClickConversion" (esse método não existe).
    var bulkUpload = AdsApp.bulkUploads().newCsvUpload([
        'Google Click ID', 'Conversion Name', 'Conversion Time'
    ]);
    bulkUpload.forOfflineConversions();

    pendentes.forEach(function (item) {
        var row = item.row;
        bulkUpload.append({
            'Google Click ID': String(row[COL_GCLID]),
            'Conversion Name': String(row[COL_NAME]),
            'Conversion Time': formatarDataHora(row[COL_TIME])
        });
    });

    try {
        bulkUpload.apply();
        // IMPORTANTE — limitação conhecida e sem solução automática: apply()
        // não devolve sucesso/falha por linha (a API do Ads Scripts não expõe
        // isso, nem por privacidade a Google Ads Query Language deixa consultar
        // resultado por GCLID depois). "Enviado = TRUE" aqui significa só "essa
        // linha foi incluída no lote enviado", não "essa conversão foi aceita".
        // Confirmado em 2026-09-09: baixando manualmente o relatório de erros
        // em Ferramentas > Conversões > Uploads, 2 das linhas já marcadas TRUE
        // tinham na real falhado ("gclid could not be decoded" e "conversion
        // can't occur before the click"). A correção real é o checkpoint
        // semanal baixar esse relatório e reverter pra FALSE quem aparecer nos
        // erros — ver SKILL.md de checkpoint-semanal-acsa-carlis.
        pendentes.forEach(function (item) {
            sheet.getRange(item.linha, COL_ENVIADO + 1).setValue(true);
        });
        Logger.log('Conversões enviadas: ' + pendentes.length + ' (TRUE = enviada no lote, não confirma aceite — ver Uploads no Ads).');
    } catch (e) {
        Logger.log('Erro no upload em lote: ' + e);
    }
}

// O Ads só aceita o offset de fuso SEM dois-pontos (ex: "-0300"), formato "Z"
// do SimpleDateFormat — não confundir com "XXX" (ISO 8601), que gera "-03:00"
// e é rejeitado pelo import ("Conversion Time inválido"). Confirmado batendo
// com a lista de formatos aceitos na documentação do Ads (2026-09-04).
function formatarDataHora(valor) {
    var data = (valor instanceof Date) ? valor : new Date(valor);
    return Utilities.formatDate(data, 'America/Sao_Paulo', "yyyy-MM-dd HH:mm:ssZ");
}
