import { CourseId } from './course-id';
import { CourseTitle } from './course-title';
import { CourseDescription } from './course-description';
import { CourseNumberOfLessons } from './course-number-of-lessons';

export class Course {
  private constructor(
    private readonly id: CourseId,
    private readonly title: CourseTitle,
    private readonly description: CourseDescription,
    private readonly numberOfLessons: CourseNumberOfLessons,
    private readonly isActive: boolean,
    private readonly createdAt: Date,
    private readonly updatedAt: Date
  ) {}

  public static create(
    id: string,
    title: string,
    description: string,
    numberOfLessons: number,
    isActive: boolean = true,
    createdAt: Date = new Date(),
    updatedAt: Date = new Date()
  ): Course {
    return new Course(
      new CourseId(id),
      new CourseTitle(title),
      new CourseDescription(description),
      new CourseNumberOfLessons(numberOfLessons),
      isActive,
      createdAt,
      updatedAt
    );
  }

  getId() {
    return this.id;
  }
  getIdValue() {
    return this.id.getValue();
  }
  getTitleValue() {
    return this.title.getValue();
  }
  getDescriptionValue() {
    return this.description.getValue();
  }
  getNumberOfLessonsValue() {
    return this.numberOfLessons.getValue();
  }
  getIsActive() {
    return this.isActive;
  }
  getCreatedAt() {
    return this.createdAt;
  }
  getUpdatedAt() {
    return this.updatedAt;
  }

  toJSON() {
    return {
      id: this.getIdValue(),
      title: this.getTitleValue(),
      description: this.getDescriptionValue(),
      numberOfLessons: this.getNumberOfLessonsValue(),
      isActive: this.getIsActive(),
      createdAt: this.getCreatedAt().toISOString(),
      updatedAt: this.getUpdatedAt().toISOString(),
    };
  }
}
