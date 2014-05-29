from django.conf.urls import patterns, include, url
from scene import views

urlpatterns = patterns('',
    # Uncomment the next line to enable the admin:
    url(r'^$', 					views.sceneList ,{'template_name': 'scene/list.html'}),
	url(r'^list/$', 			views.sceneList ,{'template_name': 'scene/list.html'}),
	url(r'^batch/$',			views.sceneList ,{'template_name': 'scene/batch.html'}),
	
	url(r'^create/$', 	    views.sceneCreate),
	url(r'^delete/$', 	    views.sceneDelete),
	url(r'^edit/(\w+)/$', 	views.sceneEdit),

	
)
