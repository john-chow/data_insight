# Create your views here.

from element.models import SubjectModel, SceneModel, WidgetModel, SubToScnRelationModel, ScnToWiRelationModel
from common.tool import cvtDateTimeToStr
from django.http import HttpResponse, HttpResponseRedirect
from django.core.urlresolvers import reverse
from django.db import IntegrityError
from datetime import datetime
from common.tool import MyHttpJsonResponse, GetUniqueIntId
import pdb


def create(request, kind):
	if not request.user.is_authenticated():
		HttpResponseRedirect(reverse('whichdb.showDbForChosen'))

	if u'subject' == kind:	
		Ele, type = SubjectModel, 0
	elif u'scene' == kind:
		Ele, type = SceneModel, 1
	elif u'widget' == kind:
		Ele, type = WidgetModel, 2
	else:
		return MyHttpJsonResponse({
			u'succ': False, u'msg': 'Unkown kind'
		})

	user = request.user.username
	name = request.POST.get(u'name')
	now = datetime.now()
	#id = str(type) + '_' + user + '_' \
					#+ cvtDateTimeToStr(now)
	id = GetUniqueIntId()
	print 'id = %s', id
	

	try:
		Ele.objects.create(
			m_name=name, m_owner=user, m_id=id, m_create_time=now
		)
	except IntegrityError, e:
		return MyHttpJsonResponse({
			u'succ': False, u'msg': 'create new subject fail'
		})

	return MyHttpJsonResponse({
		u'succ': True, u'id': id
	})



def delete(request, kind):
	if u'subject' == kind:	
		Ele = SubjectModel
	elif u'scene' == kind:
		Ele = SceneModel
	elif u'widget' == kind:
		Ele = WidgetModel
	else:
		return MyHttpJsonResponse({
			u'succ': False, u'msg': 'Unkown kind'
		})

	try:
		obj = Ele.objects.get(m_id=request.POST.get(u'id')).delete()
	except IntegrityError, e:
		return MyHttpJsonResponse({
			u'succ': False, u'msg': 'no exist'
		})

	return MyHttpJsonResponse({u'succ': True})




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




def showInfo(request, kind):
	pass








