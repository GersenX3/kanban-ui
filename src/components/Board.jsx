import React, { useState, useEffect } from "react";
import { DragDropContext } from "@hello-pangea/dnd";
import { Button, Column as CdsColumn, InlineLoading } from "@carbon/react";
import Column from "./Column";

const Board = () => {
  const [columns, setColumns] = useState([]);
  const [boardId, setBoardId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const token = localStorage.getItem("token");

  // Cargar el tablero del usuario al inicializar
  useEffect(() => {
    loadUserBoard();
  }, []);

  // Debounce para guardar cambios automáticamente
  useEffect(() => {
    if (boardId && columns.length > 0) {
      const timer = setTimeout(() => {
        saveBoard();
      }, 1000); // Guarda 1 segundo después del último cambio

      return () => clearTimeout(timer);
    }
  }, [columns, boardId]);

  const loadUserBoard = async () => {
    try {
      const response = await fetch("http://localhost:5000/auth/boards", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const boards = await response.json();
        if (boards.length > 0) {
          // Cargar el primer tablero (por ahora manejamos un solo tablero por usuario)
          const board = boards[0];
          setBoardId(board.id);
          setColumns(board.columns);
        } else {
          // Si no hay tableros, crear uno por defecto
          await createDefaultBoard();
        }
      }
    } catch (error) {
      console.error("Error loading board:", error);
    } finally {
      setLoading(false);
    }
  };

  const createDefaultBoard = async () => {
    try {
      const defaultColumns = [
        {
          id: "col-1",
          title: "To Do",
          tasks: [{ id: "t-1", text: "First Taks" }],
        },
        { id: "col-2", title: "Progress", tasks: [] },
        { id: "col-3", title: "Done", tasks: [] },
      ];

      const response = await fetch("http://localhost:5000/auth/boards", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: "Mi Tablero Kanban",
          columns: defaultColumns,
        }),
      });

      if (response.ok) {
        const newBoard = await response.json();
        setBoardId(newBoard.id);
        setColumns(newBoard.columns);
      }
    } catch (error) {
      console.error("Error creating default board:", error);
    }
  };

  const saveBoard = async () => {
    if (!boardId) return;

    setSaving(true);
    try {
      const response = await fetch(
        `http://localhost:5000/auth/boards/${boardId}/columns`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            columns: columns,
          }),
        }
      );

      if (!response.ok) {
        console.error("Error saving board:", await response.text());
      }
    } catch (error) {
      console.error("Error saving board:", error);
    } finally {
      setSaving(false);
    }
  };

  const addColumn = () => {
    const newId = `col-${Date.now()}`;
    setColumns([...columns, { id: newId, title: `New Column`, tasks: [] }]);
  };

  const updateColumnTitle = (columnId, newTitle) => {
    setColumns((prevColumns) =>
      prevColumns.map((col) =>
        col.id === columnId ? { ...col, title: newTitle } : col
      )
    );
  };

  const deleteColumn = (columnId) => {
    setColumns((prevColumns) =>
      prevColumns.filter((col) => col.id !== columnId)
    );
  };

  const moveColumnLeft = (columnId) => {
    const currentIndex = columns.findIndex((col) => col.id === columnId);
    if (currentIndex > 0) {
      const newColumns = [...columns];
      [newColumns[currentIndex - 1], newColumns[currentIndex]] = [
        newColumns[currentIndex],
        newColumns[currentIndex - 1],
      ];
      setColumns(newColumns);
    }
  };

  const moveColumnRight = (columnId) => {
    const currentIndex = columns.findIndex((col) => col.id === columnId);
    if (currentIndex < columns.length - 1) {
      const newColumns = [...columns];
      [newColumns[currentIndex], newColumns[currentIndex + 1]] = [
        newColumns[currentIndex + 1],
        newColumns[currentIndex],
      ];
      setColumns(newColumns);
    }
  };

  const updateTask = (taskId, newData) => {
    setColumns((prevColumns) =>
      prevColumns.map((column) => ({
        ...column,
        tasks: column.tasks.map((task) =>
          task.id === taskId ? { ...task, ...newData } : task
        ),
      }))
    );
  };

  const deleteTask = (taskId) => {
    setColumns((prevColumns) =>
      prevColumns.map((column) => ({
        ...column,
        tasks: column.tasks.filter((task) => task.id !== taskId),
      }))
    );
  };

  const addTask = (columnId) => {
    const newColumns = [...columns];
    const col = newColumns.find((c) => c.id === columnId);
    col.tasks.push({
      id: `t-${Date.now()}`,
      text: `New Task`,
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

  if (loading) {
    return (
      <div
        style={{
          marginTop: "4rem",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "300px",
        }}
      >
        <InlineLoading description="Loading..." />
      </div>
    );
  }

  return (
    <div style={{ marginTop: "4rem", display: "flex", gap: "1rem" }}>
      <DragDropContext onDragEnd={onDragEnd}>
        {columns.map((col, index) => (
          <CdsColumn key={col.id} sm={4} md={4} lg={4}>
            <Column
              column={col}
              addTask={addTask}
              updateColumnTitle={updateColumnTitle}
              deleteColumn={deleteColumn}
              moveColumnLeft={moveColumnLeft}
              moveColumnRight={moveColumnRight}
              canMoveLeft={index > 0}
              canMoveRight={index < columns.length - 1}
              updateTask={updateTask}
              deleteTask={deleteTask}
            />
          </CdsColumn>
        ))}
      </DragDropContext>

      <CdsColumn sm={4} md={4} lg={4}>
        <Button kind="secondary" onClick={addColumn}>
          + Add Column
        </Button>
      </CdsColumn>

      {/* Indicador de guardado */}
      {saving && (
        <div
          style={{
            position: "fixed",
            bottom: "1rem",
            right: "1rem",
            background: "#393939",
            padding: "0.5rem 1rem",
            borderRadius: "4px",
            color: "white",
          }}
        >
          <InlineLoading description="Saving..." />
        </div>
      )}
    </div>
  );
};

export default Board;
