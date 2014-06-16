# -*- coding: utf-8 -*-
# Create your views here.
'''
Created on 2014年6月13日

@author: liweiji
'''
from django import template  
  
register = template.Library()  
  
def key(d, key_name):
    """
        通过字典key获取value，在html中使用格式:{{ dict|key:key_name }}
    """
    try:
        value = d[key_name]
    except:
        from django.conf import settings
        value = settings.TEMPLATE_STRING_IF_INVALID
    return value
key = register.filter('key', key) 

def valOfKey(d, key_attr):
    """
        通过字典key获取的对象的指定属性的值,参数key_attr的格式为"'key'+'_'+'attributeName'"，在html中使用格式:{{ dict|key:key,attr }}
    """
    try:
        newKA = [el.strip() for el in key_attr.split(",")]
        key = newKA[0]
        attr = newKA[1]
        value = d[key]
    except:
        from django.conf import settings
        value = settings.TEMPLATE_STRING_IF_INVALID
    return eval('value.%s'%attr)
valOfKey = register.filter('valOfKey', valOfKey) 

  
def percent_decimal(value):  
    """
         显示数字百分比
    """
    value = float(str(value))  
    value = round(value, 3)  
    value = value * 100  
      
    return str(value) + '%'  
register.filter('percent_decimal', percent_decimal) 