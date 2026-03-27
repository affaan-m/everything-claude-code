import pytest
from unittest.mock import Mock, patch
from plugins.database_plugin import DatabasePlugin

class TestDatabasePlugin:
    @patch('plugins.database_plugin.Database')
    def test_constructor_initializes_database(self, mock_db_class):
        mock_db_instance = Mock()
        mock_db_class.return_value = mock_db_instance
        
        plugin = DatabasePlugin('test.db')
        
        mock_db_class.assert_called_once_with('test.db')
        assert plugin.db == mock_db_instance

    @patch('plugins.database_plugin.Database')
    def test_query_executes_sql_with_params(self, mock_db_class):
        mock_db_instance = Mock()
        mock_db_class.return_value = mock_db_instance
        
        plugin = DatabasePlugin('test.db')
        
        # Mock the database all method to return a test result
        mock_db_instance.all.side_effect = lambda sql, params, callback: callback(None, [{'id': 1, 'name': 'John'}])
        
        result = plugin.query('SELECT * FROM users WHERE id = ?', [1])
        
        mock_db_instance.all.assert_called_once_with('SELECT * FROM users WHERE id = ?', [1], pytest.anything())
        assert result == [{'id': 1, 'name': 'John'}]

    @patch('plugins.database_plugin.Database')
    def test_get_user_by_id_returns_user(self, mock_db_class):
        mock_db_instance = Mock()
        mock_db_class.return_value = mock_db_instance
        
        plugin = DatabasePlugin('test.db')
        
        # Mock the database all method to return a test user
        mock_db_instance.all.side_effect = lambda sql, params, callback: callback(None, [{'id': 1, 'name': 'John', 'email': 'john@example.com'}])
        
        result = plugin.getUserById(1)
        
        mock_db_instance.all.assert_called_once_with('SELECT * FROM users WHERE id = ?', [1], pytest.anything())
        assert result == {'id': 1, 'name': 'John', 'email': 'john@example.com'}

    @patch('plugins.database_plugin.Database')
    def test_insert_user_inserts_user_data(self, mock_db_class):
        mock_db_instance = Mock()
        mock_db_instance.all.side_effect = lambda sql, params, callback: callback(None, [{'id': 1}])
        mock_db_class.return_value = mock_db_instance
        
        plugin = DatabasePlugin('test.db')
        
        user_data = {'name': 'John', 'email': 'john@example.com'}
        result = plugin.insertUser(user_data)
        
        mock_db_instance.all.assert_called_once_with('INSERT INTO users (name, email) VALUES (?, ?)', ['John', 'john@example.com'], pytest.anything())
        assert result == [{'id': 1}]

    @patch('plugins.database_plugin.Database')
    def test_update_user_updates_user_data(self, mock_db_class):
        mock_db_instance = Mock()
        mock_db_instance.all.side_effect = lambda sql, params, callback: callback(None, [{'id': 1}])
        mock_db_class.return_value = mock_db_instance
        
        plugin = DatabasePlugin('test.db')
        
        user_data = {'name': 'Jane', 'email': 'jane@example.com'}
        result = plugin.updateUser(1, user_data)
        
        mock_db_instance.all.assert_called_once_with('UPDATE users SET name = ?, email = ? WHERE id = ?', ['Jane', 'jane@example.com', 1], pytest.anything())
        assert result == [{'id': 1}]

    @patch('plugins.database_plugin.Database')
    def test_delete_user_deletes_user(self, mock_db_class):
        mock_db_instance = Mock()
        mock_db_instance.all.side_effect = lambda sql, params, callback: callback(None, [{'id': 1}])
        mock_db_class.return_value = mock_db_instance
        
        plugin = DatabasePlugin('test.db')
        
        result = plugin.deleteUser(1)
        
        mock_db_instance.all.assert_called_once_with('DELETE FROM users WHERE id = ?', [1], pytest.anything())
        assert result == [{'id': 1}]

    @patch('plugins.database_plugin.Database')
    def test_close_closes_database(self, mock_db_class):
        mock_db_instance = Mock()
        mock_db_class.return_value = mock_db_instance
        
        plugin = DatabasePlugin('test.db')
        
        plugin.close()
        
        mock_db_instance.close.assert_called_once()

    @patch('plugins.database_plugin.Database')
    def test_query_handles_error(self, mock_db_class):
        mock_db_instance = Mock()
        mock_db_class.return_value = mock_db_instance
        
        plugin = DatabasePlugin('test.db')
        
        # Mock the database all method to return an error
        mock_db_instance.all.side_effect = lambda sql, params, callback: callback(Exception('Database error'), None)
        
        with pytest.raises(Exception) as exc_info:
            plugin.query('SELECT * FROM users WHERE id = ?', [1])
        
        assert str(exc_info.value) == 'Database error'
