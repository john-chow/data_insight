from django.conf.urls import patterns, include, url
from connect import views

urlpatterns = patterns('',
    url(r'^db/$',            views.handleConn),
    url(r'^table/$',         views.handleTable),
    url(r'^field/$',         views.handleField),
    url(r'^file/$',          views.uploadFile),
    url(r'^distinct/$',      views.handleDistinct),

    url(r'^column/$',        views.handleColumn),
)
