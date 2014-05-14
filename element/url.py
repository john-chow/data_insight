from django.conf.urls import patterns, url
from element import views


urlpatterns = patterns('',
	url( r'^create/$', 			views.create),
	url( r'^delete/$', 			views.delete),

	url( r'^widget/list/$', 	views.widgetList),
	url( r'^theme/list/$', 		views.themeList),
	url( r'^scene/list/$', 		views.sceneList),

	url( r'^add_scene/$', 		views.addScene),
	url( r'^rm_scene/$', 		views.rmScene),
	url( r'^scenes/$', 			views.getScenesList),
	url( r'^$', 				views.showInfo)
)
