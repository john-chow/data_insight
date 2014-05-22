# -*- coding: utf-8 -*-

from django.http import HttpResponse
from django.utils import simplejson as json
import psycopg2 as pysql
import datetime
import random
import pdb

def MyHttpJsonResponse(data):
    """
    JOSN返回函数
    """
    # judge data is a living example of dict or not
    if isinstance(data, dict):
        return HttpResponse(json.dumps(data), content_type='application/json')
    else:
        # TBD
        return HttpResponse(data, content_type='application/json')
    
def date_handler(obj):
    return obj.isoformat() if hasattr(obj, 'isoformat') else obj

def cvtDateTimeToStr(dt=datetime.datetime.now()):
    """
    自定义格式化字符串
    """
    if not isinstance(dt, datetime.datetime):
        return dt
    return dt.strftime("%Y%m%d%H%M%S")


def UniqIdGenerator():
    """
    以长整型形式返回n个随机数
    """
    seed = random.getrandbits(8)
    while True:
        yield seed
        seed += 1

def GetUniqueIntId():
    """
    获取随机数
    """
    gen = UniqIdGenerator()
    return gen.next()






