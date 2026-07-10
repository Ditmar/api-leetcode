export interface TopicProgressRepository {
  upsert(userId: string, topicId: string, progress: number): Promise<void>;
  findByUserAndTopic(userId: string, topicId: string): Promise<number | null>;
  findByUser(userId: string): Promise<{ topicId: string; progress: number }[]>;
}
