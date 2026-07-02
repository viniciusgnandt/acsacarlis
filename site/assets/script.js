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

// Menu hambúrguer (mobile)
document.addEventListener('DOMContentLoaded', function () {
    var toggle = document.getElementById('menu-toggle');
    var menu = document.getElementById('mobile-menu');
    if (!toggle || !menu) return;

    var iconOpen = document.getElementById('menu-icon-open');
    var iconClose = document.getElementById('menu-icon-close');

    function setOpen(open) {
        menu.classList.toggle('hidden', !open);
        if (iconOpen) iconOpen.classList.toggle('hidden', open);
        if (iconClose) iconClose.classList.toggle('hidden', !open);
        toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    }

    toggle.addEventListener('click', function () {
        setOpen(menu.classList.contains('hidden'));
    });

    // Fecha o menu ao clicar em um link
    menu.querySelectorAll('[data-menu-link]').forEach(function (link) {
        link.addEventListener('click', function () { setOpen(false); });
    });
});

// Animação de entrada suave ao rolar.
// Os elementos só são ocultados via JS, então nada some se o script falhar
// ou se o usuário preferir movimento reduzido.
document.addEventListener('DOMContentLoaded', function () {
    var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced || !('IntersectionObserver' in window)) return;

    var els = Array.prototype.slice.call(document.querySelectorAll('[data-reveal]'));
    els.forEach(function (el) { el.classList.add('reveal-init'); });

    var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            var el = entry.target;
            io.unobserve(el);
            el.classList.add('reveal-in');
            // Remove as classes após a animação para não interferir
            // nas transições de hover dos cards.
            setTimeout(function () {
                el.classList.remove('reveal-init');
                el.classList.remove('reveal-in');
            }, 800);
        });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

    els.forEach(function (el) { io.observe(el); });
});
