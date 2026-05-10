/**
 * @file user.entity.ts
 * @description TypeORM entity for the 'users' table. The password column is excluded
 * from default SELECT queries (select: false) and must be explicitly requested.
 * A lifecycle hook normalises the email to lowercase and trimmed before every
 * insert or update to ensure consistent lookups.
 */
import { Project } from '@/projects/entities/project.entity';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column({ select: false })
  password: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @BeforeInsert()
  @BeforeUpdate()
  normalizeEmail() {
    if (this.email && typeof this.email === 'string') {
      this.email = this.email.trim().toLowerCase();
    }
  }

  @OneToMany(() => Project, (project) => project.user)
  projects: Project[];
}
