import React, { useState } from "react";
import { DragDropContext } from "@hello-pangea/dnd";
import { Button, Column as CdsColumn } from "@carbon/react";
import Column from "./Column";

const Board = () => {
  const [columns, setColumns] = useState([
    {
      id: "col-1",
      title: "Pendiente",
      tasks: [{ id: "t-1", text: "Primera tarea" }],
    },
    { id: "col-2", title: "En progreso", tasks: [] },
    { id: "col-3", title: "Hecho", tasks: [] },
  ]);

  const addColumn = () => {
    const newId = `col-${Date.now()}`;
    setColumns([...columns, { id: newId, title: `Columna`, tasks: [] }]);
  };

  const addTask = (columnId) => {
    const newColumns = [...columns];
    const col = newColumns.find((c) => c.id === columnId);
    col.tasks.push({
      id: `t-${Date.now()}`,
      text: `Nueva tarea t-${Date.now()}`,
    });
    setColumns(newColumns);
  };

  const onDragEnd = (result) => {
    const { source, destination } = result;
    if (!destination) return;

    // Si no cambia de posición, no hacemos nada
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    // Copia del estado
    const newColumns = [...columns];
    const sourceCol = newColumns.find((c) => c.id === source.droppableId);
    const destCol = newColumns.find((c) => c.id === destination.droppableId);

    // Quitar de origen
    const [movedTask] = sourceCol.tasks.splice(source.index, 1);
    // Insertar en destino
    destCol.tasks.splice(destination.index, 0, movedTask);

    setColumns(newColumns);
  };

  return (
    <div style={{ marginTop: "8.5rem", display: "flex", gap: "1rem" }}>
      <DragDropContext onDragEnd={onDragEnd}>
        {columns.map((col) => (
          <CdsColumn key={col.id} sm={4} md={4} lg={4}>
            <Column column={col} addTask={addTask} />
          </CdsColumn>
        ))}
      </DragDropContext>

      <CdsColumn sm={4} md={4} lg={4}>
        <Button kind="secondary" onClick={addColumn}>
          + Añadir Columna
        </Button>
      </CdsColumn>
    </div>
  );
};

export default Board;
