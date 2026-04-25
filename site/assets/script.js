// Atualiza o ano no rodapé automaticamente
document.addEventListener('DOMContentLoaded', function () {
    const yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();
});

// Tracking de conversão para Google Ads (preparado para fase 2)
// Basta descomentar o trecho do gtag no index.html e configurar o conversion ID/label.
function trackConversion(source) {
    try {
        if (typeof gtag === 'function' && window.__GADS_SEND_TO__) {
            gtag('event', 'conversion', {
                send_to: window.__GADS_SEND_TO__,
                event_category: 'whatsapp',
                event_label: source || 'unknown',
            });
        }
        if (typeof window.dataLayer !== 'undefined') {
            window.dataLayer.push({
                event: 'whatsapp_click',
                source: source || 'unknown',
            });
        }
    } catch (e) {
        // silencioso — não interrompe o redirecionamento ao WhatsApp
    }
}
window.trackConversion = trackConversion;
