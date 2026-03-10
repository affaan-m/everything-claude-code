'use strict';

function createTaskGraph(tasks) {
  const normalizedTasks = normalizeTasks(tasks);
  const taskIds = new Set(normalizedTasks.map((task) => task.id));
  const missingDependencies = [];
  const adjacency = {};
  const incomingCounts = {};

  for (const task of normalizedTasks) {
    adjacency[task.id] = [];
    incomingCounts[task.id] = 0;
  }

  for (const task of normalizedTasks) {
    for (const dependency of task.dependencies) {
      if (!taskIds.has(dependency)) {
        missingDependencies.push({
          taskId: task.id,
          dependency
        });
        continue;
      }

      adjacency[dependency] = [...adjacency[dependency], task.id];
      incomingCounts[task.id] += 1;
    }
  }

  const queue = normalizedTasks
    .filter((task) => incomingCounts[task.id] === 0)
    .map((task) => task.id);
  const order = [];
  const incomingCountsCopy = { ...incomingCounts };

  while (queue.length > 0) {
    const currentTaskId = queue.shift();
    order.push(currentTaskId);

    for (const nextTaskId of adjacency[currentTaskId] || []) {
      incomingCountsCopy[nextTaskId] -= 1;
      if (incomingCountsCopy[nextTaskId] === 0) {
        queue.push(nextTaskId);
      }
    }
  }

  const hasCycle = order.length !== normalizedTasks.length;

  return {
    nodes: normalizedTasks,
    edges: normalizedTasks.flatMap((task) => task.dependencies.map((dependency) => ({
      from: dependency,
      to: task.id
    }))),
    order,
    missingDependencies,
    hasCycle
  };
}

function normalizeTasks(tasks) {
  return (Array.isArray(tasks) ? tasks : []).map((task, index) => ({
    id: String(task.id || `task-${index + 1}`),
    title: String(task.title || `Task ${index + 1}`),
    description: String(task.description || ''),
    dependencies: Array.isArray(task.dependencies)
      ? task.dependencies.map((dependency) => String(dependency))
      : [],
    acceptanceCriteria: Array.isArray(task.acceptanceCriteria)
      ? [...task.acceptanceCriteria]
      : [],
    suggestedTools: Array.isArray(task.suggestedTools)
      ? [...task.suggestedTools]
      : []
  }));
}

module.exports = {
  createTaskGraph
};
