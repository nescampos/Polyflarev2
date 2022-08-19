// Please see documentation at https://docs.microsoft.com/aspnet/core/client-side/bundling-and-minification
// for details on configuring this project to bundle and minify static web assets.

// Write your JavaScript code.

$(async function () {
    try {
        var publicKey = await sequence.getWallet();
        if (publicKey != null) {
            $('#loginMenu').css('display', 'none');
            $('#logoutMenu').css('display', 'block');
            
        }
        else {
            $('#loginMenu').css('display', 'block');
            $('#logoutMenu').css('display', 'none');
        }
    }
    catch (ex) {
        $('#loginMenu').css('display', 'block');
        $('#logoutMenu').css('display', 'none');
    }
    
})

var covalentAPI = 'covalentAPI';

var web3 = new Web3(new Web3.providers.HttpProvider("https://polygon-rpc.com"));

var pools = [];
var myPools = [];
var balances = [];

async function openSequenceWallet(){
    await sequence.getWallet().openWallet();
}


async function loginWithSequence() {
    const wallet = sequence.initWallet('polygon')
    const connectDetails = await (await wallet).connect()
    if (connectDetails.connected) {
        location.href = "/Wallet/Index";
    }
}


async function logout() {
    await sequence.getWallet().disconnect()
    location.href = "/Home/Index";
}

async function getBalances() {
    var publicKey = await sequence.getWallet().getAddress();
    const settings = {
        "async": true,
        "crossDomain": true,
        "url": "https://api.covalenthq.com/v1/137/address/" + publicKey + "/balances_v2/?key=" + covalentAPI,
        "method": "GET"
    };
    $.ajax(settings).done(function (response) {
        var klayToken = response.data.items.find(x => x.contract_ticker_symbol === 'MATIC');
        var klayBalance = web3.utils.fromWei(klayToken.balance);
        $('#klayBalanceAccount').text(klayBalance);
        var list = document.querySelector('.tokenList');
        var table = document.createElement('table');
        var thead = document.createElement('thead');
        var tbody = document.createElement('tbody');

        var theadTr = document.createElement('tr');
        var contractNameHeader = document.createElement('th');
        contractNameHeader.innerHTML = 'Token';
        theadTr.appendChild(contractNameHeader);
        var contractTickerHeader = document.createElement('th');
        contractTickerHeader.innerHTML = 'Ticker';
        theadTr.appendChild(contractTickerHeader);
        var balanceHeader = document.createElement('th');
        balanceHeader.innerHTML = 'Balance';
        theadTr.appendChild(balanceHeader);
        var usdHeader = document.createElement('th');
        usdHeader.innerHTML = 'USD';
        theadTr.appendChild(usdHeader);

        thead.appendChild(theadTr)

        table.className = 'table';
        table.appendChild(thead);
        for (j = 0; j < response.data.items.length; j++) {
            var tbodyTr = document.createElement('tr');
            var contractTd = document.createElement('td');
            var urlToken = "https://polygonscan.com/token/" + response.data.items[j].contract_address;
            contractTd.innerHTML = "<b> <a href='" + urlToken+"' target='_blank''>" + response.data.items[j].contract_name + "</a></b>";
            tbodyTr.appendChild(contractTd);
            var contractTickerTd = document.createElement('td');
            contractTickerTd.innerHTML = '<b>' + response.data.items[j].contract_ticker_symbol + '</b>';
            tbodyTr.appendChild(contractTickerTd);
            balances.push(contractTickerTd);
            var balanceTd = document.createElement('td');
            balanceTd.innerHTML = '<b>' + web3.utils.fromWei(response.data.items[j].balance) + '</b>';
            tbodyTr.appendChild(balanceTd);
            var balanceUSDTd = document.createElement('td');
            balanceUSDTd.innerHTML = '<b>' + response.data.items[j].quote + '</b>';
            tbodyTr.appendChild(balanceUSDTd);
            tbody.appendChild(tbodyTr);
        }
        table.appendChild(tbody);

        list.appendChild(table);
    });
}

function dynamicSort(property) {
    var sortOrder = 1;
    if (property[0] === "-") {
        sortOrder = -1;
        property = property.substr(1);
    }
    return function (a, b) {
        /* next line works with strings and numbers, 
         * and you may want to customize it to your needs
         */
        var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
        return result * sortOrder;
    }
}

async function getXYKPoolsByAddress(dex) {
    var publicKey = await sequence.getWallet().getAddress();
    const settings = {
        "async": true,
        "crossDomain": true,
        "url": "https://api.covalenthq.com/v1/137/xy=k/" + dex + "/pools/address/" + publicKey + "/?key=" + covalentAPI,
        "method": "GET",
        "headers": {
            "content-type": "application/json",
        },
        "processData": false
    };
    var tbody = document.getElementById('tbody_pools');

    $("#tbody_pools").empty();

    $.ajax(settings).done(function (response) {
        response.data.items.forEach(function (valor, indice, array) {
            var token_0_avai = balances.indexOf(valor.token_0.contract_name) != -1;
            var token_1_avai = balances.indexOf(valor.token_1.contract_name) != -1;
            myPools.push({
                annualized_fee: valor.annualized_fee, block_height: valor.block_height, dex_name: valor.dex_name, total_liquidity_quote: valor.total_liquidity_quote
                , token_0_contract_name: valor.token_0.contract_name, token_0_contract_ticker_symbol: valor.token_0.contract_ticker_symbol, token_0_logo_url: valor.token_0.logo_url
                , token_1_contract_name: valor.token_1.contract_name, token_1_contract_ticker_symbol: valor.token_1.contract_ticker_symbol, token_1_logo_url: valor.token_1.logo_url
                , token_0_available: token_0_avai, token_1_available: token_1_avai, exchange: valor.exchange
            });
        });
        
        renderTablemyPools();
    }).fail(function (response) {
        console.log(response);
    });
}

function getXYKPools(dex) {
    const settings = {
        "async": true,
        "crossDomain": true,
        "url": "https://api.covalenthq.com/v1/137/xy=k/" + dex + "/pools/?key=" + covalentAPI,
        "method": "GET",
        "headers": {
            "content-type": "application/json",
        },
        "processData": false
    };

    $.ajax(settings).done(function (response) {
        response.data.items.forEach(function (valor, indice, array) {
            var token_0_avai = balances.indexOf(valor.token_0.contract_name) != -1;
            var token_1_avai = balances.indexOf(valor.token_1.contract_name) != -1;
            pools.push({
                annualized_fee: valor.annualized_fee, block_height: valor.block_height, dex_name: valor.dex_name, total_liquidity_quote: valor.total_liquidity_quote
                , token_0_contract_name: valor.token_0.contract_name, token_0_contract_ticker_symbol: valor.token_0.contract_ticker_symbol, token_0_logo_url: valor.token_0.logo_url
                , token_1_contract_name: valor.token_1.contract_name, token_1_contract_ticker_symbol: valor.token_1.contract_ticker_symbol, token_1_logo_url: valor.token_1.logo_url
                , token_0_available: token_0_avai, token_1_available: token_1_avai, exchange: valor.exchange
            });
        });
        renderTable();
    }).fail(function (response) {
        console.log(response);
    });
}

function renderTablemyPools(filter_by_availability) {
    var pools_render = myPools.sort(dynamicSort('annualized_fee')).reverse();;
    if (filter_by_availability) {
        pools_render = pools_render.filter(x => x.token_0_available == true || x.token_1_available == true)
    }
    var tbody = document.getElementById('tbody_pools');

    $("#tbody_pools").empty();

    for (var i = 0; i < pools_render.length; i++) {
        var tr = "<tr>";
        var url = pools_render[i].dex_name == "quickswap" ? "https://info.quickswap.exchange/#/pair/" + pools_render[i].exchange : "https://app.sushi.com/es/analytics/pools/" + pools_render[i].exchange + "?chainId=137";
        /* Must not forget the $ sign */
        tr += "<td> <a href='" + url + "' target='_blank'>" + pools_render[i].dex_name + "</a></td>" + "<td>" + pools_render[i].token_0_contract_name + " (" + pools_render[i].token_0_contract_ticker_symbol + ")</td>" + "<td>" + pools_render[i].token_1_contract_name + " (" + pools_render[i].token_1_contract_ticker_symbol + ")</td>" + "<td>" + pools_render[i].total_liquidity_quote + "</td>" + "<td>" + pools_render[i].block_height + "</td>" + "<td>" + (pools_render[i].annualized_fee * 100).toFixed(2) + "%" + "</td></tr>";

        /* We add the table row to the table body */
        tbody.innerHTML += tr;
    }
}

function renderTable(filter_by_availability) {
    var pools_render = pools.sort(dynamicSort('annualized_fee')).reverse();;
    if (filter_by_availability) {
        pools_render = pools_render.filter(x => x.token_0_available == true || x.token_1_available == true)
    }
    var tbody = document.getElementById('tbody_pools');

    $("#tbody_pools").empty();

    for (var i = 0; i < pools_render.length; i++) {
        var tr = "<tr>";
        var url = pools_render[i].dex_name == "quickswap" ? "https://info.quickswap.exchange/#/pair/" + pools_render[i].exchange : "https://app.sushi.com/es/analytics/pools/" + pools_render[i].exchange+"?chainId=137";
        /* Must not forget the $ sign */
        tr += "<td> <a href='" + url + "' target='_blank'>" + pools_render[i].dex_name + "</a></td>" + "<td>" + pools_render[i].token_0_contract_name + " (" + pools_render[i].token_0_contract_ticker_symbol + ")</td>" + "<td>" + pools_render[i].token_1_contract_name + " (" + pools_render[i].token_1_contract_ticker_symbol + ")</td>" + "<td>" + pools_render[i].total_liquidity_quote + "</td>" + "<td>" + pools_render[i].block_height + "</td>" + "<td>" + (pools_render[i].annualized_fee * 100).toFixed(2) + "%" + "</td></tr>";

        /* We add the table row to the table body */
        tbody.innerHTML += tr;
    }
}

async function getTransactions() {
    var publicKey = await sequence.getWallet().getAddress();
    const settings = {
        "async": true,
        "crossDomain": true,
        "url": "https://api.covalenthq.com/v1/137/address/" + publicKey + "/transactions_v2/?quote-currency=USD&format=JSON&block-signed-at-asc=false&no-logs=false&page-number=0&key=" + covalentAPI,
        "method": "GET"
    };
    $.ajax(settings).done(function (response) {
        
        if (response.data.items.length == 0) {
            $('#noTransactions').css('display', 'block');
            $('#noTransactions').text('There is no transaction for this address.');
        }
        else {
            $('#noTransactions').css('display', 'none');
            var list = document.querySelector('.transactionList');
            var table = document.createElement('table');
            var thead = document.createElement('thead');
            var tbody = document.createElement('tbody');


            var theadTr = document.createElement('tr');
            var contractNameHeader = document.createElement('td');
            contractNameHeader.innerHTML = 'Trx Hash';
            theadTr.appendChild(contractNameHeader);
            var contractTickerHeader = document.createElement('td');
            contractTickerHeader.innerHTML = 'From Address';
            theadTr.appendChild(contractTickerHeader);
            var contractTickerHeader = document.createElement('td');
            contractTickerHeader.innerHTML = 'To Address';
            theadTr.appendChild(contractTickerHeader);
            var balanceHeader = document.createElement('td');
            balanceHeader.innerHTML = 'Amount (in MATIC)';
            theadTr.appendChild(balanceHeader);
            var usdHeader = document.createElement('td');
            usdHeader.innerHTML = 'USD';
            theadTr.appendChild(usdHeader);
            var usdHeader = document.createElement('td');
            usdHeader.innerHTML = 'Fees';
            theadTr.appendChild(usdHeader);

            thead.appendChild(theadTr);
            table.className = 'table';
            table.appendChild(thead);
            
            for (j = 0; j < response.data.items.length; j++) {
                var tbodyTr = document.createElement('tr');
                var contractTd = document.createElement('td');
                var url = "https://polygonscan.com/tx/" + response.data.items[j].tx_hash;
                contractTd.innerHTML = "<b><a href='" + url+"' target='_blank'>"+ response.data.items[j].tx_hash.substring(0, 10) + "...</a></b>";
                tbodyTr.appendChild(contractTd);
                var contractFromTickerTd = document.createElement('td');
                contractFromTickerTd.innerHTML = response.data.items[j].from_address != null? response.data.items[j].from_address.substring(0, 10) + "..." : "-";
                tbodyTr.appendChild(contractFromTickerTd);
                var contractTickerTd = document.createElement('td');
                contractTickerTd.innerHTML = response.data.items[j].to_address != null? response.data.items[j].to_address.substring(0, 10) + "..." : "-";
                tbodyTr.appendChild(contractTickerTd);
                var balanceTd = document.createElement('td');
                balanceTd.innerHTML = web3.utils.fromWei(response.data.items[j].value.toString());
                tbodyTr.appendChild(balanceTd);
                var balanceUSDTd = document.createElement('td');
                balanceUSDTd.innerHTML = response.data.items[j].value_quote;
                tbodyTr.appendChild(balanceUSDTd);
                var contractIdTd = document.createElement('td');
                contractIdTd.innerHTML = response.data.items[j].fees_paid != null? web3.utils.fromWei(response.data.items[j].fees_paid.toString()) : '-';
                tbodyTr.appendChild(contractIdTd);
                tbody.appendChild(tbodyTr);
            }
            table.appendChild(tbody);

            list.appendChild(table);
        }
    });
}

async function sendTransaction() {
    var recipient = $('#trx_address').val();
    if (recipient == '') {
        $('#errorTrx').css("display", "block");
        $('#errorTrx').text("Recipient is invalid");
        return;
    }
    var amount = $('#trx_amount').val();
    if (amount == '') {
        $('#errorTrx').css("display", "block");
        $('#errorTrx').text("Amount is invalid");
        return;
    }
    const wallet = sequence.getWallet()

    const transaction = {
        to: recipient,
        value: BigInt(web3.utils.toWei(amount, "ether"))
    }

    const signer = wallet.getSigner();
    try {
        const txnResponse = await signer.sendTransaction(transaction)
        console.log(txnResponse)

        // wait for the transaction to be mined
        await txnResponse.wait();
        if (txnResp.hash != null) {
            $('#errorTrx').css("display", "block");
            $('#errorTrx').text("Transaction created");
            $('#trx_address').val('');
            $('#trx_amount').val('');
        }
    }
    catch (ex) {
        $('#errorTrx').css("display", "block");
        $('#errorTrx').text("Error sending the transaction");
    }
    
}
