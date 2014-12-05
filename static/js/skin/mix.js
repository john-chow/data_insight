define([], function() {
    // 混合option
    var mixOption = function(option, aid_option) {
        if ('xAxis' in aid_option || 'yAxis' in aid_option) {
            mixAxisOption(option, aid_option);
            delete aid_option['xAxis'];
            delete aid_option['yAxis']
        }

        if ('series' in aid_option) {
            mixSeriesOption(option, aid_option);
            delete aid_option['series']
        } 

        $.extend(true, option, aid_option);
        return option
    }


    // 融合echarts里面的轴信息
    var mixAxisOption = function(option, aid_option) {
        var mixProcess = function(key) {
            var option_axis     = option[key];
            var aid_option_axis = aid_option[key];
            var aid_option_len  = aid_option_axis.length;

            $.each(option_axis, function(i, item) {
                var idx = i;
                if (i >= aid_option_len) {
                    idx = aid_option_len - 1
                }
                $.extend(true, item, aid_option_axis[idx])
            })
        }

        if ('xAxis' in aid_option) {
            mixProcess('xAxis');
        } 
        if ('yAxis' in aid_option) {
            mixProcess('yAxis')
        }
    }

    // 融合echarts里面的系列信息
    var mixSeriesOption = function(option, aid_option) {
        if ('series' in aid_option) {
            var aid_option_series_one = aid_option['series'][0];
            if ('individual' in aid_option_series_one) {
                $.each(option.series, function(i, item) {
                    $.each(item.data, function(j, one_data) {
                        var unit = {'value': one_data};
                        $.extend(true, unit, aid_option_series_one['individual'])
                    })
                })
                delete aid_option_series_one['individual']
            }

            $.each(option.series, function(i, item) {
                $.extend(true, item, aid_option_series_one)
            })
        } 
    }

    return {
        'mix_option':   mixOption
    }
})


