from django.conf.urls import patterns, url
from dbinfo import views

urlpatterns = patterns('',
	url( r'^$', views.tryIntoDb),
	url( r'^select/$', views.addSelect),
	url( r'^filter/add/(\w+)$', views.addValListFilter),
	url( r'^filter/rm/$', views.rmFilter),
)
