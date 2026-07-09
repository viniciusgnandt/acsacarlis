// Calculadora de Rescisão Trabalhista — estimativa simplificada, client-side.
// Regra dos 15 dias (CLT): fração de mês igual ou superior a 15 dias conta como mês integral.
document.addEventListener('DOMContentLoaded', function () {
    var form = document.getElementById('calc-form');
    if (!form) return;

    var resultBox = document.getElementById('calc-resultado');
    var resultContent = document.getElementById('calc-resultado-conteudo');
    var erroBox = document.getElementById('calc-erro');

    function diffInMonthsWithRoundingRule(start, end) {
        var months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
        var dayDiff = end.getDate() - start.getDate();
        if (dayDiff < 0) {
            var daysInPrevMonth = new Date(end.getFullYear(), end.getMonth(), 0).getDate();
            dayDiff += daysInPrevMonth;
            months -= 1;
        }
        if (dayDiff >= 15) months += 1;
        return Math.max(0, months);
    }

    function formatBRL(v) {
        return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    }

    function linha(label, valor) {
        return '<div class="flex justify-between py-2.5 border-b border-gray-100">' +
            '<span class="text-gray-700 text-sm md:text-base pr-3">' + label + '</span>' +
            '<span class="font-semibold text-gray-900 text-sm md:text-base whitespace-nowrap">' + formatBRL(valor) + '</span>' +
            '</div>';
    }

    form.addEventListener('submit', function (e) {
        e.preventDefault();

        var salario = parseFloat(document.getElementById('calc-salario').value.replace(',', '.')) || 0;
        var admissaoVal = document.getElementById('calc-admissao').value;
        var demissaoVal = document.getElementById('calc-demissao').value;
        var admissao = admissaoVal ? new Date(admissaoVal + 'T00:00:00') : null;
        var demissao = demissaoVal ? new Date(demissaoVal + 'T00:00:00') : null;
        var tipo = document.getElementById('calc-tipo').value;
        var feriasVencidas = document.getElementById('calc-ferias-vencidas').checked;
        var fgtsInformadoRaw = document.getElementById('calc-fgts').value;
        var fgtsInformado = fgtsInformadoRaw ? parseFloat(fgtsInformadoRaw.replace(',', '.')) : null;

        if (!salario || !admissao || !demissao || isNaN(admissao.getTime()) || isNaN(demissao.getTime()) || demissao <= admissao) {
            erroBox.classList.remove('hidden');
            resultBox.classList.add('hidden');
            erroBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return;
        }
        erroBox.classList.add('hidden');

        var totalMeses = diffInMonthsWithRoundingRule(admissao, demissao);
        var anosCompletos = Math.floor(totalMeses / 12);

        // Saldo de salário: dias trabalhados no mês do desligamento (mês comercial de 30 dias)
        var diaSaldo = demissao.getDate();
        var saldoSalario = (salario / 30) * diaSaldo;

        // 13º salário proporcional
        var inicioAno = (admissao.getFullYear() === demissao.getFullYear()) ? admissao : new Date(demissao.getFullYear(), 0, 1);
        var meses13 = Math.min(12, diffInMonthsWithRoundingRule(inicioAno, demissao));
        var decimoTerceiro = (salario / 12) * meses13;

        // Férias proporcionais (desde o último aniversário do período aquisitivo) + 1/3
        var aniversario = new Date(demissao.getFullYear(), admissao.getMonth(), admissao.getDate());
        if (aniversario > demissao) aniversario.setFullYear(aniversario.getFullYear() - 1);
        var mesesFerias = Math.min(12, diffInMonthsWithRoundingRule(aniversario, demissao));
        var feriasProporcionais = (salario / 12) * mesesFerias * (4 / 3);

        var feriasVencidasValor = feriasVencidas ? salario * (4 / 3) : 0;

        // Aviso prévio: 30 dias + 3 por ano completo de casa, máximo 90 dias
        var diasAviso = Math.min(90, 30 + (anosCompletos * 3));

        // FGTS: usa valor informado pelo usuário, ou estima 8% do salário por mês trabalhado
        var fgtsEstimado = (fgtsInformado !== null && !isNaN(fgtsInformado)) ? fgtsInformado : (salario * 0.08 * totalMeses);

        var itens = [];
        var total = 0;

        itens.push(['Saldo de salário (' + diaSaldo + ' dia(s))', saldoSalario]);
        total += saldoSalario;

        if (feriasVencidas) {
            itens.push(['Férias vencidas + 1/3', feriasVencidasValor]);
            total += feriasVencidasValor;
        }

        itens.push(['Férias proporcionais + 1/3 (' + mesesFerias + ' mês(es))', feriasProporcionais]);
        total += feriasProporcionais;

        if (tipo === 'sem-justa-causa' || tipo === 'rescisao-indireta') {
            itens.push(['13º salário proporcional (' + meses13 + ' mês(es))', decimoTerceiro]);
            total += decimoTerceiro;
            var avisoValor = (salario / 30) * diasAviso;
            itens.push(['Aviso prévio indenizado (' + diasAviso + ' dias)', avisoValor]);
            total += avisoValor;
            var multaValor = fgtsEstimado * 0.40;
            itens.push(['Multa de 40% do FGTS (estimada)', multaValor]);
            total += multaValor;
        } else if (tipo === 'acordo') {
            itens.push(['13º salário proporcional (' + meses13 + ' mês(es))', decimoTerceiro]);
            total += decimoTerceiro;
            var avisoAcordo = ((salario / 30) * diasAviso) / 2;
            itens.push(['Aviso prévio indenizado — metade (' + diasAviso + ' dias)', avisoAcordo]);
            total += avisoAcordo;
            var multaAcordo = fgtsEstimado * 0.20;
            itens.push(['Multa do FGTS pela metade (estimada)', multaAcordo]);
            total += multaAcordo;
        } else if (tipo === 'pedido-demissao') {
            itens.push(['13º salário proporcional (' + meses13 + ' mês(es))', decimoTerceiro]);
            total += decimoTerceiro;
        }
        // justa-causa: nenhuma verba adicional além do saldo e férias vencidas já somados acima

        var html = '';
        itens.forEach(function (item) {
            html += linha(item[0], item[1]);
        });
        html += '<div class="flex justify-between pt-4 mt-2 border-t-2 border-marsala">' +
            '<span class="font-serif text-lg font-bold text-gray-900">Total estimado</span>' +
            '<span class="font-serif text-lg font-bold text-marsala">' + formatBRL(total) + '</span>' +
            '</div>';

        resultContent.innerHTML = html;
        resultBox.classList.remove('hidden');
        resultBox.scrollIntoView({ behavior: 'smooth', block: 'start' });

        try {
            if (typeof window.dataLayer !== 'undefined') {
                window.dataLayer.push({ event: 'calculadora_usada', tipo_desligamento: tipo });
            }
        } catch (err) { /* silencioso */ }
    });
});
