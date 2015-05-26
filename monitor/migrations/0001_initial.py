# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
from django.conf import settings


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('widget', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='EventModel',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('m_name', models.CharField(max_length=20, db_column=b'name')),
                ('m_table', models.CharField(max_length=20, db_column=b'table')),
                ('m_left_factor', models.CharField(max_length=200, db_column=b'object')),
                ('m_operator', models.CharField(max_length=10, db_column=b'operator')),
                ('m_right_factor', models.CharField(max_length=200, db_column=b'threshold')),
                ('m_alarm_kind', models.IntegerField(db_column=b'alarm')),
                ('m_conn_db', models.ForeignKey(to='widget.ExternalDbModel')),
                ('m_creator', models.ForeignKey(to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'db_table': 'event',
            },
        ),
        migrations.CreateModel(
            name='WarningModel',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('m_result', models.CharField(max_length=20, db_column=b'result')),
                ('m_if_notify', models.BooleanField(default=False, db_column=b'ifnotify')),
                ('m_event', models.ForeignKey(to='monitor.EventModel', db_column=b'event_id')),
            ],
            options={
                'db_table': 'warning',
            },
        ),
    ]
