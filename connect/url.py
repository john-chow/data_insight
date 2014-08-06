from django.conf.urls import patterns, include, url
from connect import views

urlpatterns = patterns('',
    url(r'db/$',            views.handleConn),
    url(r'table/$',         views.handleTable),
    url(r'content/$',       views.getTableInfo),
    url(r'file/$',          views.uploadFile),
)
