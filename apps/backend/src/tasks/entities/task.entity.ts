/**
 * @file task.entity.ts
 * @description TypeORM entity for the 'tasks' table. Tasks belong to a board column
 * and are ordered within it by the `order` field. Deleting a column cascades to its
 * tasks. The description column explicitly declares type: 'varchar' to avoid TypeORM's
 * union-type reflection issue with nullable string columns in PostgreSQL.
 */
import { BoardColumn } from '@/board-columns/entities/board-column.entity';
import {
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'tasks' })
export class Task {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ type: 'varchar', nullable: true })
  description: string | null;

  @Column()
  order: number;

  @Column({ name: 'column_id' })
  columnId: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => BoardColumn, (column) => column.tasks, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'column_id' })
  column: BoardColumn;
}
