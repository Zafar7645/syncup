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
