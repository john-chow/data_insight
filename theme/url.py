from django.conf.urls import patterns, include, url
from theme import views

urlpatterns = patterns('',
    # Uncomment the next line to enable the admin:
    url(r'^$', 					views.themeList ,{'template_name': 'theme/list.html'}),
	url(r'^list/$', 			views.themeList ,{'template_name': 'theme/list.html'}),
	url(r'^batch/$',			views.themeList ,{'template_name': 'theme/batch.html'}),
	
	url(r'^create/$',			views.themeCreate),
	url(r'^edit/(\w+)/$',		views.themeEdit, name='edit'),

	url(r'^distr/$', 			views.themeOp, {'op': 'dis'}),
	url(r'^delete/$', 			views.themeOp, {'op': 'delete'}),

	url(r'^batch/distri/$',		views.batachOp, {'op': 'dis'} ),
	url(r'^batch/undistri/$',	views.batachOp, {'op': 'undis'} ),
	url(r'^batch/delete/$',		views.batachOp, {'op': 'delete'} ),

	url(r'^viewList/$', 		views.themeList ,{'template_name': 'theme/view_list.html'}),
	url(r'^view/(\w+)/$', 		views.view, name="view"),

	url(r'^add/$', 		        views.themeCreate),
)
