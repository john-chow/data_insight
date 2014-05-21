from django.conf.urls import patterns, include, url
from widget import views

urlpatterns = patterns('',
    # Uncomment the next line to enable the admin:
    url(r'^$', 			views.widgetList),
	url(r'^list/$', 	views.widgetList),
	url(r'^create/$', 	views.widgetCreate),
	url(r'^delete/$', 	views.widgetDelete),
	url(r'^edit/(\w+)/$', views.widgetEdit),
	url(r'^db/$', 		views.connectDb),
	url(r'^tables/$', 	views.selectTables),

	url(r'^content$', 	views.getTableInfo),
	url(r'^draw/$', 	views.reqDrawData)
)
