// Atualiza o ano no rodapé automaticamente
document.addEventListener('DOMContentLoaded', function () {
    const yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();
});

// Captura do GCLID (identificador de clique do Google Ads) para permitir,
// no futuro, importar de volta ao Ads quais cliques viraram clientes reais
// (Conversion Import). Guardado por até 90 dias, mesma janela de conversão
// usada na conta.
var GCLID_STORAGE_KEY = 'acsa_gclid';
var GCLID_MAX_AGE_MS = 90 * 24 * 60 * 60 * 1000;

function captureGclid() {
    try {
        var params = new URLSearchParams(window.location.search);
        var gclid = params.get('gclid');
        if (gclid) {
            localStorage.setItem(GCLID_STORAGE_KEY, JSON.stringify({ value: gclid, ts: Date.now() }));
            return gclid;
        }
        var stored = localStorage.getItem(GCLID_STORAGE_KEY);
        if (!stored) return null;
        var parsed = JSON.parse(stored);
        if (!parsed || !parsed.value || (Date.now() - parsed.ts) > GCLID_MAX_AGE_MS) return null;
        return parsed.value;
    } catch (e) {
        return null;
    }
}
window.acsaGetGclid = captureGclid;

// Anexa o GCLID guardado ao texto de todos os links de WhatsApp da página,
// para que a referência apareça na própria conversa e a Dra. possa registrar
// na planilha de leads.
document.addEventListener('DOMContentLoaded', function () {
    var gclid = captureGclid();
    if (!gclid) return;

    document.querySelectorAll('a[href^="https://wa.me/"]').forEach(function (link) {
        try {
            var url = new URL(link.href);
            var text = url.searchParams.get('text') || '';
            if (text.indexOf('Ref (Ads):') !== -1) return;
            text += (text ? '\n\n' : '') + 'Ref (Ads): ' + gclid;
            url.searchParams.set('text', text);
            link.href = url.toString();
        } catch (e) {
            // silencioso — não interrompe a navegação
        }
    });
});

// Tracking de conversão para Google Ads.
// Conversão "WhatsApp Empresas" (secundária, não usada para lances) — dispara
// além da conversão principal sempre que a origem do clique for da página de
// empresas (prefixo "empresas_" nos data-source usados em empresas.html).
var GADS_SEND_TO_EMPRESAS = 'AW-18169591826/YLRuCPml7uwcEJLw99dD';

function trackConversion(source) {
    try {
        if (typeof gtag === 'function' && window.__GADS_SEND_TO__) {
            gtag('event', 'conversion', {
                send_to: window.__GADS_SEND_TO__,
                event_category: 'whatsapp',
                event_label: source || 'unknown',
            });
        }
        if (typeof gtag === 'function' && source && source.indexOf('empresas_') === 0) {
            gtag('event', 'conversion', {
                send_to: GADS_SEND_TO_EMPRESAS,
                event_category: 'whatsapp_empresas',
                event_label: source,
            });
        }
        if (typeof window.dataLayer !== 'undefined') {
            window.dataLayer.push({
                event: 'whatsapp_click',
                cta_origem: source || 'unknown',
            });
        }
        registerPendingWhatsappReturn(source);
    } catch (e) {
        // silencioso — não interrompe o redirecionamento ao WhatsApp
    }
}
window.trackConversion = trackConversion;

// Sinal aproximado de que a mensagem provavelmente foi enviada no WhatsApp.
//
// Não temos como saber com certeza se o usuário digitou e enviou a mensagem
// (isso acontece fora do nosso site, dentro do app/WhatsApp Web). O que dá
// pra observar é: o usuário saiu da aba (clicou no CTA) e depois voltou a ela
// depois de um tempo mínimo — comportamento consistente com quem realmente
// abriu a conversa e mandou a mensagem, diferente de quem clicou e fechou/
// voltou instantaneamente (ex: clique acidental, ou desistiu ao ver o app não
// abrir). É uma aproximação, não uma prova — por isso o nome do evento deixa
// isso explícito ("provavel").
var WA_RETURN_STORAGE_KEY = 'acsa_wa_pending_return';
var WA_RETURN_MIN_AWAY_MS = 6 * 1000; // tempo mínimo fora da aba pra contar como "provável envio"
var WA_RETURN_MAX_WINDOW_MS = 30 * 60 * 1000; // além disso, considera clique "frio" e ignora

function registerPendingWhatsappReturn(source) {
    try {
        sessionStorage.setItem(WA_RETURN_STORAGE_KEY, JSON.stringify({
            ts: Date.now(),
            origem: source || 'unknown',
        }));
    } catch (e) {
        // localStorage/sessionStorage pode estar bloqueado (modo privado) — sem problema, só não mede esse sinal
    }
}

function checkWhatsappReturn() {
    try {
        if (document.visibilityState !== 'visible') return;
        var raw = sessionStorage.getItem(WA_RETURN_STORAGE_KEY);
        if (!raw) return;

        var pending = JSON.parse(raw);
        sessionStorage.removeItem(WA_RETURN_STORAGE_KEY); // dispara no máximo uma vez por clique

        var elapsed = Date.now() - pending.ts;
        if (elapsed < WA_RETURN_MIN_AWAY_MS || elapsed > WA_RETURN_MAX_WINDOW_MS) return;

        if (typeof window.dataLayer !== 'undefined') {
            window.dataLayer.push({
                event: 'whatsapp_retorno_provavel',
                cta_origem: pending.origem,
                tempo_fora_ms: elapsed,
            });
        }
    } catch (e) {
        // silencioso
    }
}

document.addEventListener('visibilitychange', checkWhatsappReturn);
// Cobre também o caso de foco de janela (alguns navegadores/mobile disparam
// isso em vez de visibilitychange em certas transições).
window.addEventListener('focus', checkWhatsappReturn);

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
