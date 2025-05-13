import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash, faCheck } from "@fortawesome/free-solid-svg-icons";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../styles/to-do.css"; 

type Todo = {
    id: number;
    text: string;
    completed: boolean;
};

const TodoApp = () => {
    const [todos, setTodos] = useState<Todo[]>([]);
    const [todoText, setTodoText] = useState("");
    const [filter, setFilter] = useState<"all" | "active" | "completed">("all");
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editText, setEditText] = useState("");
    const MAX_TODO_LENGTH = 20;
    const [isFirstLoad, setIsFirstLoad] = useState(true);

    useEffect(() => {
        const storedTodos = localStorage.getItem("todos");
        if (storedTodos) {
            setTodos(JSON.parse(storedTodos));
        }
        setIsFirstLoad(false); 
    }, []);

    useEffect(() => {
        if (!isFirstLoad) {
            localStorage.setItem("todos", JSON.stringify(todos));
        }
    }, [todos, isFirstLoad]);


    const addTodo = () => {
        const trimmedText = todoText.trim();

        if (trimmedText === "") {
            toast.warning("⚠️ Todo cannot be empty!");
            return;
        }

        if (trimmedText.length > MAX_TODO_LENGTH) {
            toast.error(`❌ Todo cannot exceed ${MAX_TODO_LENGTH} characters.`);
            return;
        }

        const newTodo: Todo = {
            id: Date.now(),
            text: trimmedText,
            completed: false,
        };
        setTodos([...todos, newTodo]);
        setTodoText("");
        toast.success("✅ Todo added successfully!");
    };

    const toggleTodo = (id: number) => {
        setTodos(
            todos.map((todo) =>
                todo.id === id ? { ...todo, completed: !todo.completed } : todo
            )
        );
        toast.info("🔁 Todo completed.");
    };

    const deleteTodo = (id: number) => {
        setTodos(todos.filter((todo) => todo.id !== id));
        toast.error("🗑️ Todo deleted.");
    };

    const startEdit = (id: number, currentText: string) => {
        setEditingId(id);
        setEditText(currentText);
    };

    const saveEdit = (id: number) => {
        const trimmedText = editText.trim();

        // Check for empty todo
        if (trimmedText === "") {
            toast.warning("⚠️ Todo cannot be empty!");
            return;
        }

        // Check todo length
        if (trimmedText.length > MAX_TODO_LENGTH) {
            toast.error(`❌ Todo cannot exceed ${MAX_TODO_LENGTH} characters.`);
            return;
        }

        setTodos(
            todos.map((todo) =>
                todo.id === id ? { ...todo, text: trimmedText } : todo
            )
        );
        setEditingId(null);
        setEditText("");
        toast.success("✏️ Todo updated.");
    };

    const clearCompleted = () => {
        setTodos(todos.filter((todo) => !todo.completed));
        toast("✅ Completed todos cleared.");
    };

    const filteredTodos = todos.filter((todo) => {
        if (filter === "active") return !todo.completed;
        if (filter === "completed") return todo.completed;
        return true;
    });

    return (
        <div className="todo-app">
            <ToastContainer />
            <h1 className="app-title">Pink Planner</h1>
            <div className="container">
                <div className="input-container">
                    <input
                        value={todoText}
                        onChange={(e) => {
                            // Limit input to MAX_TODO_LENGTH characters
                            if (e.target.value.length <= MAX_TODO_LENGTH) {
                                setTodoText(e.target.value);
                            } else {
                                // Optionally show a toast or just prevent typing
                                toast.error(
                                    `Todo cannot exceed ${MAX_TODO_LENGTH} characters.`
                                );
                            }
                        }}
                        placeholder={`Add a new todo`}
                        className="input-field"
                        maxLength={MAX_TODO_LENGTH}
                    />
                    <button onClick={addTodo} className="add-button">
                        Add
                    </button>
                </div>
                <div className="filter-buttons">
                    <button
                        onClick={() => setFilter("all")}
                        className={`filter-button ${
                            filter === "all" ? "active" : ""
                        }`}
                    >
                        All
                    </button>
                    <button
                        onClick={() => setFilter("active")}
                        className={`filter-button ${
                            filter === "active" ? "active" : ""
                        }`}
                    >
                        Active
                    </button>
                    <button
                        onClick={() => setFilter("completed")}
                        className={`filter-button ${
                            filter === "completed" ? "active" : ""
                        }`}
                    >
                        Completed
                    </button>
                </div>

                <ul className="todo-list">
                    {filteredTodos.map((todo) => (
                        <li key={todo.id} className="todo-item">
                            <div className="todo-text">
                                <FontAwesomeIcon
                                    icon={faCheck}
                                    onClick={() => toggleTodo(todo.id)}
                                    className={`icon check-icon ${
                                        todo.completed ? "checked" : ""
                                    }`}
                                    title="Mark as completed"
                                />
                                {editingId === todo.id ? (
                                    <input
                                        value={editText}
                                        onChange={(e) => {
                                            // Limit edit input to MAX_TODO_LENGTH characters
                                            if (
                                                e.target.value.length <=
                                                MAX_TODO_LENGTH
                                            ) {
                                                setEditText(e.target.value);
                                            } else {
                                                toast.error(
                                                    `Todo cannot exceed ${MAX_TODO_LENGTH} characters.`
                                                );
                                            }
                                        }}
                                        onBlur={() => saveEdit(todo.id)}
                                        onKeyDown={(e) =>
                                            e.key === "Enter" &&
                                            saveEdit(todo.id)
                                        }
                                        autoFocus
                                        className="edit-input"
                                        maxLength={MAX_TODO_LENGTH}
                                    />
                                ) : (
                                    <div className="todo-text-wrapper">
                                        <span
                                            className={`todo-text-span ${
                                                todo.completed
                                                    ? "completed"
                                                    : ""
                                            }`}
                                            title={todo.text}
                                        >
                                            {todo.text}
                                        </span>
                                    </div>
                                )}
                            </div>
                            <div className="todo-actions">
                                <FontAwesomeIcon
                                    icon={faEdit}
                                    onClick={() =>
                                        startEdit(todo.id, todo.text)
                                    }
                                    className="icon edit-icon"
                                    title="Edit"
                                />
                                <FontAwesomeIcon
                                    icon={faTrash}
                                    onClick={() => deleteTodo(todo.id)}
                                    className="icon delete-icon"
                                    title="Delete"
                                />
                            </div>
                        </li>
                    ))}
                </ul>
                {todos.some((todo) => todo.completed) && (
                    <button
                        onClick={clearCompleted}
                        className="clear-completed"
                    >
                        Clear completed
                    </button>
                )}
            </div>
        </div>
    );
};

export default TodoApp;