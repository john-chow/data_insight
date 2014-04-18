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
		for idx, (attr_name, attr_kind, attr_cmd, attr_axis) in enumerate(attr_list):
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

	def makeData(self, data_from_db, attr_list):
		# echart 最多处理 1*2，至少一列是文字列，一列是数字列。
		# 最后一列如果存在，也必须是文字列
		if( len(attr_list) > 3):
			raise Exception(u'1234213515')

		all_data = map( list, zip(*data_from_db) )

		has_iter = False
		for idx, (attr_name, attr_kind, attr_cmd, attr_axis) in enumerate(attr_list):
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
						[one_value] = [ value for (value, x, y) in data_from_db \
											if x == one_iter and y == one_attr ]
						one_legend_list.append(one_value)

					self.option[u'series'].append({
						u'name': 	one_attr
						, u'type': 	'line'
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
					, u'type': 	'line'
					, u'data': 	this_data
				})

		return self.option



class Scatter(EChart):
	def __init__(self):
		EChart.__init__(self)
		self.shape = 'scatter'
	
	def makeData(self, data_from_db, attr_list):
		# echart 最多处理 1*2，至少2列数字列
		# 至多有3列，第3列可以是文字也可以是数字，做分类用

		if len(attr_list) < 2 or len(attr_list) > 3:
			raise Exception(u'make data in scatter error')

		all_data = map( list, zip(*data_from_db) )
		has_value_axis = 0

		if 2 == len(attr_list):
			for idx, (attr_name, attr_kind, attr_cmd, attr_axis) in enumerate(attr_list):
				option_axis = self.option[u'xAxis'] if u'col' == attr_axis \
														else self.option[u'yAxis']
				option_axis.append({
					u'type': 'value',
					u'power': 1,
					u'precision': 2,
					u'scale':True,
					u'axisLabel': {
						u'formatter': '{value}'
					}
				})

			self.option[u'series'].append({
				u'type':	'scatter'
				, u'data':	[ list(i) for i in data_from_db ]
			})

		elif 3 == len(attr_list):
			for idx, (attr_name, attr_kind, attr_cmd, attr_axis) in enumerate(attr_list):
				if HAVE_PDB: 	pdb.set_trace()

				if 1 == attr_kind and has_value_axis < 2:
					option_axis = self.option[u'xAxis'] if u'col' == attr_axis \
															else self.option[u'yAxis']
					option_axis.append({
						u'type': 'value',
						u'power': 1,
						u'precision': 2,
						u'scale':True,
						u'axisLabel': {
							u'formatter': '{value}'
						}
					})
					has_value_axis += 1
				else:
					this_legends = list( set(all_data[idx]) )
					for legend in this_legends:
						one_legend_data = [ [m, n] for (m, n, p) in data_from_db if p == legend ]
						self.option[u'series'].append({
							u'name':	legend
							, u'type':	'scatter'
							, u'data':	one_legend_data
						})	
						self.option[u'legend'][u'data'].append(legend)

		return self.option


class Pie(EChart):
	def __init__(self):
		EChart.__init__(self)
		self.shape = u'pie'
					
	def makeData(self, data_from_db, attr_list):
		if 2 != len(attr_list):
			raise Exception(u'cant draw pie')

		(attr_name, attr_kind, attr_cmd, attr_axis) = attr_list[0]

		if 'rgl' == attr_cmd:
			legend_idx, value_idx = 0, 1
		else:
			legend_idx, value_idx = 1, 0

		legend_data = [ data[legend_idx] for data in data_from_db ]
		self.option[u'legend'][u'data'].append(legend_data)
		self.option[u'legend'][u'x'] = u'left'

		self.option[u'series'].append({
			u'name': attr_list[legend_idx][0]
			, u'type': u'pie'
			, u'radius': u'55%'
			, u'center': ['50%', 225]
			, u'data': [ {u'value': i, u'name': j} for (i, j) in data_from_db ]
		})

		return self.option



