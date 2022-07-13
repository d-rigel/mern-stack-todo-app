import { useState, useEffect, useCallback } from "react";
import makeStyles from "@mui/styles/makeStyles";
import {
  Container,
  Typography,
  Button,
  Icon,
  Paper,
  Box,
  TextField,
} from "@mui/material";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

import TodoItems from "./components/TodoItems";
import { read } from "./api/todos";

const useStyles = makeStyles({
  addTodoContainer: { padding: 10 },
  addTodoButton: { marginLeft: 5 },
  todosContainer: {
    marginTop: 10,
    padding: 10,
    height: 700,
    overflow: "hidden",
    overflowY: "scroll",
  },
  todoContainer: {
    borderTop: "1px solid #bfbfbf",
    marginTop: 5,
    "&:first-child": {
      margin: 0,
      borderTop: "none",
    },
    "&:hover": {
      "& $deleteTodo": {
        visibility: "visible",
      },
    },
  },
  todoTextCompleted: {
    textDecoration: "line-through",
  },
  deleteTodo: {
    visibility: "hidden",
  },
});

function Todos() {
  const classes = useStyles();
  const [todos, setTodos] = useState([]);
  const [newTodoText, setNewTodoText] = useState("");
  const [skip, setSkip] = useState(0);
  const [isEnd, setIsEnd] = useState(false);

  useEffect(() => {
    fetchTodos();
  }, [skip, setTodos]);

  const fetchTodos = async () => {
    try {
      const data = await read(skip);

      if (data?.length === 0) {
        setIsEnd(true);
        return;
      }
      //success
      setTodos([...todos, ...data]);
    } catch (error) {
      console.log(error.message);
    }
  };

  const handleScroll = (e) => {
    const { offsetHeight, scrollTop, scrollHeight } = e.target;

    if (offsetHeight + scrollTop >= scrollHeight) {
      setSkip(todos?.length);
    }
  };

  const moveTodos = useCallback((dragIndex, hoverIndex) => {
    const dragItem = todos[dragIndex];
    const hoverItem = todos[hoverIndex];
    fetch(`http://localhost:3001/${dragItem.id}`, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      method: "PUT",
      body: JSON.stringify({
        index: hoverIndex,
      }),
    });
    fetch(`http://localhost:3001/${hoverItem.id}`, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      method: "PUT",
      body: JSON.stringify({
        index: dragIndex,
      }),
    });
    // Swap places of dragItem and hoverItem in the todos array
    setTodos((todos) => {
      const updatedTodos = [...todos];
      updatedTodos[dragIndex] = hoverItem;
      updatedTodos[hoverIndex] = dragItem;
      return updatedTodos;
    });
  });

  function addTodo(text) {
    fetch("http://localhost:3001/", {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify({ text }),
    })
      .then((response) => response.json())
      .then((todo) => setTodos([...todos, todo]));
    setNewTodoText("");
  }

  function toggleTodoCompleted(id) {
    fetch(`http://localhost:3001/${id}`, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      method: "PUT",
      body: JSON.stringify({
        completed: !todos.find((todo) => todo.id === id).completed,
      }),
    }).then(() => {
      const newTodos = [...todos];

      const modifiedTodoIndex = newTodos.findIndex((todo) => todo.id === id);
      newTodos[modifiedTodoIndex] = {
        ...newTodos[modifiedTodoIndex],
        completed: !newTodos[modifiedTodoIndex].completed,
      };

      setTodos(newTodos);
    });
  }

  function deleteTodo(id) {
    fetch(`http://localhost:3001/${id}`, {
      method: "DELETE",
    }).then(() => setTodos(todos.filter((todo) => todo.id !== id)));
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <Container maxWidth="md">
        <Typography variant="h3" component="h1" gutterBottom>
          Todos
        </Typography>
        <Paper className={classes.addTodoContainer}>
          <Box display="flex" flexDirection="row">
            <Box flexGrow={1}>
              <TextField
                fullWidth
                placeholder="put your todo"
                value={newTodoText}
                onKeyPress={(event) => {
                  if (event.key === "Enter") {
                    addTodo(newTodoText);
                  }
                }}
                onChange={(event) => setNewTodoText(event.target.value)}
              />
            </Box>
            <Button
              className={classes.addTodoButton}
              startIcon={<Icon>add</Icon>}
              // eslint-disable-next-line
              onClick={() => addTodo(newTodoText)}>
              Add
            </Button>
          </Box>
        </Paper>
        {todos.length > 0 && (
          <Paper className={classes.todosContainer} onScroll={handleScroll}>
            {todos.map((todo, index) => (
              <TodoItems
                key={todo.id}
                index={index}
                id={todo.id}
                text={todo.text}
                completed={todo.completed}
                toggleTodoCompleted={toggleTodoCompleted}
                deleteTodo={deleteTodo}
                classes={classes}
                moveTodos={moveTodos}
              />
            ))}
          </Paper>
        )}
      </Container>
    </DndProvider>
  );
}

export default Todos;
