interface Activity {
    activity_id: number;
    name: string;
    total_grade: Number;
    has_submission: boolean
    to_be_launched: string; // ISO string
    lauched_at: string; // ISO string
    due_date: string; // ISO string
    description: string;
    is_active: boolean;
    course: string; // course ID
}

export type { Activity };