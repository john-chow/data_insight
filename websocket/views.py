# -*- coding: utf-8 -*-
# Create your views here.
from django.contrib.auth.models import User, Group
from django.http import HttpResponse
from django.views.generic.base import TemplateView
from django.views.decorators.csrf import csrf_exempt
from ws4redis.redis_store import RedisMessage
from ws4redis.publisher import RedisPublisher

class WidgetWsView(TemplateView):
    def post(self, request, *args, **kwargs):
        broadcast_widgets('')
        return HttpResponse('OK')

class SceneWsView(TemplateView):
    pass

class ThemeWsView(TemplateView):
    pass


def broadcast_widgets(content):
    '''
    推送组件更新内容
    '''
    redis_content = RedisMessage(content)
    RedisPublisher(facility='di', broadcast=True).publish_message(redis_content)
    

