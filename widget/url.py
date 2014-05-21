from django.conf.urls import patterns, include, url
from widget import views

urlpatterns = patterns('',
    # Uncomment the next line to enable the admin:
    url(r'^$', 				views.widgetList ,{'template_name': 'widget/list.html'}),
	url(r'^list/$', 		views.widgetList ,{'template_name': 'widget/list.html'}),
	url(r'^batchList/$',	views.widgetList ,{'template_name': 'widget/batchList.html'}),
	url(r'^create/$', 		views.widgetCreate),
	url(r'^delete/$', 		views.widgetDelete),
	url(r'^edit/$', 		views.widgetEdit),

	url(r'^distributed/$', 	views.changeDistributed),

	url(r'^db/$', 			views.connectDb),
	url(r'^tables/$', 		views.selectTables),

	url(r'^content$', 		views.getTableInfo),
	url(r'^draw/$', 		views.reqDrawData)
)
