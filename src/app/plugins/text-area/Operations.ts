import { Cursor } from './Cursor';

export interface Operations {
  select(cursor: Cursor): void;
  deselect(cursor: Cursor): void;
  insert(cursor: Cursor, text: string): Cursor;
}
