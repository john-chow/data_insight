from django.conf.urls import patterns, include, url
from scene import views

urlpatterns = patterns('',
    # Uncomment the next line to enable the admin:
    url(r'^$', 			views.sceneList),
	url(r'^list/$', 	views.sceneList),
	url(r'^create/$', 	views.sceneCreate),
	url(r'^delete/$', 	views.sceneDelete),
	url(r'^edit/$', 	views.sceneEdit),
)
