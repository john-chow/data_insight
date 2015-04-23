# -*- coding: utf-8 -*-
#from widget.views import FactorHandler
#import widget.views as WidgetViewModule
from common.msg import _MSG
import common.protocol as Protocol
import pdb

def makeValidator(shape):
    '''
    验证器工厂函数
    '''
    if shape in ['bar', 'line', 'area']:
        return BlaValidator()
    elif shape in ['pie', 'funnel']:
        return PtValidator()
    elif shape in ['radar']:
        return RadValidator()
    elif shape in ['scatter']:
        return ScaValidator()
    elif shape in ['map']:
        return MapValidator()
    elif shape in ['gis']:
        return GisValidator()
    else:
        raise Exception('')


class BaseValidator(object):
    '''
    验证group类里面的字段是否合理
    '''
    def ifValid(self, fh):
        # 所有分组信息里的列必须是文字类型的 
        groups_len  = len(fh.groups)
        if groups_len > 0:
            group_value_len = len(
                [f for f in fh.groups if Protocol.NumericType == f.kind]
            )
            if group_value_len > 0:
                return False, _MSG.DRAW_GROUP_ERR_1
        return True, ''


    def scan(self, fh):
        '''
        检测出所有信息的个数
        '''
        rows_len    = len(fh.rows)
        cols_len    = len(fh.cols)
        row_value_len, col_value_len = len( 
            [f for f in fh.rows if Protocol.NumericType == f.kind]  
        ), len( 
            [f for f in fh.cols if Protocol.NumericType == f.kind]  
        )
        row_cat_len, col_cat_len = rows_len - row_value_len, cols_len - col_value_len
        row_msu_len, col_msu_len = len(
            [f for f in fh.rows if f.cfunc and Protocol.NoneFunc != f.cfunc]  
        ), len( 
            [f for f in fh.cols if f.cfunc and Protocol.NoneFunc != f.cfunc]  
        )

        return (
            rows_len
            , cols_len
            , row_value_len
            , col_value_len
            , row_cat_len
            , col_cat_len
            , row_msu_len
            , col_msu_len
        )
        

class BlaValidator(BaseValidator):
    '''
    柱状，线状等图形的验证器
    '''
    def ifValid(self, fh):
        '''
        验证接口
        param:
            fh: FactorHandler接口
        '''
        (rows_len, cols_len
            , row_value_len, col_value_len
            , row_cat_len, col_cat_len
            , row_msu_len, col_msu_len) = self.scan(fh)

        # 一轴上全是msu，另一轴上全是msn
        if not (rows_len == row_msu_len and cols_len == col_cat_len \
                or rows_len == row_cat_len and cols_len == col_msu_len):
            return False, _MSG.DRAW_BLAM_ERR_1

        all_cat_len, all_value_len, all_msu_len \
            = row_cat_len + col_cat_len \
                , row_value_len + col_value_len \
                , row_msu_len + col_msu_len

        # 只能有一个cat，至少一个value列
        if all_value_len < 1:
            return False, _MSG.DRAW_BLAM_ERR_2

        if all_cat_len != 1:
            return False, _MSG.DRAW_BLAM_ERR_3


        # 所有数字列必须是msu
        if all_value_len != all_msu_len:
            return False, _MSG.DRAW_BLAM_ERR_4

        return super(BlaValidator, self).ifValid(fh)


class PtValidator(BaseValidator):
    '''
    成分占比图的验证器
    '''
    def ifValid(self, fh):
        (rows_len, cols_len
            , row_value_len, col_value_len
            , row_cat_len, col_cat_len
            , row_msu_len, col_msu_len) = self.scan(fh)

        # 一轴上全是msu，另一轴上全是msn
        if not (rows_len == row_msu_len and cols_len == col_cat_len \
                or rows_len == row_cat_len and cols_len == col_msu_len):
            return False, _MSG.DRAW_PT_ERR_1

        # 只能有一个value，至少一个cat列
        all_value_len, all_cat_len \
            = row_value_len + col_value_len, row_cat_len + col_cat_len

        if all_value_len != 1:
            return False, _MSG.DRAW_PT_ERR_2

        if all_cat_len < 1:
            return False, _MSG.DRAW_PT_ERR_3

        all_msu_len = row_msu_len + col_msu_len
        if all_msu_len != all_value_len:
            return False, _MSG.DRAW_PT_ERR_4

        return super(PtValidator, self).ifValid(fh)


class RadValidator(BaseValidator):
    '''
    雷达图验证器
    '''
    def ifValid(self, fh):
        (rows_len, cols_len
            , row_value_len, col_value_len
            , row_cat_len, col_cat_len
            , row_msu_len, col_msu_len) = self.scan(fh)

        # 一轴上全是msu，另一轴上全是msn
        if not (rows_len == row_msu_len and cols_len == col_cat_len \
                or rows_len == row_cat_len and cols_len == col_msu_len):
            return False, _MSG.DRAW_RAD_ERR_1

        all_msu_len, all_msn_len \
                = row_msu_len + col_msu_len, row_cat_len + col_cat_len

        # 至少要有3个msu列，有且只能有1个msn列
        if all_msu_len < 3 or all_msn_len != 1:
            return False, _MSG.DRAW_RAD_ERR_2

        return super(RadValidator, self).ifValid(fh)


class ScaValidator(BaseValidator):
    '''
    散点图的验证器
    '''
    def ifValid(self, fh):
        (rows_len, cols_len
            , row_value_len, col_value_len
            , row_cat_len, col_cat_len
            , row_msu_len, col_msu_len) = self.scan(fh)

        # 行和列都只能有1个value列，任意个cat列
        if row_value_len != 1 or col_value_len != 1:
            return False, _MSG.DRAW_SCA_ERR_1
        return super(ScaValidator, self).ifValid(fh)


class MapValidator(BlaValidator):
    '''
    地图的验证器
    '''
    def ifValid(self, fh):
        return super(MapValidator, self).ifValid(fh)


class GisValidator(object):
    def ifValid(self, fh):
        return True, ''


