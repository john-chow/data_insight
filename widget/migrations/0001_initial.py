# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('skin', '__first__'),
        ('mould', '__first__'),
    ]

    operations = [
        migrations.CreateModel(
            name='ExternalDbModel',
            fields=[
                ('m_hk', models.IntegerField(serialize=False, primary_key=True)),
                ('m_kind', models.CharField(default='postgres', max_length=20)),
                ('m_ip', models.IPAddressField()),
                ('m_port', models.IntegerField(default=5432)),
                ('m_user', models.CharField(max_length=20)),
                ('m_pwd', models.CharField(max_length=20)),
                ('m_db', models.CharField(max_length=20)),
            ],
            options={
                'db_table': 'externaldb',
            },
        ),
        migrations.CreateModel(
            name='WidgetModel',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('m_name', models.CharField(unique=True, max_length=20, db_column=b'name')),
                ('m_owner', models.CharField(max_length=20, db_column=b'owner')),
                ('m_create_time', models.DateTimeField(auto_now_add=True, db_column=b'create_time')),
                ('m_is_distributed', models.BooleanField(default=False, db_column=b'is_distributed')),
                ('m_status', models.BooleanField(default=True, db_column=b'status')),
                ('m_table', models.CharField(max_length=50, db_column=b'table')),
                ('m_x', models.CharField(max_length=1024, db_column=b'x')),
                ('m_y', models.CharField(max_length=1024, db_column=b'y')),
                ('m_size', models.CharField(max_length=200, db_column=b'size')),
                ('m_color', models.CharField(max_length=200, db_column=b'color')),
                ('m_graph', models.CharField(max_length=16, db_column=b'graph', choices=[(b'bar', b'bar'), (b's_bar', b'stack_bar'), (b'line', b'line'), (b's_line', b'stack_line'), (b'area', b'area'), (b's_area', b's_area'), (b'scatr', b'scatter'), (b'radar', b'radar'), (b'map', b'map')])),
                ('m_refresh', models.CharField(default=b'No', max_length=8)),
                ('m_pic', models.TextField(db_column=b'snapshot')),
                ('m_filter', models.CharField(max_length=1024, db_column=b'filter')),
                ('m_order', models.CharField(max_length=200, db_column=b'order')),
                ('m_merges', models.CharField(max_length=16, db_column=b'merges')),
                ('m_external_db', models.ForeignKey(to='widget.ExternalDbModel')),
                ('m_mould', models.ForeignKey(related_name='m_used_by_set', to='mould.MouldModel', null=True)),
                ('m_skin', models.ForeignKey(db_column=b'skin', to='skin.SkinModel', null=True)),
            ],
            options={
                'db_table': 'widgets',
            },
        ),
    ]
