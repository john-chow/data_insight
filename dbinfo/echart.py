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

	def makeData(self, data_from_db, msu_list, msn_list, group_list):
		# 根据Tableau，能画bar图，至少要有1列measure
		if( len(msu_list) < 1 ):
			raise Exception(u'cant draw bar')

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
			self.option[u'series'].append({
				u'name':		attr_name
				, u'type':		u'bar'
				, u'stack': 	u'总量'
				, u'data':		all_data
			})
		elif (not legend_dict) and iter_axis:
			self.option[u'series'].append({
				u'name':		attr_name
				, u'type':		u'bar'
				, u'stack': 	u'总量'
				, u'data':		all_data[0]
			})
		elif (legend_dict) and (not iter_axis):
			self.option[u'series'] = [{
					u'name':		le
					, u'type':		u'bar'
					, u'stack': 	u'总量'
					, u'data':		[num]
				} for (num, le) in data_from_db
			]
		else:
			for le in legend_dict[u'data']:
				one_legend_list = []
				for tmp_attr in iter_axis[0][u'data']:
					[one_value] = [ value for (value, attr, group) in data_from_db if \
										attr == tmp_attr and group == le ]
					one_legend_list.append(one_value)

				self.option[u'series'].append({
					u'name': 	le
					, u'type': 	u'bar'
					, u'stack': u'总量'
					, u'data': 	one_legend_list
				})

		# 根据echart，无论如何，迭代的轴上必须有属性和data
		if 0 == len(iter_axis):
			iter_axis.append({
				u'type':	u'category'
				, u'data':	['']
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



