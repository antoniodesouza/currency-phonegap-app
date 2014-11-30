// Initialize your app
var myApp = new Framework7();

// Export selectors engine
var $$ = Dom7;

// Add view
var mainView = myApp.addView('.view-main', {
    // Because we use fixed-through navbar we can enable dynamic navbar
    dynamicNavbar: true
});

var CallbackRegistry = {};  //реестр
//var site = "http://46.8.13.124:3000/getjsonp";
var site = "http://192.168.0.89:3003";

function onSuccess(xml){
    if ("errorMessage" in xml){
        myApp.alert(xml.errorMessage, function(){
            myApp.hideIndicator();
            mainView.router.back();
        });
    } else {
        var data = [];
        xml.dts.forEach(function (dt){
            var tmpDt = [];
            tmpDt[0] = new Date(dt.year, dt.month, dt.day);
            var tmpArr = dt.array.toString().split(',');
            for (var k = 1 ; k < tmpArr.length + 1 ; k++){
                tmpDt[k] = parseFloat(tmpArr[k-1]);
            }
            data.push(tmpDt);
        });
        var lbl = [];
        xml.labels.forEach(function (lb){
            lbl.push(lb);
        });
        lbl = lbl.toString().split(',');

        var width = parseInt(screen.width)*0.9;
        var height = width/1.5
        var options = {
                width: width,
                height: height,
                ylabel: 'Russian Ruble (ք)',
                rollPeriod: 1,
                animatedZooms: true,
                labels: lbl,
                labelsKMB: true,
                isZoomedIgnoreProgrammaticZoom: true,
                fillGraph: true,
                fillAlpha: 0.06,
                legend: 'always',
                rangeSelectorHeight: 30,
                labelsDiv: document.getElementById('status'),
                labelsSeparateLines: true,
                highlightSeriesOpts: {
                    strokeWidth: 2,
                    strokeBorderWidth: 1,
                    highlightCircleSize: 3
                },
                showRangeSelector: true
        };
        myApp.hideIndicator();
        g = new Dygraph(document.getElementById("dygraph"), data, options);

        var listBlock = document.getElementById("listDygraphs");
        for (var i = 1 ; i < lbl.length ; i++){
            var list = document.createElement('li');
            var tmp =   '<label class="label-checkbox item-content">' + 
                            '<input type="checkbox" id="' + (i-1) + '" checked/>' + 
                            '<div class="item-media"><i class="icon icon-form-checkbox"></i></div>' + 
                            '<div class="item-inner">' + 
                                '<div class="item-title">' + lbl[i] + '</div>' + 
                            '</div>' + 
                        '</label>';
            list.innerHTML = tmp;
            listBlock.appendChild(list);
        }
        for (var i = 1 ; i < lbl.length ; i++){
            var str = (i-1).toString();
            document.getElementById(str).onclick = function (){
                g.setVisibility(this.id, this.checked);
            }
        }
    }
}

function onError(url) {
    myApp.hideIndicator();
    myApp.alert('Ошибка при запросе ' + url);
}

//функция для кросс-доменных запросов
function scriptRequest(url, onSuccess, onError) {
    var scriptOk = false;

    var callbackName = 'f'+String(Math.random()).slice(2);

    url += ~url.indexOf('?') ? '&' : '?';
    url += 'callback=CallbackRegistry.' + callbackName;

    CallbackRegistry[callbackName] = function(data) {
        scriptOk = true; // обработчик вызвался, указать что всё ок  
        delete CallbackRegistry[callbackName]; // можно очистить реестр
        onSuccess(data); // и вызвать onSuccess
    };

    // эта функция сработает при любом результате запроса
    // важно: при успешном результате - всегда после JSONP-обработчика 
    function checkCallback() {
        if (scriptOk) return; // сработал обработчик?
        delete CallbackRegistry[callbackName];
        onError(url);  // нет - вызвать onError
    }

    var script = document.createElement('script');

    script.onreadystatechange = function() {
        if (this.readyState == 'complete' || this.readyState == 'loaded'){
            this.onreadystatechange = null;
            setTimeout(checkCallback, 0); // Вызвать checkCallback - после скрипта
        }
    };

    script.onload = script.onerror = checkCallback;
    script.src = url;

    document.body.appendChild(script);
}

//функция проверки и подтверждения значений
function submitData(){
    myApp.showIndicator();
    var tmpstr = '';
    var list = [];
    list = document.getElementsByName("checkbox[]");
    for (var i = 0 ; i < list.length ; i++){
        if  (list[i].checked){
            tmpstr += '&checkbox[]=' + list[i].value.toString();
        }
    }
    if (tmpstr.length == 0) {
        myApp.hideIndicator();
        myApp.alert('Вы не выбрали валюту!');
    } else if (document.getElementById("dateBegin").value > document.getElementById("dateEnd").value) {
        myApp.hideIndicator();
        myApp.alert('Начальная дата позже окончательной даты');
    } else {
        mainView.router.loadPage('chart.html');
        var dateBegin = convertDate(document.getElementById("dateBegin").value.toString());
        var dateEnd = convertDate(document.getElementById("dateEnd").value.toString());
        var str = '';
        str = '?date=' + dateBegin + '+-+' + dateEnd + tmpstr;
        scriptRequest(site + '/getjsonp' + str, onSuccess, onError);
    }
    return ;
}

function getDataForPanel(){
    var str = '?checkbox[]=R01235&checkbox[]=R01239&checkbox[]=R01035&checkbox[]=R01775&checkbox[]=R01820&checkbox[]=R01375&checkbox[]=R01010&checkbox[]=R01350';
    scriptRequest(site + '/getjsonpforpanel' + str, onSuccessForPanel, onErrorForPanel);
    return ;
}

function clearData(){
    list = document.getElementsByName("checkbox[]");
    for (var i = 0 ; i < list.length ; i++){
        list[i].checked = false;
    }
    document.getElementById("dateBegin").value = '';
    document.getElementById("dateEnd").value = '';
}

// YYYY-MM-DD => DD/MM/YYYY
function convertDate(date){
    date = date.substring(8,10) + '/' + date.substring(5,7) + '/' + date.substring(0,4);
    return date;
}

function onSuccessForPanel(xml){
    var rightPanel = document.getElementById('rightPanel');
    if ("errorMessage" in xml){
        var str = 'произошла ошибка';
    } else {
        var name = xml.name;
        var value = xml.value;
        var date = xml.date;
        rightPanel.innerHTML = '<div class="content-block-title">Котировки курсов валют</div>';
        rightPanel.innerHTML += '<ul style="background: none;">';
        for (var i = 0 ; i < value.length ; i++){
            date[i] = convertDate(date[i]);
            rightPanel.innerHTML += '<li class="item-content">' +
                                        '<div class="item-inner">' +
                                            '<ul style="background: none; border: 0px"><li><div class="item-title">' + name[i] + '</div></li>' +
                                            '<li><div class="item-after"><span class="badge">' + value[i] + '</span></div>' +
                                            '<div class="item-after"><span class="badge" style="margin-top: 1px; margin-left: 5px">' + date[i] + '</span></div></li></ul>' + 
                                        '</div>' + 
                                    '</li>';
        }
        rightPanel.innerHTML += '</ul>';
    }   
}

function onErrorForPanel(url) {
    var str = 'Нет доступа к серверу';
}

getDataForPanel();