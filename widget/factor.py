#-*-coding: utf-8 -*-
"""
Factor类:
    主要是封装某个量的计算式，比如 'A表中销量列的总和';
    也可以只是表达某个单纯的数字，比如 5
"""
import ast
import re
from numbers import Number
from collections import namedtuple

from common.tool import isSublist
from common.log import logger
import common.protocol as Protocol

import pdb

# 打印、存储FACTOR类对象时，按照这样顺序进行
EXPRESS_FACTOR_KEYS_TUPLE = \
        (Protocol.Table, Protocol.Attr, Protocol.Kind, Protocol.Func)


class FactorFactory():
    @ classmethod
    def make(cls, arg):
        '''
        创建数据表示模型
        '''

        '''
        keys = kwargs.keys()
        if 'num' in keys:
            return NumericFactor(kwargs)
        '''

        if isinstance(arg, Number):
            return OneValue(arg)
        elif isinstance(arg, list) and '-' != arg[0]:
            return SeriesValue(arg)
        elif isinstance(arg, list) and '-' == arg[0]:
            low, high = arg[1], arg[2]
            return RangeValue(low, high)
        elif isinstance(arg, dict) \
                and isSublist(arg.keys(), list(EXPRESS_FACTOR_KEYS_TUPLE)):
            return Factor(**arg)
        elif isinstance(arg, dict) \
                and isSublist(arg.keys(), ['unit', 'length']):
            unit, length = arg['unit'], arg['length']
            return TimeFactor(unit, length)
        else:
            raise Exception('uuuuuuuuuu')

    @ classmethod
    def restore(cls, factor_str):
        '''
        从数据库格式恢复为Factor对象
        '''
        factor_prototype = ast.literal_eval(factor_str)

        # 原型是tuple，证明是列对象；如果只是数值，那么就是数字对象
        if isinstance(factor_prototype, tuple):
            dict_factor = dict(zip(EXPRESS_FACTOR_KEYS_TUPLE, factor_prototype))
            return FactorFactory.make(**dict_factor)
        else:
            return FactorFactory.make(**{'num': factor_prototype})


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
一个值的基础类
'''
OneValue = namedtuple('OneValue', ('value'))

'''
class OneValueFactor(Factor):
    def __init__(self, value):
        self.value = value

    def value(self):
        return self.value
'''


'''
一系列值的基础类
'''
SeriesValue = namedtuple('SeriesValue', ('values'))

'''
class SeriesFactor(Factor):
    def __init__(self, values):
        if not isinstance(values, list):
            pass
        self.values = values

    def value(self):
        return self.values
'''


'''
一个范围的值
'''
RangeValue = namedtuple('RangeValue', ('low', 'high'))

'''
class RangeFactor(Factor):
    def __init__(self, low, high):
        if low > high:
            pass
        self.low = low
        self.high = high

    def value(self):
        return self.low, self.high
'''

TimeValue = namedtuple('TimeValue', ('unit', 'number'))

'''
class TimeFactor(Factor):
    def __init__(self, type, number):
        self.type = type
        self.number = number

    def value(self):
        return self.type, self.number
'''


class Factor(Factor):
    def __init__(self, **kwargs):
        map(lambda x: setattr(self, x, kwargs[x]), \
            EXPRESS_FACTOR_KEYS_TUPLE)

    def __str__(self):
        return str(self.extract())

    def extract(self):
        '''
        剖析得到必须存在的四个最基本属性
        '''
        self_list = []
        for k in EXPRESS_FACTOR_KEYS_TUPLE:
            self_list.append(getattr(self, k))
        self_tuple = tuple(self_list)
        return self_tuple

    def cvtToSqlVar(self):
        '''
        转换成sql里面的表达式
        '''
        # 注意判断属性的类型，是数字还是时间
        if not self.cmd or Protocol.NoneFunc == self.cmd:
            return self.attr
        else:
            return  self.cmd + '(' + self.attr + ')'

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


    def restoreFromDbFormat(self):
        '''
        从数据库存储格式恢复成对象
        '''
        pass
                


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

    def cvtToSqlVar(self):
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

'''
class ClauseCreator():
    @classmethod
    def make(cls, lfactor, rfactor, op, overplus):
        if op in ['>', '>=']:
            return CalcClause(lfactor, rfactor, op, overplus)
        elif op in ['in', 'ex']:
            return SeriesClause(lfactor, rfactor, op, overplus)
        elif op in ['bw']:
            return SeriesClause(lfactor, rfactor, op, overplus)
        elif op in ['last', 'next']:
            return TimeClause(lfactor, rfactor, op, overplus)
        else:
            pass

class CalcClause(Clause):
    pass

class SeriesClause(Clause):
    pass

class RangeClause(Clause):
    pass

class TimeClause(Clause):
    pass
'''




