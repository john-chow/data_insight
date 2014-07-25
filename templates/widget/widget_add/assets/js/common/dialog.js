/*!
 * 公用模态框
 * Date: 2014-7-25
 */
define([
  'marionette',
  'jquery-ui'
], function (Marionette, ui) {

  Marionette.Region.Dialog = Marionette.Region.extend({
    //监听show Region事件
    onShow: function(view){
      this.listenTo(view, "dialog:close", this.closeDialog);

      var self = this;
      this.$el.dialog({
        modal: true,
        title: "模态框",
        width: "auto",
        close: function(e, ui){
          self.closeDialog();
        }
      });
    },

    closeDialog: function(){
      this.stopListening();
      this.empty();
      this.$el.dialog("destroy");
    }
  });

  return Marionette.Region.Dialog;
});
