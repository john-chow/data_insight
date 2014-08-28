/*
 * 过滤器的功能测试脚本
 */
define('filter', ['jquery'], function($) {
    var data = {
        'graph':        'bar'
        , 'x':          [{
            'name':         '地区'
            , 'calcFunc':   'none'
            , 'table':      '信用卡'
            , 'kind':       'F'
        }]
        , 'y':          [{
            'name':         '消费交易'
            , 'calcFunc':   'sum'
            , 'table':      '信用卡'
            , 'kind':       'N'
        }]
        , 'filter':     [{
            'field':        {
                'name':         '消费交易'
                , 'calcFunc':   'none'
                , 'table':      '信用卡'
                , 'kind':       'N'
            }
            , 'operator':   '>'
            , 'value':      110
        }]
    };

    (function() {
        $.ajax('/widget/draw/', {
            type:       'POST'
            , data:     {
                'data': JSON.stringify(data)
            }
            , dataType: 'json'
            , success:  function() {
                console.log('xxxxxxxxx')
            }
            , error:    function() {
                console.log('yyyyyyyyy')
            }
        })
    })();
})


/*
 * 监控器测试脚本
 */
define('monitor', ['jquery'], function($) {
    var source = new EventSource("/monitor/sse/");
    source.onopen = function() {
        if (openCallBack)       console.log("open sse")
    };

    source.onerror = function() {
        if (failCallBack)       console.log("close sse")
    };

    source.addEventListener("myevent1", function(e) {
        if (succCallBack) {
            data = JSON.parse(e.data);
            console.log(data)
        }
    }, false);

    var data = {
        'name':         'myevent1'
        , 'field':      {
            'table':        'test'
            , 'name':       'sale'
            , 'kind':       'N'
            , 'calcFunc':   'sum'
        }
        , 'operator':       'bw'
        , 'value':          [10, '-', '']
        , 'alarm':          0
    };
    setTimeout(function xxx() {
        $.ajax('/monitor/event/create/', {
            type:               'POST'
            , dataType:         'json'
            , data:             {'data': JSON.stringify(data)}
        })
    }, 5000);

    function yyy() {
        $.ajax('/monitor/event/delete/74/', {
             type:               'POST'
             , dataType:         'json'
        })
    }
});


require([
    './monitor'
], function() {
    console.log('start test')
})

