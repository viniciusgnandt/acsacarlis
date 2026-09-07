/**
 * Google Apps Script — Webhook de registro automático de cliques no WhatsApp
 *
 * O que faz: recebe uma chamada silenciosa (sendBeacon/fetch) disparada pelo
 * `script.js` (função reportGclidClick) no momento em que alguém clica num
 * botão de WhatsApp do site, e grava o clique numa aba separada da planilha
 * "Conversões Ads - Acsa Carlis" — SEM mexer na aba "Página1" (que é só pra
 * conversões confirmadas manualmente pela Dra., usada pelo Conversion Import
 * em scripts/google-ads-conversion-import.js).
 *
 * Por quê uma aba separada: nem todo clique vira mensagem de verdade — a
 * Página1 só deve ter linhas confirmadas. Esta aba serve de "cola" pra achar
 * o horário do clique quando a Dra. for confirmar manualmente (pareamento
 * por horário aproximado, já que o GCLID não aparece mais na mensagem).
 *
 * IMPORTANTE — doGet E doPost: `navigator.sendBeacon` (usado no site pra não
 * bloquear a navegação ao WhatsApp) sempre manda o pedido como POST, nunca
 * GET. Sem um doPost implementado, todo clique real falha silenciosamente
 * (só um teste manual via URL no navegador, que é GET, funcionaria) — foi
 * exatamente esse bug que fez os cliques de 2026-09-07 sumirem sem deixar
 * rastro. Os dois métodos chamam a mesma lógica (handleClick).
 *
 * Instalação: colado direto no Apps Script vinculado à planilha (Extensões >
 * Apps Script), implantado como Web App ("Qualquer pessoa" pode acessar,
 * executa como o dono da planilha). A URL da implantação fica hardcoded em
 * `site/assets/script.js` (GCLID_WEBHOOK_URL) — mudou a implantação, muda lá
 * também. Editar aqui é só documentação; a versão que realmente roda é a
 * colada no editor do Apps Script (projeto "Registro automatico de GCLID
 * (cliques WhatsApp)").
 */

function handleClick(e) {
    try {
        var gclid = e.parameter.gclid || '';
        var origem = e.parameter.origem || '';
        if (gclid) {
            var ss = SpreadsheetApp.getActiveSpreadsheet();
            var sheet = ss.getSheetByName('Cliques (Auto)');
            if (!sheet) {
                sheet = ss.insertSheet('Cliques (Auto)');
                sheet.appendRow(['Timestamp', 'Google Click ID', 'Origem']);
            }
            var tz = ss.getSpreadsheetTimeZone();
            var ts = Utilities.formatDate(new Date(), tz, 'yyyy-MM-dd HH:mm:ss');
            sheet.appendRow([ts, gclid, origem]);
        }
    } catch (err) {
        // silencioso — nunca deixa o webhook quebrar por erro de gravação
    }
    return ContentService.createTextOutput('ok').setMimeType(ContentService.MimeType.TEXT);
}

function doGet(e) { return handleClick(e); }
function doPost(e) { return handleClick(e); }
