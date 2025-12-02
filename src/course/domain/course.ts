import { CourseId } from './course-id';
import { CourseTitle } from './course-title';
import { CourseDescription } from './course-description';
import { CourseNumberOfLessons } from './course-number-of-lessons';

export class Course {
  id: CourseId;
  title: CourseTitle;
  description: CourseDescription;
  numberOfLessons: CourseNumberOfLessons;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;

  constructor(
    id: string,
    title: string,
    description: string,
    numberOfLessons: number,
    isActive: boolean = true,
    createdAt?: Date,
    updatedAt?: Date
  ) {
    this.id = new CourseId(id);
    this.title = new CourseTitle(title);
    this.description = new CourseDescription(description);
    this.numberOfLessons = new CourseNumberOfLessons(numberOfLessons);
    this.isActive = isActive;
    this.createdAt = createdAt ?? new Date();
    this.updatedAt = updatedAt ?? new Date();
  }

  public toJSON() {
    return {
      id: this.id.getValue(),
      title: this.title.getValue(),
      description: this.description.getValue(),
      numberOfLessons: this.numberOfLessons.getValue(),
      isActive: this.isActive,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
    };
  }
}
