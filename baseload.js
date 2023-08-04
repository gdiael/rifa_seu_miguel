$(document).ready(function() {
    $("#telefone").inputmask("(99) 99999-9999");
    $('#loader').hide();
    $('#rifa').hide();
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
    var mensagem = "Quero comprar uma rifa para ajudar Seu Miguel Rogério."; 
    var mensagemCodificada = encodeURIComponent(mensagem);

    var linkWhatsApp = "https://api.whatsapp.com/send?phone=" + numeroTelefone + "&text=" + mensagemCodificada;

    window
    .location.href = linkWhatsApp;
}

function enviarFormulario() {
    var nome = $("#nome").val();
    var telefone = $("#telefone").val();
    var numRifa = $("#numrifa").val();

    if(nome == '') {
        showPopUp('Escreva o seu nome!');
        return;
    }

    if(telefone.replace('-','').replace('(','').replace(')','').replace('_','').replace(' ','').length != 11) {
        showPopUp('Número de telefone incorreto!');
        return;
    }

    if(numRifa == '') {
        showPopUp('Escolha um número de rifa!');
        return;
    }

    var dados = {nome: nome, telefone: telefone, numero: numRifa};

    url = 'https://script.google.com/macros/s/AKfycbxXxPc_sh6yTaZlBCAPhhwPro93f6f1hGnDXsZ9GlG4_2UMcIXym_XQvSztoXXQx6jn/exec'

    startLoad();

    fetch(url, {
        method: "POST",
        redirect: "follow",
        headers: {
            "Content-Type": "text/plain;charset=utf-8"
        },
        body: JSON.stringify(dados)
    })
    .then(response => response.json())
    .then(data => {
        var divResposta = document.getElementById("rifa");
        var text = divResposta.innerHTML
        text = text.replace("[MMMMM]", nome);
        text = text.replace("[TTTTT]", telefone);
        text = text.replace("[CCCCC]", numero);
        divResposta.innerHTML = text.replace("[XXXXX]", data.code);
        stopLoad();
    })
    .catch(error => {
        console.error("Erro na solicitação:", error);
        stopLoad();
    });
}

function getNumbersInfo() {
    const appUrl = 'https://script.google.com/macros/s/AKfycbxXxPc_sh6yTaZlBCAPhhwPro93f6f1hGnDXsZ9GlG4_2UMcIXym_XQvSztoXXQx6jn/exec'
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
}

function buttonFactory(number, status) {
    var newButon = document.createElement("button");
    newButon.textContent = number;
    newButon.id = "button_" + number;
    newButon.className = status;
    if(status == 'free') {
        newButon.onclick = function() {
            let numero = $(this).text();
            $('#numrifa').val(numero);
        };
    }
    return newButon;
}

function showPopUp(msg) {
    $("#popUp").text(msg);
    $("#popUp").fadeIn();
    setTimeout(function() {
      $("#popUp").fadeOut();
    }, 1000);
}