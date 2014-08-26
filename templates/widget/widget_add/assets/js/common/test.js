define([
    'jquery'
], function() {
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
                'name':         '日期'
                , 'calcFunc':   'none'
                , 'table':      '信用卡'
                , 'kind':       'T'
            }
            , 'operator':   'last'
            , 'value':      {'type': 'month', 'length': 20}
        }]
    };

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
})
