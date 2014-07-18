# -*-coding: utf-8 -*-

from django.conf.urls import patterns, include, url
from monitor import views
from common.timer import MyTimer

urlpatterns = patterns('',
    url(r'sse/$',           views.SSE.as_view(), name = 'sse'),

    url(r'event/create/$',        views.eventCreate),
    url(r'event/delete/(\d+)/$',  views.eventDelete),
    url(r'event/modify/$',        views.eventModify),
)


# 初始化本app
MyTimer(5, views.pollWarning).start()

