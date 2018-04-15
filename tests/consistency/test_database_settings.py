#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import sys
import re

if sys.version_info[0] < 3:
    raise Exception("Python 3 only")

from ..util import get_db_connection

class TestDatabaseSettings(object):
    @classmethod
    def setUpClass(self):
        self.db = get_db_connection()

    @classmethod    
    def tearDownClass(self):
        pass
    
    def test_fulltext_index_settings(self):
        """Check that we have the right minimum word size for fulltext indexes"""
        db_cursor = self.db['connection'].cursor()
        db_cursor.execute("SELECT @@GLOBAL.innodb_ft_min_token_size")
        innodb_ft_min_token_size = db_cursor.fetchone()[0]
        self.db['connection'].commit() #need to commit here otherwise next select returns stale data
        assert innodb_ft_min_token_size <= 3, "innodb_ft_min_token_size should be 3 characters max for decent search results"
        db_cursor.close()
        
        
    def test_full_unicode_for_vernaculars(self):
        """Vernacular names (which include chinese etc) should be full 4 byte unicode"""
        check_table_colname = { #the list of table:colname to check for identity
            'vernacular_by_ott': 'vernacular', 
            'vernacular_by_name':'vernacular',
            }
        name_info = {}
        
        for table, colname in check_table_colname.items():
            db_cursor = self.db['connection'].cursor()
            db_cursor.execute("SELECT character_set_name FROM information_schema.`COLUMNS` WHERE table_schema = SCHEMA() AND table_name = '{}' AND column_name = '{}';".format(table, colname))
            name_info[table+"-"+colname] = db_cursor.fetchone()
            self.db['connection'].commit() #need to commit here otherwise next select returns stale data
        db_cursor.close()
        for k,v in name_info.items():
            assert v[0] == "utf8mb4", "vernacular columns should be full 4 byte unicode"       
    
    def test_name_indexes_use_same_charset(self):
        """
        Check the 'name' columns in e.g. vernacular_by_name & ordered_leaves have identical charsets
        Since these are used as unique matching keys, having different charsets can drastically slow down search,
        which has caused problems in the past
        """
        
        check_table_colname = { #the list of table:colname to check for identity
            'ordered_leaves': 'name', 
            'ordered_nodes': 'name',
            'vernacular_by_name':'name',
            'images_by_name':'name',
            }
        name_info = {}
        
        for table, colname in check_table_colname.items():
            db_cursor = self.db['connection'].cursor()
            db_cursor.execute("SELECT character_set_name, column_type FROM information_schema.`COLUMNS` WHERE table_schema = SCHEMA() AND table_name = '{}' AND column_name = '{}';".format(table, colname))
            name_info[table+"-"+colname] = db_cursor.fetchone()
            self.db['connection'].commit() #need to commit here otherwise next select returns stale data
        db_cursor.close()

        for k,v in name_info.items():
            m = re.match(r'varchar\((\d+)\)', v[1])
            assert m, "Table-column {} must be of type varchar, but is {}".format(k, v[1])
            assert int(m.group(1)) < 200, "Table-column {} is of length {} but should be less than {} ({}), to allow mb4 indexing (see {})".format(
                k, 767/4, "767/4", v[1], "https://dev.mysql.com/doc/refman/5.7/en/innodb-restrictions.html")
                
                
        test_charset = None
        ni = None
        for k,v in name_info.items():
            if test_charset is None or ni is None:
                test_charset = v[0]
                ni = k
            else:
                assert v[0] == test_charset, "Table-column {} (charset '{}') is different to {} (charset '{}')".format(
                    k, v[0], ni, test_charset)