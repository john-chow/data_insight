# --*-- encoding: utf-8 --*--
#Filename:	echart.py
import pdb
from common.head import *

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




class Bar(EChart):
	def __init__(self):
		EChart.__init__(self)
		self.shape = u'bar'

	def makeData(self, data_from_db, attr_list):
		# echart 最多处理 1*2，至少一列是文字列，一列是数字列。
		# 最后一列如果存在，也必须是文字列
		if( len(attr_list) > 3):
			raise Exception(u'1234213515')

		all_data = map( list, zip(*data_from_db) )

		has_iter = False
		for idx, (attr_name, attr_kind, attr_axis) in enumerate(attr_list):
			if HAVE_PDB: 	pdb.set_trace()
			if (0 == attr_kind) and (not has_iter):
				this_iters = list( set(all_data[idx]) )
				this_axis = {u'type': 'category', u'data': this_iters}
				option_axis = self.option[u'xAxis'] if u'col' == attr_axis \
														else self.option[u'yAxis']
				option_axis.append(this_axis)
				has_iter = True

			elif (0 == attr_kind) and has_iter:
				this_attrs = list( set(all_data[idx]) )
				for one_attr in this_attrs:
					self.option[u'legend'][u'data'].append(one_attr)
					one_legend_list = []
					for one_iter in this_iters:
						[one_value] = [ value for (value, x, y) in data_from_db if \
											x == one_iter and y == one_attr ]
						one_legend_list.append(one_value)

					self.option[u'series'].append({
						u'name': 	one_attr
						, u'type': 	'bar'
						, u'data': 	one_legend_list
					})
			else: 
				this_data = all_data[idx]
				this_axis = {
					u'type': 'value'
					, u'splitArea': {u'show' : True}
				}
				option_axis = self.option[u'xAxis'] if u'col' == attr_axis \
														else self.option[u'yAxis']
				option_axis.append(this_axis)
				self.option[u'series'].append({
					u'name': 	attr_name
					, u'type': 	'bar'
					, u'data': 	this_data
				})
			
		return self.option
				
			
				
class Line(EChart):
	def __init__(self):
		EChart.__init__(self)
		self.shape = u'line'


