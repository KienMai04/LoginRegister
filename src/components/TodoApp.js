import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './TodoApp.css';

const TodoApp = ({ userId, onSignOut }) => {
  const [todos, setTodos] = useState([]);
  const [newTask, setNewTask] = useState('');
  const token = 'your-expected-token'; 
  const [editTodoId, setEditTodoId] = useState(null);
  const [editText, setEditText] = useState('');

  const fetchTodos = async () => {
    try {
      console.log('Fetching todos for user:', userId);
      const res = await axios.get(`http://localhost:3500/todos?user=${userId}`, {
        headers: { Authorization: token },
      });
      console.log('Fetched todos:', res.data);
      setTodos(res.data);
    } catch (err) {
      console.error('Error fetching todos:', err);
    }
  };

  const addTodo = async () => {
    if (!newTask.trim()) return;
    try {
      console.log('Adding todo:', newTask);
      const res = await axios.post(
        'http://localhost:3500/todos',
        { text: newTask, userId: userId, done: false },
        { headers: { Authorization: token } }
      );
      console.log('Added todo:', res.data);
      setTodos([...todos, res.data]);
      setNewTask('');
    } catch (err) {
      console.error('Error adding todo:', err.response?.data || err.message);
    }
  };

  const toggleDone = async (id, done) => {
    try {
      console.log(`Toggling todo ${id} done status to:`, !done);
      const res = await axios.put(
        `http://localhost:3500/todos/${id}`,
        { done: !done },
        { headers: { Authorization: token } }
      );
      console.log('Updated todo:', res.data);
      setTodos(todos.map((t) => (t._id === id ? res.data : t)));
    } catch (err) {
      console.error('Error updating todo:', err);
    }
  };

  const deleteTodo = async (id) => {
    try {
      console.log('Deleting todo:', id);
        await axios.delete(`http://localhost:3500/todos/${id}`, {
          headers: { Authorization: token },
        });
      console.log('Deleted todo:', id);
      setTodos(todos.filter((t) => t._id !== id));
    } catch (err) {
      console.error('Error deleting todo:', err);
    }
  };

  const startEdit = (todo) => {
    setEditTodoId(todo._id);
    setEditText(todo.text);
  };

  const cancelEdit = () => {
    setEditTodoId(null);
    setEditText('');
  };

  const saveEdit = async (id) => {
    if (!editText.trim()) return;
    try {
      const res = await axios.put(
        `http://localhost:3500/todos/${id}`,
        { text: editText },
        { headers: { Authorization: token } }
      );
      setTodos(todos.map(t => (t._id === id ? res.data : t)));
      setEditTodoId(null);
      setEditText('');
      console.log('Todo updated:', res.data);
    } catch (err) {
      console.error('Error updating todo:', err);
    }
  };


  useEffect(() => {
    fetchTodos();
  }, []);

  return (
  <div className="todo-container" style={{ position: 'relative', paddingTop: 40 }}>
    <span 
      className="signout-text"
      onClick={() => { console.log('User signed out'); onSignOut();}} 
      title="Sign Out"
    >
      Sign Out
    </span>

    <h2>Todo List</h2>
      
      <div className="todo-input-group">
        <input
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="Enter new task"
        />
        <button onClick={addTodo}>Add</button>
      </div>

      <ul className="todo-list">
        {todos.map((todo) => (
          <li
            key={todo._id}
            className={`todo-item ${todo.done ? 'done' : ''}`}
          >
            <input
              type="checkbox"
              checked={todo.done}
              onChange={() => toggleDone(todo._id, todo.done)}
            />

            {editTodoId === todo._id ? (
              <>
                <input
                  type="text"
                  className="todo-edit-input"
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') saveEdit(todo._id);
                    else if (e.key === 'Escape') cancelEdit();
                  }}
                  autoFocus
                />
                <button className="todo-edit-btn" onClick={() => saveEdit(todo._id)}>Save</button>
                <button className="todo-cancel-btn" onClick={cancelEdit}>Cancel</button>

              </>
            ) : (
              <>
                <span className="todo-text">{todo.text}</span>
                <button onClick={() => startEdit(todo)}>✏️</button>
                <button
                  onClick={() => deleteTodo(todo._id)}
                  className="todo-delete-btn"
                  aria-label="Delete todo"
                >
                  ❌
                </button>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TodoApp;
