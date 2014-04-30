# --*-- encoding: utf-8 --*--
#Filename:	echart.py
import pdb
from common.head import *


class EChart():
	def __init__(self):
		# 表明是属于serial数组中的属性
		self.serial = {}

		self.option = {
			u'tooltip' : {
				u'show': True
				, u'trigger': 'item'
			}
			, u'toolbox': {
				u'show' : True
				, u'feature': {
					u'mark': {
						u'show': True
					}
					, u'dataView' : {
						u'show': True
						, u'readOnly': False
					}
					, u'magicType' : {
						u'show': True
						, u'type': ['line', 'bar', 'stack', 'tiled']
					}
					, u'restore' : {
						u'show': True
					}
					, u'saveAsImage' : {
						u'show': True
					}
				}
			}
			, u'calculable' : True
			, u'xAxis' : []
			, u'yAxis' : []
			, u'series' : []
		}

	def makeSeriesUnit(self, **args):
		return dict(args.items() + self.serial.items())

				

class Bar_Line_Base(EChart):
	def __init__(self):
		EChart.__init__(self)


	def makeData(self, data_from_db, msu_list, msn_list, group_list):
		# 根据Tableau，能画bar图，至少要有1列measure
		if( len(msu_list) < 1 ):
			raise Exception(u'cant draw %s', self.serial[u'type'])

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
				self.makeSeriesUnit(name=attr_name, data=all_data)
			)
			
		elif (not legend_dict) and iter_axis:
			self.option[u'series'].append(
				self.makeSeriesUnit(name=attr_name, data=all_data[0])
			)

		elif (legend_dict) and (not iter_axis):
			self.option[u'series'] = [ \
				self.makeSeriesUnit(name=le, data=[num]) \
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
					self.makeSeriesUnit(name=le, data=one_legend_list)
				)

		# 判断是否需要填充bar的空白处
		if hasattr(self, u'placed'):
			self.fillPlacehold()

		# 根据echart，无论如何，迭代的轴上必须有属性和data
		if 0 == len(iter_axis):
			iter_axis.append({
				u'type':	u'category'
				, u'data':	['']
			})
			
		return self.option



class Bar(Bar_Line_Base):
	def __init__(self, stacked=False, placed=False):
		Bar_Line_Base.__init__(self)
		self.serial[u'type'] = u'bar'
		if stacked:	
			self.serial[u'stack'] = stacked
		if placed:
			self[u'placed'] = placed


	def fillPlacehold():
		placeHoledStyle = {
			u'normal':{
				u'borderColor':	'rgba(0,0,0,0)',
				u'color':		'rgba(0,0,0,0)'
			},
			u'emphasis':{
				u'borderColor':	'rgba(0,0,0,0)',
				u'color':		'rgba(0,0,0,0)'
			}
		}
		dataStyle = { 
			u'normal': {
				u'label': {
					u'show': 		True,
					u'position': 	u'inside',
					u'formatter': 	u'{c}%'
				}
			}
		}

		series_list 	= self.option.series
		iter_list 		= range(len(series_list)).reverse()
		for i in iter_list:
			series_unit 			= self.option.series[i].copy()
			placehold_data 			= [100 - idx for idx in series_unit.data]
			series_unit.data 		= placehold_data
			series_unit.itemStyle 	= placeHoledStyle
			self.option.series.insert(i+1, series_unit)
			



				
class Line(Bar_Line_Base):
	def __init__(self, stacked=False):
		Bar_Line_Base.__init__(self)
		self.serial[u'type'] = u'line'

class Area(Bar_Line_Base):
	def __init__(self, stacked=False):
		Bar_Line_Base.__init__(self)
		self.serial[u'type'] 		= u'line'
		self.serial[u'smooth'] 		= True
		self.serial[u'itemStyle'] 	= \
				{u'normal': {u'areaStyle': {type: 'default'}}}


class Scatter(EChart):
	def __init__(self):
		EChart.__init__(self)
		self.serial[u'type'] = 'scatter'
		self.option[u'xAxis'] = self.option[u'yAxis'] = [{
			u'type' : 		u'value',
            u'power': 		1,
            u'precision': 	2,
            #u'scale':		True,
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
						, u'type':		self.serial[u'type']
						, u'data':		[ x[:-1] for x in data_from_db if x[-1] == le ]
					})
		else:
			self.option[u'series'] = [{
				u'name':		''
				, u'type':		self.serial[u'type']
				, u'data': 		data_from_db
				#, u'large':		True
			}]

		return self.option



class Pie(EChart):
	def __init__(self):
		EChart.__init__(self)
		self.serial[u'type'] = u'pie'
					
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


class Radar(EChart):
	def __init__(self):
		EChart.__init__(self)
		self.option[u'polar'] = []
		pass

	def makeData(self, data_from_db, msu_list, msn_list, group_list):
		# 画图的条件应该是至少要有1个measure列，2个mension列
		if len(msn_list) < 1 or len(msu_list) < 1:
			raise Exception(u'cant draw radar')
			
		msu_list_len, msn_list_len, group_list_len = map( len, [msu_list, msn_list, group_list] )
		all_list		= msu_list + msn_list + group_list
		all_len 		= len(all_list)

		all_data 		= map(list, zip(*data_from_db))

		for idx in range(all_len -1, -1, -1):
			(attr_name, attr_kind, attr_cmd, attr_axis) = all_list[idx]
			if idx >= all_len - group_list_len:
				legend_data = list(set(all_data[idx]))
				self.option[u'legend'] = {
					u'orient': 	u'vertical',
					u'x': 		u'right',
					u'y': 		u'bottom',
					u'data':	legend_data
				}

			elif idx >= msu_list_len and idx < all_len - group_list_len:
				one_indicator = []
				text_list = list(set(all_data[idx]))
				one_indicator = [ {u'text': t} for t in text_list ]
				self.option[u'polar'].append({
					u'indicator': 	one_indicator
				})

			else:
				# 如果没有legend，也就是没有group的属性
				#if not hasattr(self.option, u'legend'):
				if not u'legend' in self.option.keys():
					self.option[u'series'].append({
						u'type':		u'radar'
						, u'data':		{
							u'value':	all_data[idx]
						}
					})
				else:
					series_unit = {
						u'type':	u'radar'
						, u'data':	[]
					}

					series_data = []
					for le in self.option[u'legend'][u'data']:
						series_data_unit = {
							u'name':	le
						}
						indicator_list = self.option[u'polar'][0][u'indicator']
						series_data_unit[u'value'] = [value for d in indicator_list \
														for (value, attr, group) in data_from_db \
															if le == group and attr == d[u'text']]
						series_data.append(series_data_unit)

					self.option[u'series'].append({
						u'type':		u'radar'
						, u'data':		series_data
					})

				# 添加max值进去		TBD
				

		return self.option



class Map(EChart):
	def __init__(self):
		EChart.__init__(self)
		self.serial[u'type'] 	= u'map'

	def makeData(self, data_from_db, msu_list, msn_list, group_list):
		self.option[u'series'].append( \
			self.makeSeriesUnit() \
		)

		return self.option
		


class ChinaMap(Map):
	def __init__(self):
		Map.__init__(self)
		self.serial[u'mapType'] 	= u'china'
		self.serial[u'itemStyle'] 	= {
			u'normal':		{u'label': {u'show':True}},
            u'emphasis':	{u'label': {u'show':True}}
		}
		self.serial[u'data'] = []
			
			
class WorldMap(Map):
	def __init__(self):
		pass



class EChartManager():
	def __init__(self):
		pass

	def get_echart(self, shape=u'bar'):
		if u'bar' == shape: 
			return Bar()

		elif u'stack_bar' == shape:
			return Bar(stacked=True)

		elif u'placehold_bar' == shape:
			return Bar(placed=True)

		elif u'line' == shape:
			return Line()

		elif u'stack_line' == shape:
			return Line(stacked=True)

		elif u'area' == shape:
			return Area()

		elif u'stack_area' == shape:
			return Area(stacked=True)

		elif u'scatter' == shape:
			return Scatter()

		elif u'pie' == shape:
			return Pie()

		elif u'radar' == shape:
			return Radar()
		
		elif u'china_map' == shape:
			return ChinaMap()

		else:
			raise Exception(u'Unknown pictrue shape')



