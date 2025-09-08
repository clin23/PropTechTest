import { test } from '@playwright/test';

test.describe('tasks', () => {
  test.todo('Loads /tasks and defaults to Kanban');
  test.todo('Create task via drawer appears in cadence');
  test.todo('Complete task updates status');
  test.todo('Filter by property shows tasks');
  test.todo('Switch to Calendar shows tasks on dates');
  test.todo('Switch to Gantt renders timeline');
});
