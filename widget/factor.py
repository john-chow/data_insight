#-*-coding: utf-8 -*-
"""
Factor类:
    主要是封装某个量的计算式，比如 'A表中销量列的总和';
    也可以只是表达某个单纯的数字，比如 5
"""
import ast
import re
from numbers import Number
#from collections import namedtuple

from common.tool import isSublist
from common.log import logger
import common.protocol as Protocol

import pdb

# 打印、存储FACTOR类对象时，按照这样顺序进行
EXPRESS_FACTOR_KEYS_TUPLE = \
        (Protocol.Table, Protocol.Attr, Protocol.Kind, Protocol.Func)
TIME_LENGTH_LIST = ['unit', 'length']
        


class FactorFactory():
    @ classmethod
    def make(cls, var):
        '''
        创建数据表示模型
        '''

        '''
        keys = kwargs.keys()
        if 'num' in keys:
            return NumericFactor(kwargs)
        '''

        if SeriesFactor.isThis(var):
            return SeriesValue(var)
        elif RangeFactor.isThis(var):
            return RangeFactor(var)
        elif TimeFactor.isThis(var):
            return TimeFactor(var)
        elif FieldFactor.isThis(var):
            return FieldFactor(var)
        else:
            raise Exception('uuuuuuuuuu')

    @ classmethod
    def restore(cls, str):
        '''
        从数据库格式恢复为Factor对象
        '''
        var = ast.literal_eval(str)
        return FactorFactory.make(var)

'''
        # 原型是tuple，证明是列对象；如果只是数值，那么就是数字对象
        if isinstance(expr, tuple) \
                and len(expr) == len(EXPRESS_FACTOR_KEYS_TUPLE):
            dict_factor = dict(zip(EXPRESS_FACTOR_KEYS_TUPLE, expr))
            return FactorFactory.make(**dict_factor)
        else:
            return FactorFactory.make(**{'num': expr})
'''



class Factor():

    def __eq__(self, other):
        '''
        可以按结果比较是否相等
        '''
        return self.getValue() == other.getValue()

    def __lt__(self):
        '''
        可以按结果比较是否小于
        '''
        return self.getValue() < other.getValue()

    def __le__(self):
        '''
        可以按结果比较是否小于或等于
        '''
        return self.getValue() <= other.getValue()

    def __gt__(self):
        '''
        可以按结果比较是否大于
        '''
        return self.getValue() > other.getValue()

    def __ge__(self):
        '''
        可以按结果比较是否小于或等于
        '''
        return self.getValue() >= other.getValue()

    def __iter__(self):
        '''
        可以迭代运算
        '''
        if hasattr(self, 'table'):
            return (self.table, self.attr, self.kind, self.cmd)
        else:
            return (self.value)


    def getValue(self):
        '''
        计算本因子的值
        '''
        if ifM():
            [result] = st.exeSelect(self.__iter__())
            return result
        else:
            return self.num


'''
OneValue    = namedtuple('OneValue', ('value'))
SeriesValue = namedtuple('SeriesValue', ('values'))
RangeValue  = namedtuple('RangeValue', ('low', 'high'))
TimeValue   = namedtuple('TimeValue', ('unit', 'number'))
'''


class SeriesFactor(Factor):
    def __init__(self, series):
        self.series = series

    def extract(self):
        return self.series

    def __str__(self):
        return str(self.series)

    def mapIntoSql(self):
        pass

    @ classmethod
    def isThis(cls, var):
        return isinstance(var, list) \
                and '-' not in var


class RangeFactor(Factor):
    def __init__(self, range):
        low, high = range[0], range[2]
        self.low = low if low else None
        self.high = high if high else None

        if not self.low and not self.high:
            pass
        elif self.high < self.low:
            pass

    def extract(self):
        return self.low, self.high

    def __str__(self):
        raw = [self.low, '-', self.high]
        return str(raw)

    def mapIntoSql(self):
        if not self.low:
            return '<' + str(self.high)
        elif not self.high:
            return '>' + str(self.low)
        else:
            return 'BETWEEN ' + str(self.low) \
                    + ' AND ' + str(self.high)

    @ classmethod
    def isThis(cls, var):
        return isinstance(var, list) \
                and '-' in var



class TimeFactor(Factor):
    def __init__(self, dict):
        map(lambda x: setattr(self, x, dict[x]), \
                TIME_LENGTH_LIST)

    def extract(self):
        attrs = []
        for k in TIME_LENGTH_LIST:
            attrs.append(getattr(self, k))
        return tuple(attrs)

    def __str__(self):
        raw = dict(zip(TIME_LENGTH_LIST, self.extract()))
        return str(raw)

    @ classmethod
    def isThis(cls, var):
        return isinstance(var, dict) \
                and isSublist(var.keys(), TIME_LENGTH_LIST)


class FieldFactor(Factor):
    def __init__(self, dict):
        map(lambda x: setattr(self, x, dict[x]), \
            EXPRESS_FACTOR_KEYS_TUPLE)

    def __str__(self):
        raw = dict(zip(EXPRESS_FACTOR_KEYS_TUPLE, self.extract()))
        return str(raw)

    def extract(self):
        '''
        剖析得到必须存在的四个最基本属性
        '''
        self_list = []
        for k in EXPRESS_FACTOR_KEYS_TUPLE:
            self_list.append(getattr(self, k))
        self_tuple = tuple(self_list)
        return self_tuple

    def mapIntoSql(self):
        '''
        转换成sql里面的表达式
        '''
        # 注意判断属性的类型，是数字还是时间
        funcname = getattr(self, Protocol.Func)
        attr = getattr(self, Protocol.Attr)
        if not funcname or Protocol.NoneFunc == funcname:
            return attr
        else:
            return  funcname + '(' + attr + ')'

    def setBelongToAxis(self, axis):
        '''
        设置该度量所属的轴
        '''
        if axis in ['col', 'row']:
            setattr(self, 'axis', axis)

    def getBelongToAxis(self):
        '''
        获取该度量所属的轴
        '''
        return getattr(self, 'axis')

    def getProperty(self, p):
        return getattr(self, p)


    def cvtToDbFormat(self):
        '''
        转换到可以存储到数据库的格式
        '''
        return self.__str__()

    @ classmethod
    def isThis(cls, var):
        return isinstance(var, dict) \
                and isSublist(var.keys(), EXPRESS_FACTOR_KEYS_TUPLE)



                


'''
封装数字或者数字范围的类
'''
class NumericFactor(Factor):
    def __init__(self, kwargs):
        self.str = str(kwargs['num'])
        # 匹配单一数字
        m = re.match('^[-]?\d+(?:\.\d+)?$', self.str)
        # 匹配数字的值域范围，范围格式是[10,15]
        n = re.split('\[|,|\]', self.str)

        if m:
            self.value = float(m.group(0))
            self.isValue = True
        elif len(n) > 1:
            self.low = float(n[0])
            self.high = float(n[1])
            self.isValue = False
        else:
            raise Exception('xxxxxxxxxx')


    def __str__(self):
        return self.str

    def mapIntoSql(self):
        '''
        转换到sql中的表达形式
        '''
        if self.isValue:
            return str(self.value)
        else:
            return 'BETWEEN ' + str(self.low) \
                    + ' AND ' + str(self.high)



OPERATOR_LIST = ['<', '>', '<>', '<=', '>=', '==']


'''
封装表达式
'''
class Clause():
    def __init__(self, lfactor, rfactor, op, overplus):
        self.left = lfactor
        self.right = rfactor
        self.op = op
        self.overplus = overplus

    def getLeft(self):
        return self.left

    def getRight(self):
        return self.right

    def getOp(self):
        return self.op




