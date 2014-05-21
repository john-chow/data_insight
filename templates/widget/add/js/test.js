define([
  'jquery'
  ,'backbone'
], function($,Backbone) {

	var People = Backbone.Model.extend({
		initialize: function(){
			this.bind("change:name",this.aboutMe);
			this.bind("error", function(model, error){
				alert(error);
			})
		},
		defaults:{
			name: "无名氏",
			age: 0
		},
		validate: function(attrs){
			if(!attrs.name){
				return "名字不能为空";
			}
			if(attrs.age < 0 || attrs.age > 100){
				alert("年龄必须大于0小于100");
			}
		},
		delete: function(){
			this.destroy();
		},
		aboutMe: function(people){
			return people.get("age");
		}
	})

	var Peoples = Backbone.Collection.extend({
		model: People,
		//存储到本地，以peoples-backbone命名的空间中
		//localStorage:new Backbone.LocalStorage("peoples-backbone"),
		comparator: 'age',
		countPeoples: function(){
			return this.length;
		}

	})

	var peoples =new Peoples();
	var PeopleView = Backbone.View.extend({
		initialize: function(){
			this.render();
		},
		el: ".people-list li",
		template: _.template($('#item-template').html()),
		render: function(){
			this.$el.html(this.template(this.model.toJSON()));
			this.input = $(".edit");
		},
		events: {
			"dblclick .view"  : "edit",
			"blur .edit"      : "close"
		},
		edit: function(){
			  this.$el.addClass("editing");
      		  this.input.focus();
		},
		close: function(){
			this.$el.removeClass("editing");
		},
	})

	//var peopleView = new PeopleView();	
	SearchView=Backbone.View.extend({
		initialize:function(){
			this.render();
		},
		el: '#search_container',
		render:function(search_label){
			//使用underscore这个库，来编译模板
			var template=_.template($("#search_template").html(),{search_label:search_label});
			//加载模板到对应的el属性中
			this.$el.html(template);
		},
		events:{//就是在这里绑定的
			'click input[type=button]':'doSearch'//定义类型为button的input标签的点击事件，触发函数doSearch
		},
		doSearch:function(event){
			this.render($("#search_input").val());
		}
	});
	var searchView=new SearchView();
	t = {
		start: function() {
			/*
			$.ajax({
				type:	'POST'
				, url:	'http://10.1.50.125:9000/subject/rm_scene/'
				, dataType: 'json'
				, data:	{
					'sub_id':		79
					, 'scn_id':		127
					, 'order':		1
				}
				, success: function() {
				}
				, error: function() {
					alert("yyyyy")
				}
			})
			*/
		}
	};

	return t;
})
