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
        if (!gclid || !nome || jaEnviado === true || jaEnviado === 'TRUE') continue;
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
        pendentes.forEach(function (item) {
            sheet.getRange(item.linha, COL_ENVIADO + 1).setValue(true);
        });
        Logger.log('Conversões enviadas: ' + pendentes.length);
    } catch (e) {
        Logger.log('Erro no upload em lote: ' + e);
    }
}

// O Ads exige o formato "aaaa-MM-dd HH:mm:ss-03:00" (fuso de São Paulo).
function formatarDataHora(valor) {
    var data = (valor instanceof Date) ? valor : new Date(valor);
    return Utilities.formatDate(data, 'America/Sao_Paulo', "yyyy-MM-dd HH:mm:ssXXX");
}
