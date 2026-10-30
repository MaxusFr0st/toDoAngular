import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Priority, Todo, TodoService } from './todo.service';

const PRIORITY_ORDER: Record<Priority, number> = { high: 3, medium: 2, low: 1 };

@Component({
  imports: [FormsModule],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App implements OnInit {
  private todoService = inject(TodoService);

  protected readonly priorities: Priority[] = ['low', 'medium', 'high'];

  protected readonly todos = signal<Todo[]>([]);
  protected readonly filter = signal<'all' | 'active' | 'completed'>('all');
  protected readonly sort = signal<'none' | 'high' | 'low'>('none');
  protected readonly error = signal('');

  // Add form
  protected newTitle = '';
  protected newPriority: Priority = 'medium';

  // Edit form
  protected readonly editingId = signal<number | null>(null);
  protected editTitle = '';
  protected editPriority: Priority = 'medium';

  protected readonly visibleTodos = computed(() => {
    let result = this.todos();

    if (this.filter() === 'active') {
      result = result.filter((todo) => !todo.completed);
    } else if (this.filter() === 'completed') {
      result = result.filter((todo) => todo.completed);
    }

    if (this.sort() === 'high') {
      result = [...result].sort((a, b) => PRIORITY_ORDER[b.priority] - PRIORITY_ORDER[a.priority]);
    } else if (this.sort() === 'low') {
      result = [...result].sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]);
    }

    return result;
  });

  ngOnInit(): void {
    this.todoService.getTodos().subscribe({
      next: (todos) => this.todos.set(todos),
      error: () => this.error.set('Could not load tasks'),
    });
  }

  addTodo(): void {
    const title = this.newTitle.trim();
    if (!title) {
      return;
    }

    this.todoService.addTodo(title, this.newPriority).subscribe({
      next: (todo) => {
        this.todos.update((todos) => [todo, ...todos]);
        this.newTitle = '';
        this.newPriority = 'medium';
        this.error.set('');
      },
      error: () => this.error.set('Could not add the task'),
    });
  }

  toggleTodo(todo: Todo): void {
    this.saveTodo({ ...todo, completed: !todo.completed });
  }

  startEdit(todo: Todo): void {
    this.editingId.set(todo.id);
    this.editTitle = todo.title;
    this.editPriority = todo.priority;
  }

  cancelEdit(): void {
    this.editingId.set(null);
  }

  saveEdit(todo: Todo): void {
    const title = this.editTitle.trim();
    if (!title) {
      return;
    }

    this.saveTodo({ ...todo, title, priority: this.editPriority });
    this.editingId.set(null);
  }

  deleteTodo(id: number): void {
    this.todoService.deleteTodo(id).subscribe({
      next: () => {
        this.todos.update((todos) => todos.filter((todo) => todo.id !== id));
        this.error.set('');
      },
      error: () => this.error.set('Could not delete the task'),
    });
  }

  private saveTodo(updated: Todo): void {
    this.todoService.updateTodo(updated).subscribe({
      next: (todo) => {
        this.todos.update((todos) => todos.map((t) => (t.id === todo.id ? todo : t)));
        this.error.set('');
      },
      error: () => this.error.set('Could not update the task'),
    });
  }
}
