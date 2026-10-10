# School Database Design

## Tables

- **students** stores each student's name and unique email address. `student_id` is its primary key.
- **courses** stores each course's unique code and name. `course_id` is its primary key.
- **enrolments** records which student takes which course, along with the enrolment date and optional grade. `enrolment_id` is its primary key; `student_id` and `course_id` are foreign keys.

## Relationships

The students-to-enrolments and courses-to-enrolments relationships are each one-to-many: one student or course can have many enrolments, while each enrolment belongs to exactly one student and one course. Therefore, students and courses have a many-to-many relationship: a student can take multiple courses, and each course can have multiple students. The enrolments join table represents each student-course pairing and provides a place for relationship details such as the date and grade. Its unique constraint on `(student_id, course_id)` prevents duplicate enrolment in the same course.

## Index

I would add an index on `students.name` because the required course lookup selects a student by name. The index is created in `school.sql` as `idx_students_name`.

## SQL or NoSQL?

I would choose SQL for this system. Students, courses, and enrolments have clear relationships and integrity rules, including unique emails, valid foreign keys, and prevention of duplicate enrolments. A relational database can enforce these rules and use joins to answer the requested questions consistently. A NoSQL database could work, but representing and maintaining these connected records and constraints would add complexity without a clear benefit here.