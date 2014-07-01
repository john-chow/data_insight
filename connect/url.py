from django.conf.urls import patterns, include, url
from connect import views
from django_sse.redisqueue import RedisQueueView

urlpatterns = patterns('',
    url(r'db/$',            views.connectDb),
    url(r'table/$',         views.selectTables),
    url(r'content/$',       views.getTableInfo),
    url(r'file/$',          views.uploadFile),
    url(r'sse/$',           RedisQueueView.as_view(redis_channel = 'foo')),
    url(r'test/$',          views.pushToClient),
)
