# -*-coding: utf-8 -*-
# staticfiles_urlpatterns是指当部署到本地非django内置服务器时，
# django要主动去检查STATICFILE的设定
from django.contrib.staticfiles.urls import staticfiles_urlpatterns
from django.conf.urls import patterns, include, url
from MyTableau import views

# Uncomment the next two lines to enable the admin:
from django.contrib import admin
admin.autodiscover()

urlpatterns = patterns('',
    # Examples:
    # url(r'^$', 'MyTableau.views.home', name='home'),
    # url(r'^MyTableau/', include('MyTableau.foo.urls')),

    # Uncomment the admin/doc line below to enable admin documentation:
    # url(r'^admin/doc/', include('django.contrib.admindocs.urls')),

    # Uncomment the next line to enable the admin:
    url(r'^$', 			views.index),
    url(r'^pretest/$', 	views.pretest),
    url(r'^admin/', 	include(admin.site.urls)),
    url(r'^account/', 	include('account.url')),
    url(r'^widget/', 	include('widget.url', namespace="widget")),
    url(r'^scene/', 	include('scene.url', namespace="scene")),
    url(r'^theme/', 	include('theme.url', namespace="theme")),
    url(r'^skin/',      include('skin.url')),
    url(r'^connect/',   include('connect.url'))
)
urlpatterns += staticfiles_urlpatterns()
