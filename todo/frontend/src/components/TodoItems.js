import React, { useRef } from "react";
import { Typography, Button, Icon, Box, Checkbox } from "@mui/material";
import { useDrag, useDrop } from "react-dnd";

const TodoItems = (props) => {
  const {
    classes,
    toggleTodoCompleted,
    deleteTodo,
    moveTodos,
    id,
    text,
    completed,
    index,
  } = props;

  const [{ isDragging }, dragRef] = useDrag({
    type: "item",
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [spec, dropRef] = useDrop({
    accept: "item",
    hover: (item, monitor) => {
      const dragIndex = item.index;
      const hoverIndex = index;
      const hoverBoundingRect = ref.current?.getBoundingClientRect();
      const hoverMiddleY =
        (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const hoverActualY = monitor.getClientOffset().y - hoverBoundingRect.top;
      if (dragIndex < hoverIndex && hoverActualY < hoverMiddleY) return;
      if (dragIndex > hoverIndex && hoverActualY > hoverMiddleY) return;

      moveTodos(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  const ref = useRef(null);
  const dragDropRef = dragRef(dropRef(ref));
  const opacity = isDragging ? 0 : 1;

  return (
    <>
      <Box
        display="flex"
        flexDirection="row"
        alignItems="center"
        className={classes.todoContainer}
        style={{ opacity, cursor: "grab" }}
        ref={dragDropRef}
        key={id}>
        <Checkbox
          checked={completed}
          onChange={() => toggleTodoCompleted(id)}></Checkbox>
        <Box flexGrow={1} key={id}>
          <Typography
            key={id}
            className={completed ? classes.todoTextCompleted : ""}
            variant="body1">
            {text}
          </Typography>
        </Box>
        <Button
          className={classes.deleteTodo}
          startIcon={<Icon>delete</Icon>}
          onClick={() => deleteTodo(id)}>
          Delete
        </Button>
      </Box>
    </>
  );
};

export default TodoItems;
