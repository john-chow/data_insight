// 消息通道
$msg_pipe = $('body');


////////////////////////////////////////
//
// 展示区域
//
///////////////////////////////////////

define('show', [
    'drawer'
    , '/static/assets/js/common/tool.js'
    , '/static/js/skin/mix.js'
    //, 'skin/mix'
], function(DrawManager, _t, Mix) {
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
        Mix.mix_option(figure_data, option)

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
        this.$skin_select = this.$form.find("[name='skin_id']");

        this.$skin_select.on("change", $.proxy(this.onSkinChange, this));
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

    AdjustClass.prototype.onSkinChange = function(e) {
        var self = this;
        var skin_value = e.target.value;
        if ('new' == skin_value)        return

        var url = "/skin/edit/" + skin_value + "/";
        $.ajax(url, {
            type:           'GET'
            , dataType:     'json'
            , success:      function(resp) {
                if(resp.succ) {
                    var name = resp.entity.name;
                    var text = resp.entity.data;
                    self.$form.find("[name='name']").val(name);
                    self.$form.find("[name='data']").val(text)
                }
            }
            , error:        function() {
            }
        })
    }

    AdjustClass.prototype.onSubmitClicked = function(e) {
        e.preventDefault();

        // 检查输入
        var name = this.$form.find("[name='name']").val();
        if (!name) {
            alert('填写名字');
            return
        }

        var areatext = $("[name='data']").val();
        var json = eval('(' + areatext + ')');

        var skin_value = this.$skin_select.val();
        if ('new' == skin_value) {
            var url = "/skin/create/"
        } else {
            var url = "/skin/edit/" + skin_value + "/"
        }

        $.ajax(url, {
            type:           'POST'
            , data:         {
                'name':     name
                , 'data':   JSON.stringify(json)
            }
            , dataType:     'json'
            , success:      function() {}
            , error:        function() {}
        })

        return false
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


