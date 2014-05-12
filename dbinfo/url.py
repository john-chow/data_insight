from django.conf.urls import patterns, url
from dbinfo import views

urlpatterns = patterns('',
	url( r'^$', 				views.tryIntoDb),
	url( r'^content$', 			views.getTableInfo),
	url( r'^draw/$', 			views.reqDrawData)
)
