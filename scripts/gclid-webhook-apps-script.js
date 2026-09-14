/**
 * Google Apps Script — Webhook de registro automático de cliques no WhatsApp
 * e de leads da calculadora de rescisão
 *
 * O que faz: recebe uma chamada silenciosa (sendBeacon/fetch) disparada pelo
 * `script.js` (funções reportGclidClick e reportCalculadoraLead) e grava o
 * evento numa aba separada da planilha "Conversões Ads - Acsa Carlis" — SEM
 * mexer na aba "Página1" (que é só pra conversões confirmadas manualmente
 * pela Dra., usada pelo Conversion Import em
 * scripts/google-ads-conversion-import.js).
 *
 * Dois tipos de evento, duas abas:
 * - Clique no WhatsApp (sem parâmetro "lead"): grava em "Cliques (Auto)"
 *   como antes.
 * - Uso da calculadora (parâmetro lead=calculadora, disparado toda vez que
 *   alguém calcula a estimativa, mesmo sem preencher nome/telefone): grava
 *   em "Leads Calculadora", com o GCLID junto quando existir, pra poder
 *   cruzar com o Google Ads depois. Linhas sem nome/telefone servem só como
 *   volume de uso da ferramenta.
 *
 * Por quê aba separada: nem todo clique vira mensagem de verdade — a
 * Página1 só deve ter linhas confirmadas. As abas automáticas servem de
 * "cola" pra achar o horário do clique/lead quando a Dra. for confirmar
 * manualmente.
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
        var lead = e.parameter.lead || '';
        var ss = SpreadsheetApp.getActiveSpreadsheet();
        var tz = ss.getSpreadsheetTimeZone();
        var ts = Utilities.formatDate(new Date(), tz, 'yyyy-MM-dd HH:mm:ss');

        if (lead === 'calculadora') {
            var sheetLead = ss.getSheetByName('Leads Calculadora');
            if (!sheetLead) {
                sheetLead = ss.insertSheet('Leads Calculadora');
                sheetLead.appendRow(['Timestamp', 'Nome', 'Telefone', 'Quer ser contatado(a)', 'Salário informado', 'Tipo de desligamento', 'Total estimado', 'Canal', 'Página de origem', 'Google Click ID']);
            }
            var nome = e.parameter.nome || '';
            var telefone = e.parameter.telefone || '';
            var consentiu = (nome || telefone) ? ((e.parameter.consentiu === 'sim') ? 'Sim' : 'Não') : '';
            var salario = e.parameter.salario || '';
            var tipo = e.parameter.tipo || '';
            var totalEstimado = e.parameter.total_estimado || '';
            var canal = e.parameter.canal || '';
            var paginaOrigem = e.parameter.pagina_origem || '';
            // Grava toda vez que a calculadora é usada, com ou sem nome/telefone
            // — linhas sem contato servem só como volume de uso da ferramenta.
            sheetLead.appendRow([ts, nome, telefone, consentiu, salario, tipo, totalEstimado, canal, paginaOrigem, gclid]);
        } else if (gclid) {
            var sheet = ss.getSheetByName('Cliques (Auto)');
            if (!sheet) {
                sheet = ss.insertSheet('Cliques (Auto)');
                sheet.appendRow(['Timestamp', 'Google Click ID', 'Origem']);
            }
            var origem = e.parameter.origem || '';
            sheet.appendRow([ts, gclid, origem]);
        }
    } catch (err) {
        // silencioso — nunca deixa o webhook quebrar por erro de gravação
    }
    return ContentService.createTextOutput('ok').setMimeType(ContentService.MimeType.TEXT);
}

function doGet(e) { return handleClick(e); }
function doPost(e) { return handleClick(e); }
