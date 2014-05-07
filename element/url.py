from django.conf.urls import patterns, url
from element import views


urlpatterns = patterns('',
	url( r'^create/$', 			views.createSubject),
	url( r'^delete/$', 			views.rmScene),
	url( r'^add/$', 			views.addScene),
	url( r'^scenes/$', 			views.getScenesList),
	url( r'^$', 				views.showInfo)
)
