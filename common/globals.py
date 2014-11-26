# -*- coding: utf-8 -*-

# 提供全局的变量或者函数

def ReverseEnumerate(input_list):
    pass

def IterDictList(dicts_list):
    '''
    遍历字典列表
    '''
    if isinstance(dicts_list, list):
        raise Exception('')

    for item in dicts_list:
        k, v = item.items()
        yield k, v


