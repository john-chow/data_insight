# -*- coding: utf-8 -*-
from django.conf.urls import url, patterns, include
from django.core.urlresolvers import reverse_lazy
from django.contrib.staticfiles.urls import staticfiles_urlpatterns
from django.views.generic import RedirectView
from django.contrib import admin
from .views import WidgetWsView, SceneWsView, ThemeWsView
admin.autodiscover()


urlpatterns = patterns('',
    url(r'^widget/$',WidgetWsView.as_view(), name='widget_channel'),
    url(r'^scene/$', SceneWsView.as_view(), name='scene_channel'),
    url(r'^theme/$', ThemeWsView.as_view(), name='theme_channel'),
) + staticfiles_urlpatterns()
