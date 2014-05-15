# -*- coding: utf-8 -*-

from scene.models import SceneModel, ScnToWiRelationModel
from common.tool import cvtDateTimeToStr
from django.http import HttpResponse, HttpResponseRedirect
from django.core.urlresolvers import reverse
from django.db import IntegrityError
from datetime import datetime
from common.tool import MyHttpJsonResponse, GetUniqueIntId
from django.template import RequestContext, Template
from django.shortcuts import render_to_response
import pdb

def sceneList(request):
	"""
	场景列表
	"""
	now = datetime.now()
	data = {
			'now':				now
	}
	context = RequestContext(request)
	return render_to_response('scene/list.html', data, context)

def sceneCreate(request):
	"""
	创建场景
	"""
	if not request.user.is_authenticated():
		HttpResponseRedirect(reverse('widget.showDbForChosen'))
	user = request.user.username
	name = request.POST.get(u'name')
	now = datetime.now()
	id = GetUniqueIntId()
	print 'id = %s', id
	

	try:
		SceneModel.objects.create(
			m_name=name, m_owner=user, m_id=id, m_create_time=now
		)
	except IntegrityError, e:
		return MyHttpJsonResponse({
			u'succ': False, u'msg': 'create new subject fail'
		})

	return MyHttpJsonResponse({
		u'succ': True, u'id': id
	})

def sceneDelete(request):
	"""
	删除场景
	"""
	try:
		obj = SceneModel.objects.get(m_id=request.POST.get(u'id')).delete()
	except IntegrityError, e:
		return MyHttpJsonResponse({
			u'succ': False, u'msg': 'no exist'
		})
	return MyHttpJsonResponse({u'succ': True})

def sceneEdit(request):
	"""
	编辑场景
	"""
	pass


"""
def getScenesList(sub_id):
	try:
		subject = SubjectModel.objects.get(m_id=sub_id)
	except SubjectModel.DoesNotExist:
		raise Exception(u'Cant find subject, id = %s'.format(sub_id))

	scenes = subject.m_scenes.all()
	aaa = scenes.values()
	return MyHttpJsonResponse({u'succ': True, u'data': aaa})


	
def addScene(request, kind):
	sub_id, scn_id = map(lambda x: request.POST.get(x), ['sub_id', 'scn_id'])
	try:
		sub = SubjectModel.objects.get(m_id=sub_id)
		scn = SceneModel.objects.get(m_id=scn_id)
		SubToScnRelationModel.objects.create(
			m_sub=sub, m_scn=scn, m_order=request.POST.get(u'order')
		)
	except IntegrityError, e:
		return MyHttpJsonResponse({
			u'succ': False, u'msg': 'no exist'
		})

	return MyHttpJsonResponse({u'succ': True})



def rmScene(request, kind):
	sub_id, scn_id = map(lambda x: request.POST.get(x), ['sub_id', 'scn_id'])
	try:
		sub = SubjectModel.objects.get(m_id=sub_id)
		scn = SceneModel.objects.get(m_id=scn_id)
		SubToScnRelationModel.objects.get(
			m_sub=sub, m_scn=scn
		).delete()
	except IntegrityError, e:
		return MyHttpJsonResponse({
			u'succ': False, u'msg': 'no exist'
		})

	return MyHttpJsonResponse({u'succ': True})


def orderScenes(request):
	sub_id = request.POST.get(u'sub_id')
	scns_id_order_dict = request.POST.get(u'orders')

	try:
		sub = SubjectModel.objects.get(m_id=sub_id)
		for scn_id, order_number in scns_id_order_dict.items():
			scn = SceneModel.objects.get(m_id=scn_id)
			relation = SubToScnRelationModel.objects.get(
				m_sub = sub, m_scn = scn
			)
			relation.save(order = order_number)
	except Exception, e:
		pass

	return MyHttpJsonResponse({u'succ': True})
"""
