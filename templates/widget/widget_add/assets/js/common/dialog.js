/*!
 * 公用模态框
 * Date: 2014-7-25
 */
define([
  'marionette',
  'bootstrap',
], function (Marionette, b) {

  Marionette.Region.Dialog = Marionette.Region.extend({

    onShow: function(view){
      var self = this;
      this.$el.modal('show');
    },

  });

  return Marionette.Region.Dialog;
});
