/**
 * @file project.entity.ts
 * @description TypeORM entity for the 'projects' table. Each project belongs to one
 * user and has many board columns. Deleting a project cascades to its columns (which
 * in turn cascade to tasks). The description column explicitly declares type: 'varchar'
 * to avoid TypeORM's union-type reflection bug with nullable strings.
 */
import { BoardColumn } from '@/board-columns/entities/board-column.entity';
import { User } from '@/users/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'projects' })
export class Project {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ type: 'varchar', nullable: true })
  description: string | null;

  @Column({ name: 'user_id' })
  userId: number;

  @ManyToOne(() => User, (user) => user.projects, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => BoardColumn, (boardColumn) => boardColumn.project)
  boardColumns: BoardColumn[];
}
