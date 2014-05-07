# Create your views here.

from element.models import SubjectModel, SceneModel, SubToScnRelationModel
from common.tool import cvtDateTimeToStr
from django.http import HttpResponse, HttpResponseRedirect
import pdb


def reqCreate(request, kind):
	pdb.set_trace()
	if u'subject' == kind:
		return createSubject(request)



def createSubject(request):
	user = u'xxx'
	now = datetime.now()
	_id = '0_' + self.owner + '_' \
					+ cvtDateTimeToStr(now)

	try: 
		subject = SubjectModel.objects.create(
			m_name=name, m_owner=user, m_id=_id, m_create_time=now
		)
	except IntegrityError, e:
		raise Exception(u'create new subject fail')

	data = {
		u'succ':	True
	}
	return MyHttpJsonResponse(data)


def getScenesList(sub_id):
	try:
		subject = SubjectModel.objects.get(m_id=sub_id)
	except SubjectModel.DoesNotExist:
		raise Exception(u'Cant find subject, id = %s'.format(sub_id))

	scenes = subject.scenemodel_set.all()
	aaa = scenes.values()


	
def addScene(sub_id, scn_id):
	scn = SceneModel.objects.get(m_id=scn_id)
	sub = SubjectModel.objects.get(m_id=sub_id)
	sub.scenemodel_set.add(m_scn)
	sub.save()


def rmScene(sub_id, scn_id):
	scn = SceneModel.objects.get(m_id=scn_id)
	sub = SubjectModel.objects.get(m_id=sub_id)
	sub.scenemodel_set.remove(m_scn)
	sub.save()


def showInfo(request, kind):
	pass


