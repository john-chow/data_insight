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
            name='FieldsInfoModel',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('m_table', models.CharField(max_length=100, db_column=b'table')),
                ('m_nicknames', models.CharField(max_length=300, db_column=b'nicknames')),
                ('m_types', models.CharField(max_length=300, db_column=b'types')),
                ('m_conn', models.ForeignKey(to='widget.ExternalDbModel', db_column=b'conn')),
                ('m_user', models.ForeignKey(to=settings.AUTH_USER_MODEL, db_column=b'user')),
            ],
        ),
    ]
