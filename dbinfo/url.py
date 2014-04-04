from django.conf.urls import patterns, url
from dbinfo import views

urlpatterns = patterns('',
	url( r'^$', 			views.tryIntoDb),
	url( r'^filter/(\w+)$', views.dealFilter),
	url( r'^axes/column$', 	views.reqCol),
	url( r'^axes/row$', 	views.reqRow),
)
