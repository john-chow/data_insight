from django.conf.urls import patterns, include, url
from scene import views

urlpatterns = patterns('',
    # Uncomment the next line to enable the admin:
    url(r'^$', 					views.sceneList ,{'template_name': 'scene/list.html'}),
	url(r'^list/$', 			views.sceneList ,{'template_name': 'scene/list.html'}),
	url(r'^batch/$',			views.sceneList ,{'template_name': 'scene/batch.html'}),
	
	url(r'^create/$',			views.sceneCreate),
	url(r'^edit/(\w+)/$',		views.sceneEdit, name='edit'),

	url(r'^distr/$', 			views.sceneOp, {'op': 'dis'}),
	url(r'^delete/$', 			views.sceneOp, {'op': 'delete'}),

	url(r'^batch/distri/$',		views.batachOp, {'op': 'dis'} ),
	url(r'^batch/undistri/$',	views.batachOp, {'op': 'undis'} ),
	url(r'^batch/delete/$',		views.batachOp, {'op': 'delete'} ),
    
    url(r'^view/(\d+)/$',       views.sceneView, name='view'),
    url(r'^viewlist/$',          views.sceneList, {'template_name': 'scene/view_list.html'}),
    url(r'^viewbiglist/$',          views.sceneList, {'template_name': 'scene/view_list.html'}),
)
