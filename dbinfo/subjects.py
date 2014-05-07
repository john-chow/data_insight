from dbinfo.models import SubjectModel, SceneModel, SubToScnRelationModel
from common.tool import cvtDateTimeToStr


def create(name=u''):
	user = u'xxx'
	now = datetime.now()
	_id = '0_' + self.owner + '_' \
					+ cvtDateTimeToStr(now)

	subject = SubjectModel.objects.create(
		m_name=name, m_owner=user, m_id=_id, m_create_time=now
	)

	return



def getScenesList(sub_id):
	subject = SubjectModel.objects.get(m_id=sub_id)
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


	

