from django.conf.urls import patterns, url
from dbinfo import views

urlpatterns = patterns('',
	url( r'^$', 			views.tryIntoDb),
	url( r'^tables$', 		views.getTableList),
	url( r'^content$', 		views.getDbInfo),
	url( r'^draw/$', 		views.reqDrawData),
)
