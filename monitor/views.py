#-*- coding: utf-8 -*-
# Create your views here.
from threading import Timer

from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_http_methods
from django.http import HttpResponse
from django_sse.redisqueue import send_event
from django.utils import simplejson as json
from django_sse.redisqueue import RedisQueueView

from monitor.models import EventModel, WarningModel
from monitor.trigger import TriggerPsgModel
from connect.sqltool import stRestore
from widget.factor import FactorCreator
from widget.models import ExternalDbModel
from common.log import logger
from common.tool import MyHttpJsonResponse, logExcInfo

import pdb


# sse信道命名原则
SSE_CHANNEL_TEMPLATE = 'sse_{}'
class SSE(RedisQueueView):
    def get_redis_channel(self):
        '''
        覆盖RedisQueueView的函数
        为每个channel赋名字
        '''
        return SSE_CHANNEL_TEMPLATE.format(self.request.user.username)


def pollWarning():
    '''
    轮询warning数据表查询异常报告
    '''
    warnings = WarningModel.objects.filter(m_if_notify = False)
    for warning in warnings:
        event       = warning.m_event
        user_name   = warning.m_event.m_user.username
        result      = warning.m_result
        pushToClient(event.m_name, user_name, result)

        # 改为已经推送了的标志
        warning.m_if_notify = True
        warning.save()


def getConnDbByReq(request):
    '''
    在http请求时，获取连接数据表的连接对象
    '''
    hk  = request.session.get(u'hk')
    try:
        conn_db = ExternalDbModel.objects.get(pk = hk)
    except Exception, e:
        logExcInfo()
        raise Exception('xxxxxxxxxx')
    return conn_db


def makeEventKwargs(request):
    '''
    构建事件对象
    '''
    # 必须要提供事件名字以及相应表达式
    name, table, col, kind, func, operator, num = \
            map(lambda x: request.POST.get(x), \
                ('name', 'table', 'col', 'kind', 'cmd', 'oper', 'num'))

    if not name or not table or not col:
        raise Exception('xxxxxxxxxxxx')

    # 为用户输入数据建模过程
    try:
        lf  = FactorCreator().make(table = table, attr = col, kind = kind, cmd = func)
        rf  = FactorCreator().make(num = num)
    except Exception, e:
        logExcInfo()
        raise Exception('xxxxxxxxxxxx')

    user    = request.user
    conn_db = getConnDbByReq(request)

    return {
        'm_name'            : name,     
        'm_table'           : table, 
        'm_left_factor'     : str(lf), 
        'm_right_factor'    : str(rf), 
        'm_operator'        : operator, 
        'm_warning_kind'    : kind,  
        'm_conn_db'         : conn_db, 
        'm_user'            : user 
    }



@require_http_methods(['POST'])
@login_required
def eventCreate(request):
    '''
    新建事件
    '''
    try:
        # 保存事件记录
        # 先保存主要是为了获得pk，从而在触发器实现中，方便保存外键关系
        kwargs = makeEventKwargs(request)
        ev = EventModel.objects.create(**kwargs)

        # 用触发器机制实现监控机制
        tg = TriggerPsgModel(ev)
        tg.on()
    except Exception, e:
        logExcInfo()
        # 实现失败，删除该事件
        EventModel.objects.filter(pk = ev.pk).delete()   #事件上要区分，不是所有事件都要删
        return MyHttpJsonResponse({'succ': False})


    return MyHttpJsonResponse({'succ': True})



@require_http_methods(['POST'])
@login_required
def eventModify(request, ev_id):
    '''
    修改事件
    '''
    try:
        ev = EventModel.objects.get(pk = ev_id)
        if ev.m_user != request.user:
            return MyHttpJsonResponse({'succ': False})

        kwargs = makeEventKwargs(request, ev_id)
        ev.update(**kwargs)

        tg = TriggerPsgModel(ev)
        tg.modify()
    except Exception, e:
        logExcInfo()
        return MyHttpJsonResponse({'succ': False})
    else:
        # 成功后才更新到数据库
        EventModel.objects.filter(pk = ev_id).update(**kwargs)

    return MyHttpJsonResponse({'succ': True})


@require_http_methods(['POST'])
@login_required
def eventDelete(request, id):
    '''
    删除事件
    '''
    try:
        ev = EventModel.objects.get(pk = id)
    except EventModel.DoesNotExist, e:
        logExcInfo()
        return MyHttpJsonResponse({'succ': False, 'msg': 'xx'})

    try:
        tg = TriggerPsgModel(ev)
        tg.off()
    except Exception, e:
        logExcInfo()
        return MyHttpJsonResponse({'succ': False})

    EventModel.objects.filter(pk = id).delete()
    return MyHttpJsonResponse({'succ': True})



def pushToClient(event_name, user_name, result):
    """
    主动推送信息到前端
    """
    logger.info('name is {}, result is {}, username is {}'.format(event_name, result, user_name))
    send_event(event_name, json.dumps({
        'result': result
    }), channel = SSE_CHANNEL_TEMPLATE.format(user_name))

    #return HttpResponse('')


