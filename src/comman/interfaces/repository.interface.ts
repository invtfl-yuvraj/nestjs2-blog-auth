// Base Repository Interface
export interface IBaseRepository<T> {
  findAll(): Promise<T[]>;
  findById(id: string): Promise<T | null>;
  create(data: Partial<T>): Promise<T>;
  update(id: string, data: Partial<T>): Promise<T>;
  delete(id: string): Promise<void>;
}

// Extended interface for User repository
export interface IUserRepository<T> extends IBaseRepository<T> {
  findByEmail(email: string): Promise<T | null>;
  existsByEmail(email: string): Promise<boolean>;
}

// Extended interface for Post repository
export interface IPostRepository<T> extends IBaseRepository<T> {
  findByAuthorId(authorId: string): Promise<T[]>;
  findPublished(): Promise<T[]>;
}
