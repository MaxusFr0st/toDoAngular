import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable, of } from 'rxjs';

export type Priority = 'low' | 'medium' | 'high';

export interface Todo {
  id: number;
  title: string;
  completed: boolean;
  priority: Priority;
}

const API_URL = 'https://jsonplaceholder.typicode.com/todos';

// JSONPlaceholder only has todos with ids 1-200
const LAST_SERVER_ID = 200;

const SAMPLE_TODOS: Todo[] = [
  { id: 1, title: 'Pay the electricity bill', completed: false, priority: 'high' },
  { id: 2, title: 'Prepare slides for Monday meeting', completed: false, priority: 'high' },
  { id: 3, title: 'Book a dentist appointment', completed: false, priority: 'medium' },
  { id: 4, title: 'Buy groceries for the week', completed: true, priority: 'medium' },
  { id: 5, title: 'Go for a 30 minute run', completed: true, priority: 'low' },
  { id: 6, title: 'Finish reading the Angular docs', completed: false, priority: 'low' },
];

@Injectable({ providedIn: 'root' })
export class TodoService {
  private http = inject(HttpClient);

  getTodos(): Observable<Todo[]> {
    return of(SAMPLE_TODOS);
  }

  addTodo(title: string, priority: Priority): Observable<Todo> {
    return this.http.post<Todo>(API_URL, { title, completed: false }).pipe(
      // The API returns id 201 for every new todo, so we make our own unique id
      map(() => ({ id: Date.now(), title, completed: false, priority })),
    );
  }

  updateTodo(todo: Todo): Observable<Todo> {
    // The API returns an error for ids it doesn't have, so new todos stay local
    if (todo.id > LAST_SERVER_ID) {
      return of(todo);
    }
    return this.http.put<Todo>(`${API_URL}/${todo.id}`, todo).pipe(map(() => todo));
  }

  deleteTodo(id: number): Observable<unknown> {
    return this.http.delete(`${API_URL}/${id}`);
  }
}
