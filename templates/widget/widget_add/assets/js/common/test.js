define([
    'jquery'
], function() {
    var data = {
        'graph':        'bar'
        , 'x':          [{
            'name':         'color'
            , 'calcFunc':   'none'
            , 'table':      'diamond'
            , 'kind':       'F'
        }]
        , 'y':          [{
            'name':         'x'
            , 'calcFunc':   'sum'
            , 'table':      'diamond'
            , 'kind':       'N'
        }]
        , 'filter':     [{
            'field':        {
                'name':         'y'
                , 'calcFunc':   'none'
                , 'table':      'diamond'
                , 'kind':       'N'
            }
            , 'operator':   'bw'
            , 'value':      [5,6]
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
