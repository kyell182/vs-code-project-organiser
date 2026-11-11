import * as assert from 'assert';
import { noteSummary } from '../src/notes/noteSummary';
import { ProjectService } from '../src/projects/ProjectService';
import { DomainError } from '../src/shared/DomainError';
import { todoProgress } from '../src/todos/todoProgress';
import { TodoService } from '../src/todos/TodoService';
import { InMemoryStateStore, SequentialIds } from './fakes';

describe('TodoService', () => {
  let projects: ProjectService;
  let todos: TodoService;
  let projectId: string;

  beforeEach(async () => {
    const store = new InMemoryStateStore();
    const ids = new SequentialIds();
    projects = new ProjectService(store, ids);
    todos = new TodoService(store, ids);
    projectId = (await projects.add('A', 'D:\\a')).id;
  });

  it('adds trimmed to-dos in order and refuses empty ones', async () => {
    await todos.add(projectId, ' wire the sensor ');
    await todos.add(projectId, 'write tests');
    assert.deepStrictEqual(todos.list(projectId).map((todo) => todo.text), ['wire the sensor', 'write tests']);
    await assert.rejects(todos.add(projectId, '  '), DomainError);
  });

  it('toggles, edits and removes a to-do', async () => {
    const todo = await todos.add(projectId, 'wire');
    await todos.toggle(projectId, todo.id);
    await todos.edit(projectId, todo.id, 'wire the RFID reader');
    assert.deepStrictEqual(todos.list(projectId)[0], { id: todo.id, text: 'wire the RFID reader', isDone: true });
    await todos.remove(projectId, todo.id);
    assert.strictEqual(todos.list(projectId).length, 0);
  });

  it('sets done states in one step and clears finished to-dos', async () => {
    const first = await todos.add(projectId, 'one');
    await todos.add(projectId, 'two');
    await todos.setDone(projectId, [first.id]);
    await todos.clearDone(projectId);
    assert.deepStrictEqual(todos.list(projectId).map((todo) => todo.text), ['two']);
  });

  it('reports progress and the next open steps', async () => {
    const first = await todos.add(projectId, 'one');
    await todos.add(projectId, 'two');
    await todos.add(projectId, 'three');
    await todos.toggle(projectId, first.id);
    const progress = todoProgress(projects.list()[0], 1);
    assert.deepStrictEqual({ done: progress.done, total: progress.total }, { done: 1, total: 3 });
    assert.deepStrictEqual(progress.next.map((todo) => todo.text), ['two']);
  });
});

describe('noteSummary', () => {
  it('takes the first line with text and strips markdown markers', () => {
    assert.strictEqual(noteSummary('\n# Next steps\n- more'), 'Next steps');
    assert.strictEqual(noteSummary('- [ ] connect MQTT'), 'connect MQTT');
    assert.strictEqual(noteSummary('> quote'), 'quote');
  });

  it('returns nothing for an empty note and shortens long lines', () => {
    assert.strictEqual(noteSummary('   \n  '), undefined);
    assert.strictEqual(noteSummary(undefined), undefined);
    assert.strictEqual(noteSummary('x'.repeat(100))?.length, 80);
  });
});
