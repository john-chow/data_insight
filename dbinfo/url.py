from django.conf.urls import patterns, url
from dbinfo import views

urlpatterns = patterns('',
	url( r'^$', views.tryIntoDb),
	url( r'^select/$', views.addSelect),
	url( r'^filter/(\w+)$', views.dealFilter),
	url( r'^axes/(\w+)/$', views.test),
)
