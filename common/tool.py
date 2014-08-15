# -*- coding: utf-8 -*-
import psycopg2 as pysql
import datetime, time, random, sys, os, traceback

from collections import defaultdict
from django.http import HttpResponse
from django.utils import simplejson as json

from common.log import logger
import common.protocol as Protocol

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


# 不给外面调用
def UniqIdGenerator():
    """
    以长整型形式返回n个随机数
    """
    seed = random.getrandbits(8)
    while True:
        yield seed
        seed += 1

Uid_gen = UniqIdGenerator()

def GetUniqueIntId():
    """
    获取随机数
    """
    return Uid_gen.next()


def isNum(v):
    """
    判断是否为数字
    """
    try:
        v + 1
    except TypeError:
        return False
    else:
        return True


def readJsonFile(file_name):
    # 怎么检查文件是否存在

    f = open(file_name, 'r')
    data = json.load(f, 'utf-8')
    f.close()
    return data


def readFile(file_name):
    with open(file_name, 'r') as f:
        data = f.read()
    return data


def whichEncoding(s):
    cl = ['utf8', 'gb2312']
    for a in cl:
        try:
            s.decode(a)
            return a
        except UnicodeEncodeError:
            pass
    return 'unknown' 


def logExcInfo():
    """
    打印异常信息
    """
    traceback_template = '''
    Traceback: File({file}), Line({line}), Name({name}), Type({type}),
    Message: {msg}
    '''

    exc_type, exc_value, exc_traceback = sys.exc_info()
    traceback_details = {
        'file'      : exc_traceback.tb_frame.f_code.co_filename,
        'line'      : exc_traceback.tb_lineno,
        'name'      : exc_traceback.tb_frame.f_code.co_name,
        'type'      : exc_type.__name__,
        'msg'       : exc_value.message, 
    }

    traceback.print_exc()
    logger.error(traceback_template.format(**traceback_details))


def strfDataAfterFetchDb(data_from_db):
    """
    对查询数据库结果进行字符串化，方便进行Http传输
    """

    # fetchone后的结果
    if isinstance(data_from_db, tuple):
        data = [x.strftime(Protocol.DatetimeFormat) \
                            if isinstance(x, datetime.datetime) \
                            else x \
                            for x in data_from_db]
        return data
    
    # fetchall或者fetchmany后的结果
    elif isinstance(data_from_db, list):
        zip_data_list = zip(*data_from_db) 
        for idx, data_tuple in enumerate(zip_data_list):
            try:
                json.dumps(data_tuple)
            except Exception, e:
                str_data_tuple = map( \
                    lambda x: x.strftime(Protocol.DatetimeFormat) \
                    , data_tuple \
                )
                zip_data_list.pop(idx)
                zip_data_list.insert(idx, str_data_tuple)
        return zip(*zip_data_list)
    
    else:
        return None


def cleanDataFromDb(data):
    """
    对数据库查询结果进行清洗
    """
    def f(record):
        return [round(i, 2) if isinstance(i, float) else i  for i in record]

    return [f(r) for r in data]


def mergeListByKey(list1, list2, key):
    d = defaultdict(dict)
    for l in (l1, l2):
        for elem in l:
            d[elem[key]].update(elem)
    return d.values()


def strfDataList(data_list):
    pass


def calcStrFormula(left, operator, right):
    """
    计算用字符串表示的计算式的结果
    """
    try:
        left = str(left)
    except ValueError, e:
        return None

    if operator in ['le', '<=']:
        fomula = left + '<=' + right
    elif operator in ['lt', '<']:
        fomula = left + '<' + right
    elif operator in ['ge', '>=']:
        fomula = left + '>=' + right
    elif operator in ['gt', '>']:
        formula = left + '>' + right
    elif operator in ['eq', '==']:
        formula = left + '==' + right
    elif operator in ['bw', '<>']:
        formula = right[0] + '<' + left + '<' + right
    else:
        return None

    return eval(formula)


def resolveBackboneReq(request, type):
    if 'POST' == type:
        req = request.POST
    else:
        req = request.GET

    return json.loads(req.get('data'))



def isSublist(a, b):
    for i in a:
        if i not in b:
            return False

    return True


def findBiggestInteger(l):
    pass


def findMaxLength(l):
    pass




