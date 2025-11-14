import { CourseId } from './course-id';
import { CourseTitle } from './course-title';
import { CourseDescription } from './course-description';
import { CourseNumberOfLessons } from './course-number-of-lessons';

export class Course {
  id: CourseId;
  title: CourseTitle;
  description: CourseDescription;
  numberOfLessons: CourseNumberOfLessons;
  instructor?: string;
  duration?: string;
  level?: string;
  createdAt: Date;

  constructor(
    id: string,
    title: string,
    description: string,
    numberOfLessons: number,
    instructor?: string,
    duration?: string,
    level?: string,
    createdAt?: Date
  ) {
    this.id = new CourseId(id);
    this.title = new CourseTitle(title);
    this.description = new CourseDescription(description);
    this.numberOfLessons = new CourseNumberOfLessons(numberOfLessons);
    this.instructor = instructor;
    this.duration = duration;
    this.level = level;
    this.createdAt = createdAt || new Date();
  }

  public setTitle(title: CourseTitle): void {
    this.title = title;
  }

  public setDescription(description: CourseDescription): void {
    this.description = description;
  }
  public toJSON() {
    return {
      id: this.id.getValue(),
      title: this.title.getValue(),
      description: this.description.getValue(),
      numberOfLessons: this.numberOfLessons.getValue(),
      instructor: this.instructor,
      duration: this.duration,
      level: this.level,
      createdAt: this.createdAt,
    };
  }

  public getTitleAndDescription(): string {
    return `Title: ${this.title.getValue()}, Description: ${this.description.getValue()}`;
  }

  public print(): void {
    console.log(
      `Course [ID: ${this.id.getValue()}, 
      Title: ${this.title.getValue()},
      Description: ${this.description.getValue()}, 
      Number of Lessons: ${this.numberOfLessons.getValue()}, 
      Instructor: ${this.instructor || 'N/A'}, 
      Duration: ${this.duration || 'N/A'}, 
      Level: ${this.level || 'N/A'}, 
      Created At: ${this.createdAt.toISOString()}]`
    );
  }
}
