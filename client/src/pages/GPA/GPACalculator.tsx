import React, { useState } from 'react';
import toast from 'react-hot-toast';

const gradePoints: Record<string, number> = {
  A: 4.0,
  'A-': 3.75,
  'B+': 3.5,
  B: 3.0,
  'B-': 2.75,
  'C+': 2.5,
  C: 2.0,
  'C-': 1.75,
  'D+': 1.5,
  D: 1.25,
  'D-': 1.0,
  F: 0.5,
};

const grades = Object.keys(gradePoints);

interface Course {
  subject: string;
  hours: number;
  grade: string;
}

interface RepeatedCourse {
  subject: string;
  hours: number;
  newGrade: string;
  oldGrade: string;
}

export default function GPACalculator() {
  const [oldHours, setOldHours] = useState<number>(0);
  const [oldGPA, setOldGPA] = useState<number>(0);
  const [semesterCourses, setSemesterCourses] = useState<Course[]>(
    Array(10).fill({ subject: '', hours: 0, grade: 'F' })
  );
  const [repeatedCourses, setRepeatedCourses] = useState<RepeatedCourse[]>(
    Array(3).fill({ subject: '', hours: 0, newGrade: 'F', oldGrade: 'F' })
  );

  const updateSemesterCourse = (
    index: number,
    field: keyof Course,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    value: any
  ) => {
    const updated = [...semesterCourses];
    updated[index] = { ...updated[index], [field]: value };
    setSemesterCourses(updated);
  };

  const updateRepeatedCourse = (
    index: number,
    field: keyof RepeatedCourse,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    value: any
  ) => {
    const updated = [...repeatedCourses];
    updated[index] = { ...updated[index], [field]: value };
    setRepeatedCourses(updated);
  };

  const calculateGPA = () => {
    let totalPoints = oldHours * oldGPA;
    let totalHours = oldHours;

    // Add semester courses
    semesterCourses.forEach((c) => {
      if (c.hours > 0) {
        totalPoints += c.hours * gradePoints[c.grade];
        totalHours += c.hours;
      }
    });

    // Replace repeated courses
    repeatedCourses.forEach((c) => {
      if (c.hours > 0) {
        totalPoints -= c.hours * gradePoints[c.oldGrade];
        totalPoints += c.hours * gradePoints[c.newGrade];
      }
    });

    const newGPA = totalHours > 0 ? totalPoints / totalHours : 0;
    const finalResult = {
      gpa: parseFloat(newGPA.toFixed(2)),
      hours: totalHours,
    };

    toast.success(
      `New GPA: ${finalResult.gpa} | Total Hours: ${finalResult.hours}`
    );
  };

  return (
    <div className="max-w-lg mx-auto p-4">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-[#828282] text-3xl font-bold mt-2">
          Calculate Your GPA
        </h1>
      </div>

      {/* Old Average */}
      <div className="bg-[#828282] p-4 rounded shadow mt-4">
        <h2 className="text-white font-bold text-lg">Old Average</h2>
        <div className="grid grid-cols-2 gap-2 mt-2">
          <input
            type="number"
            placeholder="Hours"
            className="border rounded p-2"
            onChange={(e) => setOldHours(Number(e.target.value))}
          />
          <input
            type="number"
            step="0.01"
            placeholder="GPA"
            className="border rounded p-2"
            onChange={(e) => setOldGPA(Number(e.target.value))}
          />
        </div>
      </div>

      {/* This Semester */}
      <div className="bg-[#828282] p-4 rounded shadow mt-4">
        <h2 className="text-white font-bold text-lg">This Semester</h2>
        {semesterCourses.map((c, i) => (
          <div key={i} className="grid grid-cols-3 gap-2 mt-2">
            <input
              type="text"
              placeholder="Subject"
              className="border rounded p-2"
              value={c.subject}
              onChange={(e) =>
                updateSemesterCourse(i, 'subject', e.target.value)
              }
            />
            <input
              type="number"
              placeholder="Hours"
              className="border rounded p-2"
              onChange={(e) =>
                updateSemesterCourse(i, 'hours', Number(e.target.value))
              }
            />
            <select
              className="border rounded p-2 bg-[#828282] text-white"
              value={c.grade}
              onChange={(e) => updateSemesterCourse(i, 'grade', e.target.value)}
            >
              {grades.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>

      {/* Repeated Courses */}
      <div className="bg-[#828282] p-4 rounded shadow mt-4">
        <div className="grid grid-cols-2 gap-3">
          <h2 className="text-white font-bold text-lg">Repeated Courses</h2>
          <div className="flex justify-between items-center">
            <h3 className="text-white text-lg">New Grade</h3>
            <h3 className="text-white text-lg">Old Grade</h3>
          </div>
        </div>

        {repeatedCourses.map((c, i) => (
          <div key={i} className="grid grid-cols-4 gap-2 mt-2">
            <input
              type="text"
              placeholder="Subject"
              className="border rounded p-2"
              value={c.subject}
              onChange={(e) =>
                updateRepeatedCourse(i, 'subject', e.target.value)
              }
            />
            <input
              type="number"
              placeholder="Hours"
              className="border rounded p-2"
              onChange={(e) =>
                updateRepeatedCourse(i, 'hours', Number(e.target.value))
              }
            />
            <select
              className="border rounded p-2 bg-[#828282] text-white"
              value={c.newGrade}
              onChange={(e) =>
                updateRepeatedCourse(i, 'newGrade', e.target.value)
              }
            >
              {grades.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
            <select
              className="border rounded p-2 bg-[#828282] text-white"
              value={c.oldGrade}
              onChange={(e) =>
                updateRepeatedCourse(i, 'oldGrade', e.target.value)
              }
            >
              {grades.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>

      {/* Calculate Button */}
      <button
        onClick={calculateGPA}
        className="bg-[#828282] text-white w-full py-2 rounded mt-4 font-bold cursor-pointer"
      >
        Calculate
      </button>
    </div>
  );
}
