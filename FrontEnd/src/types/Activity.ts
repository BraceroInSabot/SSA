// 1. Tipagem auxiliar para os arquivos do professor
export interface AttachedFile {
    attached_files_id: string;
    file: string; // URL do arquivo físico
}

// 2. Tipagem auxiliar para o gabarito/feedback
export interface TeacherSubmissionFeedback {
    activity_final_grade: number;
    question_description: string;
    question_type: string;
    question_response: any;
    question_expected_result: any;
    teacher_feedback?: string;
}

// 3. A Interface Principal
export interface Activity {
    activity_id: string;
    name: string;
    description: string;
    to_be_launched: string; // Formato ISO de data
    due_date: string;       // Formato ISO de data
    total_grade: number;
    is_active: boolean;
    has_submission: boolean;
    course: string;
    status: 'DRF' | 'PUB';
    
    // --- LINHAS QUE VOCÊ PRECISA GARANTIR QUE EXISTEM (E POR QUÊ) ---
    
    // POR QUE: Sem isso, os seus ifs (activity_type === 'FIL') vão quebrar. 
    // Isso garante que o TS saiba que a atividade pode ser de envio de arquivo.
    activity_type: 'ATV' | 'LAB' | 'PRJ' | 'TST' | 'FIL'; 
    
    // POR QUE: Fundamental para esconder a Dropzone de Upload depois que o aluno enviar o trabalho.
    // Se isso não estiver mapeado, o aluno poderá enviar arquivos infinitamente.
    has_student_submission: boolean; 
    
    // POR QUE: Garante o mapeamento do array na hora de renderizar a lista de downloads do professor.
    attached_files?: AttachedFile[];
    
    // POR QUE: É o array que o seu `calculateTotalGrade` e o `map` de detalhamento de questões percorrem.
    teacher_submission?: TeacherSubmissionFeedback[];
}