//====================================
//
//超簡単東京感染者グラフ
//Toshihide Iizuka
//
//2021/03/15
//
//====================================

//***[MAIN]***
var KEY_NAME = "東京都";
        
var days = new Array();

var newdays = new Array();

var newweeks = new Array();
var newweeksdays = new Array();
        
var minnewday = 999999;
var maxnewday = 0;

var cities = new Array();

var autoplay = false;
var autochangetime = 15;

var isWidget = false;

var isDark = false;

function init() {
    var params = (new URL(document.location)).searchParams;
    
    try {
        var city = removehtml(params.get("city"));
        if ( city != "" && city != null ) {
            setchangekey(city);
        }
        } catch(e) {
    }
    
    try {
        var mode = removehtml(params.get("autoplay"));
        if ( mode == "true" ) { autoplay = true; }
        } catch(e) {
    }
    try {
        var changetime = removehtml(params.get("changetime"));
        if ( changetime != "" && Number(changetime) > 0 ) { autochangetime = Number(changetime); }
        } catch(e) {
    }
    
    try {
        var darkmode = removehtml(params.get("darkmode"));
        if ( darkmode == "dark" ) {
            isDark = true;
            document.body.style.color = "white";
            document.body.style.backgroundColor = "black";
        }
    } catch(e) {
    }
    
    try {
        var widgetmode = removehtml(params.get("widgetmode"));
        if ( widgetmode == "widget" ) {
            isWidget = true;
            var form = document.getElementById("form");
            form.style.visibility = "hidden";
            form.style.height = "0px";
            var title = document.getElementById("title");
            title.style.visibility = "hidden";
            title.style.height = "0px";
        }
    } catch(e) { 
    }
    
    var startdate = "2020-01-01";
    var enddate = dateToFormatString(new Date(), "%YYYY%-%MM%-%DD%");
    
    showdateform(startdate, enddate);
    
    loaddata();
}

//Automode
function autoplaymode() {
    var index = -1;
    
    do {
        index = Math.round( Math.random()*cities.length);
    } while( cities[index] == "" || cities[index] == null );
    
    
    KEY_NAME = cities[index];
    
    setchangecity();
    
    delayedCall(autochangetime,function(){
        reloaddata();
    });
}
        
function nowmonth() {
    var date = new Date();
    
    if ( date.getDate() <= 10 ) {
        date.setMonth(date.getMonth() -1 );
    }
    
    date.setDate(1);
    
    return date;
}

function showdateform(startvalue, endvalue) {
    var start = document.getElementById("start");
    var end = document.getElementById("end");
    start.value = startvalue;
    start.min = "2020-01-01";
    start.max = endvalue;
    end.value = endvalue;
    end.min = "2020-01-01";
    end.max = endvalue;
}

function checkdaterange(date) {
    try { 
        var start = document.getElementById("start");
        var end = document.getElementById("end");

        var startdate = Date.parse(start.value);
        var enddate = Date.parse(end.value);
        var checkday = Date.parse(date);

        var flag = false;
        if ( Number(startdate) <= Number(checkday)  && Number(checkday) <= Number(enddate) ) {

            flag = true;
        } else {
            flag = false;
        }
    } catch(e) {
    }
    return flag;
}

function setchangekey(text) {
    KEY_NAME = text;
}

function changecity() {
    var cty = document.getElementById("cities");
    var index = cty.selectedIndex;
    var value = cty.options[index].value;
    var text  = cty.options[index].text;
    var MAX_CITY_COUNT = -1;
    
    KEY_NAME = text;
    
    reloaddata();
}

function setchangecity() {
    var option = document.getElementById("cities").getElementsByTagName("option");
    for( var i=0; i<option.length; i++ ) {
        try { 
            if( option[i].text == KEY_NAME ){
                option[i].selected = true;
                return;
            }
        } catch(e) {
        }
    }
}

function drawcities() {
    var cty = document.getElementById("cities");
    for ( var i=0; i<cities.length; i++ ) {
        var option = document.createElement("option");
        option.text = cities[i];
        option.value = i;
        cty.appendChild(option);
    }
    cty.disabled = false;
    
    setchangecity();
}
    
function loaddata() {
    csv_data('https://www3.nhk.or.jp/n-data/opendata/coronavirus/nhk_news_covid19_prefectures_daily_data.csv');

    function csv_data(dataPath) {
        const request = new XMLHttpRequest();
        request.addEventListener('load', (event) => {
            const response = event.target.responseText;
            var resArray = response.split("\r");
            
            for ( var i=1; i<resArray.length; i++ ) {
                var data = resArray[i].split(",");
                var day = data[0];
                var city = data[2];
                var totalday = data[4];
                var newday = data[3];
                
                if ( cities.count != MAX_CITY_COUNT  ) {
                    if ( cities.indexOf(city) == -1 && city != "" && city != null ) {
                        cities.push(city);
                    }
                }
            }

            cities.push("東京都");
            MAX_CITY_COUNT = cities.count;
            
            drawcities();
                
            for ( var i=1; i<resArray.length; i++ ) {
                try {
                    var data = resArray[i].split(",");
                    var day = data[0];
                    var city = data[2];
                    var totalday = data[4];
                    var newday = data[3];

                    if ( city.indexOf(KEY_NAME) !== -1 ) {
                        if ( checkdaterange(day) ) {
                            days.push(day);

                            newdays.push(newday);

                            if ( maxnewday < Number(newday) ) {
                                maxnewday = Number(newday);
                            }

                            if ( minnewday > Number(newday) ) {
                                minnewday = Number(newday);
                            }
                        }
                    }                
                } catch(e) {
                }                
            }
            
            var countmax = 7;
            var count = 0;
            for ( var i=0; i<days.length; i++ ) {
                if ( count == countmax || i == days.length-1 ) {
                    var day = days[i];
                    newweeksdays.push(day);
                    count = 0;
                }
                count++;
            }
            
            count = 0;
            var week = 0;
            for ( var i=0; i<newdays.length; i++ ) {
                if ( count == countmax ) {
                    newweeks.push(week);
                    
                    if ( maxnewday < Number(week) ) {
                        maxnewday = Number(week);
                    }

                    if ( minnewday > Number(week) ) {
                        minnewday = Number(week);
                    }
                    
                    week = 0;
                    count = 0;
                } else if ( i == newdays.length-1 ) {
                    var vrweek = week / count * countmax;
                    week = vrweek;
                    
                    newweeks.push(week);
                    
                    if ( maxnewday < Number(week) ) {
                        maxnewday = Number(week);
                    }

                    if ( minnewday > Number(week) ) {
                        minnewday = Number(week);
                    }
                    
                    week = 0;
                    count = 0;                    
                } else {
                    var  weekdays = newdays[i];
                    week = week + Number(weekdays);
                }
                count++;
            }
            
            drawchart(newweeksdays, newweeks);
            
            if ( autoplay == true ) {
                autoplaymode();
            }
            
        });
        request.open('GET', dataPath, true);
        request.send();
    }
}
        
function reloaddata() {
    var graph = document.getElementById("graph");
    graph.innerHTML = "<canvas id='chart'></canvas>";
    
    days = new Array();
    newdays = new Array();
    newweeks = new Array();
    newweeksdays = new Array();
    
    minnewday = 999999;
    maxnewday = 0;
    
    loaddata(); 
}

function drawchart(lbl, data) {
    var borderColor = "rgba(255,0,0,1)";
    var backgroundColor = "rgba(0,0,0,0)";
    var fontColor = "rgba(255,0,0,1)";
    
    var ctx = document.getElementById("chart");
    var myLineChart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: lbl,
        datasets: [
            {
                id: 'y1',
                label: '新規感染者数',
                data: data,
                borderColor: borderColor,
                backgroundColor: backgroundColor
            },
        ],
    },
    options: {
        title: {
            display: true,
                text: KEY_NAME + "（" + lbl[0] + "~" + lbl[lbl.length-1] + "）"
            },
            scales: {
                 yAxes: [{
                    id: 'y1',
                    position: 'left',
                    scaleLabel: {
                      display: true,
                      labelString: '新規感染者数',
                      fontColor: fontColor
                    },
                    ticks: {
                      beginAtZero: true,
                      max: maxnewday
                    }
                  }]
            },
        }
    });
}

function dateToFormatString(date, fmt, locale, pad) {
    var padding = function(n, d, p) {
        p = p || '0';
        return (p.repeat(d) + n).slice(-d);
    };
    var DEFAULT_LOCALE = 'ja-JP';
    var getDataByLocale = function(locale, obj, param) {
        var array = obj[locale] || obj[DEFAULT_LOCALE];
        return array[param];
    };
    var format = {
        'YYYY': function() { return padding(date.getFullYear(), 4, pad); },
        'YY': function() { return padding(date.getFullYear() % 100, 2, pad); },
        'MMMM': function(locale) {
            var month = {
                'ja-JP': ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
                'en-US': ['January', 'February', 'March', 'April', 'May', 'June',
                          'July', 'August', 'September', 'October', 'November', 'December'],
            };
            return getDataByLocale(locale, month, date.getMonth());
        },
        'MMM': function(locale) {
            var month = {
                'ja-JP': ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
                'en-US': ['Jan.', 'Feb.', 'Mar.', 'Apr.', 'May', 'June',
                          'July', 'Aug.', 'Sept.', 'Oct.', 'Nov.', 'Dec.'],
            };
            return getDataByLocale(locale, month, date.getMonth());
        },
        'MM': function() { return padding(date.getMonth()+1, 2, pad); },
        'M': function() { return date.getMonth()+1; },
        'DD': function() { return padding(date.getDate(), 2, pad); },
        'D': function() { return date.getDate(); },
        'HH': function() { return padding(date.getHours(), 2, pad); },
        'H': function() { return date.getHours(); },
        'hh': function() { return padding(date.getHours() % 12, 2, pad); },
        'h': function() { return date.getHours() % 12; },
        'mm': function() { return padding(date.getMinutes(), 2, pad); },
        'm': function() { return date.getMinutes(); },
        'ss': function() { return padding(date.getSeconds(), 2, pad); },
        's': function() { return date.getSeconds(); },
        'A': function() {
            return date.getHours() < 12 ? 'AM' : 'PM';
        },
        'a': function(locale) {
            var ampm = {
                'ja-JP': ['午前', '午後'],
                'en-US': ['am', 'pm'],
            };
            return getDataByLocale(locale, ampm, date.getHours() < 12 ? 0 : 1);
        },
        'W': function(locale) {
            var weekday = {
                'ja-JP': ['日曜日', '月曜日', '火曜日', '水曜日', '木曜日', '金曜日', '土曜日'],
                'en-US': ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
            };
            return getDataByLocale(locale, weekday, date.getDay());
        },
        'w': function(locale) {
            var weekday = {
                'ja-JP': ['日', '月', '火', '水', '木', '金', '土'],
                'en-US':  ['Sun', 'Mon', 'Tue', 'Wed', 'Thur', 'Fri', 'Sat'],
            };
            return getDataByLocale(locale, weekday, date.getDay());
        },
    };
    Object.keys(format).forEach(function(key) {
    })
    var re = new RegExp('%(' + fmtstr.join('|') + ')%', 'g');
    var replaceFn = function(match, fmt) {
        if(fmt === '') {
            return '%';
        }
        var func = format[fmt];
        if(func === undefined) {
            return match;
        }
        return func(locale);
    };
    return fmt.replace(re, replaceFn);
}
        
function removehtml(str) {
    return str.replace(/<("[^"]*"|'[^']*'|[^'">])*>/g,'');
}
        
function delayedCall(second, callBack){
    setTimeout(callBack, second * 1000);
}