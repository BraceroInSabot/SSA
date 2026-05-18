export interface Bimestre {
    id: string;
    name: string;
    year: number;
    courses: string[]; // UUIDs of the courses
}
