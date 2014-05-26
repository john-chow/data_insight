// 本场景组件类构造函数
var MyWidgets = function() {
    // 组件列表
    this.widgets = [];

    // 组件布局
    this.layout = ""; 

    // 场景id
    this.id = "";

    this.init = function() {
        // 主要是适用于edit页面，去我的组件框中抓取
    };

    // 保存本场景组件列表
    this.save = function() {
    };

    // 设置布局
    this.setLayout = function(layout) {
        this.layout = layout
    }
}


var myWidgets = new MyWidgets();



// 点击已被允许使用的组件时，请求拿到组件chart图的数据

