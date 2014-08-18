from django.conf.urls import patterns, include, url
from widget import views

urlpatterns = patterns('',
    # Uncomment the next line to enable the admin:
    url(r'^create/$',           views.handleOperate),
	url(r'^edit/(\w+)/$', 		views.handleOperate, name = 'edit'),
	url(r'^update/(\w+)/$', 	views.handleOperate),

    url(r'^$', 					views.widgetList ,{'template_name': 'widget/list.html'}),
	url(r'^list/$', 			views.widgetList ,{'template_name': 'widget/list.html'}),
	url(r'^batch/$',			views.widgetList ,{'template_name': 'widget/batch.html'}),

	url(r'^show/(\w+)/$', 		views.widgetShow),

	url(r'^distr/$', 			views.widgetOp, {'op': 'dis'}),
	url(r'^delete/$', 			views.widgetOp, {'op': 'delete'}),

	url(r'^batch/distri/$',		views.batachOp, {'op': 'dis'} ),
	url(r'^batch/undistri/$',	views.batachOp, {'op': 'undis'} ),
	url(r'^batch/delete/$',		views.batachOp, {'op': 'delete'} ),

	url(r'^draw/$', 			views.handleDraw),
    url(r'^refresh/(\d+)/$',    views.handleRefresh),
    
    url(r'^viewList/$',         views.widgetList ,{'template_name': 'widget/view_list.html'}),
)
