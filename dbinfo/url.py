from django.conf.urls import patterns, url
from dbinfo import views

urlpatterns = patterns('',
	url( r'^$', 			views.tryIntoDb),
	url( r'^content$', 		views.getDbInfo),
	#url( r'^filter/$', 		views.dealFilter),
	url( r'^axes/column$', 	views.reqCol),
	url( r'^axes/row$', 	views.reqRow),
	url( r'^draw/$', 		views.reqDrawData),
)
