import { useFieldArray, useForm } from 'react-hook-form';
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
const hoursOptions = [0, 1, 2, 3];

export default function GPACalculator() {
  const { register, control, handleSubmit } = useForm({
    defaultValues: {
      oldHours: '',
      oldGPA: '',
      semesterCourses: Array(10).fill({ subject: '', hours: '', grade: 'F' }),
      repeatedCourses: Array(3).fill({
        subject: '',
        hours: '',
        newGrade: 'F',
        oldGrade: 'F',
      }),
    },
  });

  const { fields: semesterFields } = useFieldArray({
    control,
    name: 'semesterCourses',
  });

  const { fields: repeatedFields } = useFieldArray({
    control,
    name: 'repeatedCourses',
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onSubmit = (data: any) => {
    let totalPoints = Number(data.oldHours || 0) * Number(data.oldGPA || 0);
    let totalHours = Number(data.oldHours || 0);

    // Add semester courses
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data.semesterCourses.forEach((c: any) => {
      const h = Number(c.hours || 0);
      if (h > 0) {
        totalPoints += h * gradePoints[c.grade];
        totalHours += h;
      }
    });

    // Replace repeated courses
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data.repeatedCourses.forEach((c: any) => {
      const h = Number(c.hours || 0);
      if (h > 0) {
        totalPoints -= h * gradePoints[c.oldGrade];
        totalPoints += h * gradePoints[c.newGrade];
      }
    });

    const newGPA = totalHours > 0 ? totalPoints / totalHours : 0;
    toast.success(`New GPA: ${newGPA.toFixed(2)} | Total Hours: ${totalHours}`);
  };

  return (
    <div className="max-w-lg mx-auto p-4">
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Header */}
        <div className="text-center">
          <h1 className="text-gray-600 text-3xl font-bold mt-2">
            Calculate Your GPA
          </h1>
        </div>

        {/* Old Average */}
        <div className="bg-[#828282] p-4 rounded shadow mt-4">
          <h2 className="text-white font-bold text-lg">Old Average</h2>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {/* Hours as Select */}
            <input
              type="number"
              placeholder="Hours"
              className="border rounded p-2"
              {...register('oldHours', { valueAsNumber: true })}
            />
            <input
              type="number"
              step="0.01"
              placeholder="GPA"
              className="border rounded p-2"
              {...register('oldGPA', { valueAsNumber: true })}
            />
          </div>
        </div>

        {/* This Semester */}
        <div className="bg-[#828282] p-4 rounded shadow mt-4">
          <h2 className="text-white font-bold text-lg">This Semester</h2>
          {semesterFields.map((field, i) => (
            <div key={field.id} className="grid grid-cols-3 gap-2 mt-2">
              <input
                type="text"
                placeholder="Subject"
                className="border rounded p-2"
                {...register(`semesterCourses.${i}.subject`)}
              />

              {/* Hours as Select */}
              <select
                className="border rounded p-2 bg-[#828282]"
                {...register(`semesterCourses.${i}.hours`)}
                defaultValue=""
              >
                <option value="">Hours</option>
                {hoursOptions.map((h) => (
                  <option key={h} value={h}>
                    {h}
                  </option>
                ))}
              </select>

              <select
                className="border rounded p-2 bg-[#828282] text-white"
                {...register(`semesterCourses.${i}.grade`)}
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
          <h2 className="text-white font-bold text-lg">Repeated Courses</h2>
          {repeatedFields.map((field, i) => (
            <div key={field.id} className="grid grid-cols-4 gap-2 mt-2">
              <input
                type="text"
                placeholder="Subject"
                className="border rounded p-2"
                {...register(`repeatedCourses.${i}.subject`)}
              />

              {/* Hours as Select */}
              <select
                className="border rounded p-2 bg-[#828282]"
                {...register(`repeatedCourses.${i}.hours`)}
                defaultValue=""
              >
                <option value="">Hours</option>
                {hoursOptions.map((h) => (
                  <option key={h} value={h}>
                    {h}
                  </option>
                ))}
              </select>

              <select
                className="border rounded p-2 bg-[#828282] text-white"
                {...register(`repeatedCourses.${i}.newGrade`)}
              >
                {grades.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>

              <select
                className="border rounded p-2 bg-[#828282] text-white"
                {...register(`repeatedCourses.${i}.oldGrade`)}
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
          type="submit"
          className="bg-[#828282] text-white w-full py-2 rounded mt-4 font-bold cursor-pointer"
        >
          Calculate
        </button>
      </form>
    </div>
  );
}
