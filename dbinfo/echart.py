# --*-- encoding: utf-8 --*--
#Filename:	echart.py
import pdb
from common.head import *


class EChartManager():
	def __init(self):
		pass

	def get_echart(self, shape=u'bar'):
		if u'bar' == shape: 
			return Bar()

		elif u'stack_bar' == shape:
			return Bar(stacked=True)

		elif u'line' == shape:
			return Line()

		elif u'stack_line' == shape:
			return Line(stacked=True)

		elif u'scatter' == shape:
			return Scatter()

		elif u'pie' == shape:
			return Pie()

		else:
			raise Exception(u'Unknown pictrue shape')





class EChart():
	def __init__(self):
		self.option = {
			u'tooltip' : {
				u'show': True
				, u'trigger': 'item'
			},
			u'legend': {
				u'data':[]
			},
			u'toolbox': {
				u'show' : True,
				u'feature': {
					u'mark': {
						u'show': True
					},
					u'dataView' : {
						u'show': True
						, u'readOnly': False
					},
					u'magicType' : {
						u'show': True
						, u'type': ['line', 'bar', 'stack', 'tiled']
					},
					u'restore' : {
						u'show': True
					},
					u'saveAsImage' : {
						u'show': True
					}
				}
			},
			u'calculable' : True,
			u'xAxis' : [],
			u'yAxis' : [],
			u'series' : []
		}

	def make_series_unit(self, name=u'', data=[]):
		unit = {
			u'type':		self.shape
			, u'data':		data
		}

		if name:
			unit[u'name'] 	= name
		if hasattr(self, u'stack') and self.stack:
			unit[u'stack'] 	= self.stack

		return unit

				

class Bar_Line_Base(EChart):
	def __init__(self):
		EChart.__init__(self)

	def makeData(self, data_from_db, msu_list, msn_list, group_list):
		# 根据Tableau，能画bar图，至少要有1列measure
		if( len(msu_list) < 1 ):
			raise Exception(u'cant draw %s' , self.shape)

		all_list = msu_list + msn_list + group_list
		all_len, msu_len, msn_len, group_len = \
						len(all_list), len(msu_list), len(msn_list), len(group_list)

		all_data = map( list, zip(*data_from_db) )

		# 产生从[length-1, ..., 0]的数字
		legend_dict, iter_axis, val_axis = {}, [], []
		
		if HAVE_PDB: 	pdb.set_trace()

		for idx in range(all_len -1, -1, -1):
			(attr_name, attr_kind, attr_cmd, attr_axis) = all_list[idx]
			if idx > msu_len + msn_len - 1:
				group_iter_list = list( set(all_data[idx]) )
				legend_dict = self.option[u'legend'] = {
					u'data':	group_iter_list
				}
				group_iter_idx = idx

			elif idx > msu_len - 1 and idx < msu_len + msn_len:
				iter_axis = self.option[u'xAxis'] if u'col' == attr_axis \
														else self.option[u'yAxis']
				option_type = u'category' if 0 == attr_kind else u'value'
				attr_iter_list = list( set(all_data[idx]) )
				iter_axis.append({
					u'type':	option_type
					, u'data':	attr_iter_list
				})

			else:
				(iter_axis, val_axis) = ( self.option[u'yAxis'], self.option[u'xAxis'] ) \
														if u'col' == attr_axis else \
											( self.option[u'xAxis'], self.option[u'yAxis'] )

				option_type = u'category' if 0 == attr_kind else u'value'
				val_axis.append({
					u'type':	option_type
				})


		if (not legend_dict) and (not iter_axis):
			self.option[u'series'].append(
				self.make_series_unit(name=attr_name, data=all_data)
			)
			
		elif (not legend_dict) and iter_axis:
			self.option[u'series'].append(
				self.make_series_unit(name=attr_name, data=all_data[0])
			)

		elif (legend_dict) and (not iter_axis):
			self.option[u'series'] = [ \
				self.make_series_unit(name=le, data=[num]) \
				for (num, le) in data_from_db \
			]
			
		else:
			for le in legend_dict[u'data']:
				one_legend_list = []
				for tmp_attr in iter_axis[0][u'data']:
					[one_value] = [ value for (value, attr, group) in data_from_db if \
										attr == tmp_attr and group == le ]
					one_legend_list.append(one_value)

				self.option[u'series'].append(
					self.make_series_unit(name=le, data=one_legend_list)
				)

		# 根据echart，无论如何，迭代的轴上必须有属性和data
		if 0 == len(iter_axis):
			iter_axis.append({
				u'type':	u'category'
				, u'data':	['']
			})
			
		return self.option



class Bar(Bar_Line_Base):
	def __init__(self, stacked=False):
		Bar_Line_Base.__init__(self)
		self.shape = u'bar'
		self.stack = stacked


				
class Line(Bar_Line_Base):
	def __init__(self):
		Bar_Line_Base.__init__(self)
		self.shape = u'line'



class Scatter(EChart):
	def __init__(self):
		EChart.__init__(self)
		self.shape = 'scatter'
		self.option[u'xAxis'] = self.option[u'yAxis'] = [{
			u'type' : 		u'value',
            u'power': 		1,
            u'precision': 	2,
            u'scale':		True,
            u'axisLabel' : {
                u'formatter': '{value}'
            },
            u'splitArea': 	{u'show': True}
		}]

	def makeData(self, data_from_db, msu_list, msn_list, group_list):
		# 条件是至少2个数字列
		num_list = [ kind for (_, kind, _, _) in (msu_list + msn_list) if 1 == kind ] 
		if num_list < 2:
			raise Exception(u'cant draw scatter')

		if 0 < len(group_list):
			all_data = map( list, zip(*data_from_db) )
			for idx in range( len(group_list) ):
				self.option[u'legend'] = legend_list = list( set(all_data[ len(msn_list) + idx ]) )
				for le in legend_list:
					self.option[u'series'].append({
						u'name':	le
						, u'type':		self.shape
						, u'data':		[ x[:-1] for x in data_from_db if x[-1] == le ]
					})
		else:
			self.option[u'series'] = [{
				u'name':		''
				, u'type':		self.shape
				, u'data': 		data_from_db
				, u'large':		True
			}]

		return self.option



class Pie(EChart):
	def __init__(self):
		EChart.__init__(self)
		self.shape = u'pie'
					
	def makeData(self, data_from_db, msu_list, msn_list, group_list):
		if len(msu_list) < 1 or len(msn_list) < 1:
			raise Exception(u'cant draw pie')

		if 0 < len(group_list):
			raise Exception(u'cant have color mark')

		for idx, (attr_name, attr_kind, attr_cmd, attr_axis) in enumerate(msn_list):
			self.option[u'legend'] = {
				u'orient': 		u'vertical',
        		u'x': 			u'left',
				u'data':		list( set(data_from_db[idx + len(msu_list)] ) )
			}
			
		self.option[u'series'].append({
			u'name': 		u''
			, u'type': 		u'pie'
			, u'radius': 	u'55%'
			, u'center': 	['50%', 225]
			, u'data': 		[ {u'value': i, u'name': j} for (i, j) in data_from_db ]
		})

		return self.option



