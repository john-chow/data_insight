from django.conf.urls import patterns, include, url
from widget import views

urlpatterns = patterns('',
    # Uncomment the next line to enable the admin:
    url(r'^$', 					views.widgetList ,{'template_name': 'widget/list.html'}),
	url(r'^list/$', 			views.widgetList ,{'template_name': 'widget/list.html'}),
	url(r'^batch/$',			views.widgetList ,{'template_name': 'widget/batch.html'}),

	url(r'^create/$', 			views.widgetCreate),
	url(r'^edit/(\w+)/$', 		views.widgetEdit, name='edit'),
	url(r'^show/(\w+)/$', 		views.widgetShow),

	url(r'^distr/$', 			views.widgetOp, {'op': 'dis'}),
	url(r'^delete/$', 			views.widgetOp, {'op': 'delete'}),

	url(r'^batch/distri/$',		views.batachOp, {'op': 'dis'} ),
	url(r'^batch/undistri/$',	views.batachOp, {'op': 'undis'} ),
	url(r'^batch/delete/$',		views.batachOp, {'op': 'delete'} ),

	url(r'^db/$', 				views.connectDb),
	url(r'^tables/$', 			views.selectTables),

	url(r'^content$', 			views.getTableInfo),
	url(r'^draw/$', 			views.reqDrawData)
)
