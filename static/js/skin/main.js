// 消息通道
$msg_pipe = $('body');


////////////////////////////////////////
//
// 展示区域
//
///////////////////////////////////////

define('show', [
    'common/drawer'
    , 'common/tool'
    , 'skin/mix'
], function(DrawManager) {
    var ShowClass = function() {
        this.$show = $("#show_area");
        this.$choose = $("#all_widgets");

        this.$choose.on("change", $.proxy(this.onWidgetChanged, this))
        $msg_pipe.on("test:skin", $.proxy(this.onGetSkin, this))
    }

    ShowClass.prototype.onWidgetChanged = function(e) {
        var self = this;
        var pk = e.target.value;
        $.ajax("/widget/show/" + pk + "/", {
            type:   "GET"
            , dataType:     "json"
            , success:      self.onGetWidget
            , error:        function() {
                console.log('none')
            }
            , context:      self
        })
    }

    ShowClass.prototype.onGetWidget = function(resp) {
        if (resp.succ)      {
            this.entity = resp.entity;
            var entity  = cloneObject(this.entity);
            this.draw(entity)
        }
    }

    ShowClass.prototype.draw = function(entity) {
        var show_area = this.$show[0];
        if (entity.tem) {
            this.$show.html(entity.tem);
            show_area = this.$show.find("[name='the_widget']")[0]
        }

        var drawManager = new DrawManager(show_area);
        drawManager.draw(entity.figure)
    }

    ShowClass.prototype.onGetSkin = function(e, option) {
        var entity      = cloneObject(this.entity);
        var figure_data = entity.figure.figure;

        if ('xAxis' in option || 'yAxis' in option) {
            mixAxisOption(figure_data, option);
            delete option['xAxis'];
            delete option['yAxis']
        }

        if ('series' in option) {
            mixSeriesOption(figure_data, option);
            delete option['series']
        } 

        $.extend(true, figure_data, option);
        this.draw(entity)
    }

    return ShowClass
})



//////////////////////////////////////
//
// 调整区域
//
/////////////////////////////////////

define('adjust', [
], function() {
    var AdjustClass = function() {
        this.$form      = $("#skin_form");
        this.$test_btn  = $("#test_btn");
        this.$submit_btn = $("#submit_btn");

        this.$test_btn.on("click", $.proxy(this.onTestClicked, this));
        this.$submit_btn.on("click", $.proxy(this.onSubmitClicked, this))
    }

    AdjustClass.prototype.onTestClicked = function(e) {
        e.preventDefault();
        var areatext = $("[name='data']").val();
        var data = eval('(' + areatext + ')');
        $msg_pipe.trigger('test:skin', data)
        return false
    }

    AdjustClass.prototype.onSubmitClicked = function() {
        var input = this.$form.serieslize();
        $.ajax('skin', {
        })
    }

    return AdjustClass
})


////////////////////////////////////////
//
// 总体区域
//
////////////////////////////////////////

define('main', [
    'show'
    , 'adjust'
], function(ShowClass, AdjustClass) {
    new ShowClass();
    new AdjustClass();
})

require(['main'])



