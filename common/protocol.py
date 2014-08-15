# -*-coding: utf-8 -*-

#   
# 定义与前端约定的字段名称
#
#


# 表名称的字段



#########################################
#
# 组件创建或编辑部分
#
########################################

# 组件名字
WidgetName = 'name'

# 所在轴字段名称
Axis = 'axis'

# 该元素的值类别字段的名称
# 0表示是数字列，1表示是文字列，2表示是时间列
Kind = 'kind'

# 数据表名称
Table = 'table'

# 字段的自定义名称
Title = 'title'

# 字段在数据库中的名称
Attr = 'name'

# 字段的运算方式
Func = 'calcFunc'

# 几种计算方式
NoneFunc = 'none'
SumFunc = 'sum'
AvgFunc = 'avg'

# x,y轴上参数
Xaxis = 'x'
Yaxis = 'y'

# 图表类型种类
Graph = 'graph'

# 快照
Snapshot = 'snapshot'

# 颜色区分字段的名称
Color = 'colour'

# 用以进行填充的字段
Fill = 'fill'

# 用来进行大小的字段
Size = 'size'

# 选择器封装
Mapping = 'mapping'

# 样式
Style = 'style'

# 自动更新
Refresh = 'autoRefresh'

# 发布情况
IsPublish = 'isPublish'





'''
过滤器
'''

FilterColumn = 'field'









'''
设置监控器
'''
# operator参数: 
# 大于用'>'，小于用'<'，大于或等于用'>='，小于或等于用'<='
# 在某区间范围用''(就是空的)，不等于用'<>'



#
# 保存组件辅助信息命令
#


# 统一的日期时间格式
DatetimeFormat = '%Y-%m-%d %H:%M:%S'


''' 
数据字段类型
'''
TimeType    = 'T'
NumericType = 'N'
FactorType  = 'F'


'''
标记数据表字段类型
'''
FieldType = 'type'

'''
标记
'''
FieldNickname = 'nickName'


FieldName = 'fieldName'



