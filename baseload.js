const appUrl = 'https://script.google.com/macros/s/AKfycbwm6FbHxj-8uSZ9ATEIzC6iDPz0sc2uZbRSJBW0B2_x_o-ARbVqWVNg_t_4BboZRg6L/exec'

var selectedNumbers = [];

$(document).ready(function() {
    $("#telefone").inputmask("(99) 99999-9999");
    $('#loader').hide();
    $('#rifa').hide();
    $('#tabela').hide();
    $('#numrifa').prop("disabled", true);
    getNumbersInfo();
});

function stopLoad() {
    $('#rifa').show();
    $('#loader').hide();
}

function startLoad() {
    $('#info').hide();
    $('#loader').show();
}

function btZapClick() {
    var numeroTelefone = "5584988054083";
    var mensagemCodificada = encodeURIComponent(whatsappMsg());

    var linkWhatsApp = "https://api.whatsapp.com/send?phone=" + numeroTelefone + "&text=" + mensagemCodificada;

    window
    .location.href = linkWhatsApp;
}

function whatsappMsg() {
    let txt = 'Rifa seu Miguel Rogério.\n';
    txt += $('#rifaCompra').text() + '\n';
    txt +=  $('#rifasQuanti').text() + '\n';
    txt +=  $('#rifasNumeros').text() + '\n';
    txt +=  $('#rifasComprov').text();
    return txt;
}

function btPixClick() {
    navigator.clipboard.writeText('07100849438')
    .then(() => {
        showPopUp('Pix copiado!')
    })
    .catch(err => {
        console.error("Erro ao copiar o texto:", err);
    });
}

function enviarFormulario() {
    var nome = $("#nome").val();
    var telefone = $("#telefone").val();

    if(nome == '') {
        showPopUp('Escreva o seu nome!');
        return;
    }

    nome = nome.toUpperCase();

    if(telefone.replace('-','').replace('(','').replace(')','').replace('_','').replace(' ','').length != 11) {
        showPopUp('Número de telefone incorreto!');
        return;
    }

    if(selectedNumbers.length < 1) {
        showPopUp('Escolha pelo menos um número de rifa!');
        return;
    }

    var dados = [];

    selectedNumbers.forEach(obj => dados.push({nome: nome, telefone: telefone, numero: obj}));

    startLoad();

    fetch(appUrl, {
        method: "POST",
        redirect: "follow",
        headers: {
            "Content-Type": "text/plain;charset=utf-8"
        },
        body: JSON.stringify(dados)
    })
    .then(response => response.json())
    .then(data => {
        replaceKey('rifaCompra', '[MMMMM]', nome);
        replaceKey('rifaCompra', '[TTTTT]', telefone);
        replaceKey('rifasQuanti', '[QQQQQ]', selectedNumbers.length);
        let rifaNumbersTxt = ((selectedNumbers.length > 1) ? 'Rifas Nº: ' : 'Rifa Nº: ') + selectedNumbers.join(', ') + '.';
        replaceKey('rifasNumeros', '[CCCCC]', rifaNumbersTxt);
        let rifaCodes = ((selectedNumbers.length > 1) ? 'Códigos: ' : 'Código: ') +  data.codes.join(', ') + '.';
        replaceKey('rifasComprov', '[XXXXX]', rifaCodes);

        stopLoad();
    })
    .catch(error => {
        console.error("Erro na solicitação:", error);
        stopLoad();
    });
}

function replaceKey(elementId, key, txt) {
    let elem = $('#' + elementId);
    let newTxt = elem.text().replace(key, txt);
    elem.text(newTxt);
}

function getNumbersInfo() {
    fetch(appUrl)
        .then(response => response.json())
        .then(data => {
            updateTable(data);
        })
        .catch(error => {
            console.error("Ocorreu um erro na requisição:", error);
            updateTable([]);
        });
}

function updateTable(jsonData) {
    $('#loaderTbl').hide();
    tabela = document.getElementById("tabela");
    for (var i = 1; i < 501; i++) {
        var status = 'free';
        jsonData.forEach(obj => {
            if(obj.number === i) {
                status = obj.status;
            }
        });
        tabela.appendChild(buttonFactory(i, status));
    }
    $('#tabela').show();
}

function buttonFactory(number, status) {
    var newButon = document.createElement("button");
    newButon.textContent = number;
    newButon.id = "button_" + number;
    newButon.className = status;
    if(status == 'free') {
        newButon.onclick = function() {
            let numero = $(this).text();
            let ind = selectedNumbers.indexOf(numero);
            if(ind == -1) {
                if(selectedNumbers.length < 10) {
                    selectedNumbers.push(numero);
                    newButon.className = 'btnSel';    
                }
            } else {
                selectedNumbers.splice(ind, 1);
                newButon.className = 'free';
            }
            $('#numrifa').text(selectedNumbers.join(', ') + '.');
        };
    }
    return newButon;
}

function showPopUp(msg) {
    $("#popUp").text(msg);
    $("#popUp").fadeIn();
    setTimeout(function() {
      $("#popUp").fadeOut();
    }, 1500);
}