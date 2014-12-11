# -*- coding: utf-8 -*-

# 所有返回前端的消息内容
# 引入时，要from msg.py import _MSG

class MSG:
    class ModifyMsgError(TypeError):
        pass

    def __setattr__(self, name, value):
        if name in self.__dict__:
            raise ''
        self.__dict__[name] = value

_MSG = MSG()

################################
# 画图时，轴上字段不合理  
###############################
_MSG.DRAW_BLAM_ERR_1 = u'要求每个轴上全是数字列，或者全是非数字列'
_MSG.DRAW_BLAM_ERR_2 = u'要求所有轴上至少有一个数字列'
_MSG.DRAW_BLAM_ERR_3 = u'要求所有轴上总共有且只有一个非数字列'
_MSG.DRAW_BLAM_ERR_4 = u'要求所有数字列都必须进行聚合运算'

_MSG.DRAW_PT_ERR_1 = u'要求每个轴上全是数字列，或者全是非数字列'
_MSG.DRAW_PT_ERR_2 = u'要求所有轴上总共有且只有一个数字列'
_MSG.DRAW_PT_ERR_3 = u'要求所有轴上至少有一个非数字列'
_MSG.DRAW_PT_ERR_4 = u'要求数字列都必须进行聚合运算'

_MSG.DRAW_SCA_ERR_1 = u'要求每个轴上都有且只有一个数字列'

_MSG.DRAW_GROUP_ERR_1 = u'要求所有分组选项里面都必须是非数字列'
