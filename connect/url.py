from django.conf.urls import patterns, include, url
from connect import views

urlpatterns = patterns('',
    url(r'db/$',        views.connectDb),
    url(r'table/$',     views.selectTables),
    url(r'content/$',   views.getTableInfo),
    url(r'file/$',      views.uploadFile)
)
