import { useState, useEffect } from 'react';
import { type QuestionDefinition } from '../../types/Activity';

interface QuestionFormProps {
    initialData?: QuestionDefinition;
    onSave: (question: Partial<QuestionDefinition>) => void;
    onCancel: () => void;
}

interface OptionItem { id: string; text: string; isCorrect: boolean; }
interface TFItem { id: string; text: string; isTrue: boolean; }

export default function QuestionForm({ initialData, onSave, onCancel }: QuestionFormProps) {
    const [description, setDescription] = useState('');
    const [type, setType] = useState<QuestionDefinition['question_type']>('UC');
    const [expectedResult, setExpectedResult] = useState(1.0);

    const [options, setOptions] = useState<OptionItem[]>([
        { id: 'A', text: '', isCorrect: true },
        { id: 'B', text: '', isCorrect: false }
    ]);
    const [tfItems, setTfItems] = useState<TFItem[]>([
        { id: 'Q1', text: '', isTrue: true }
    ]);
    const [openAnswer, setOpenAnswer] = useState('');

    useEffect(() => {
        if (initialData) {
            setDescription(initialData.question_description || '');
            setType(initialData.question_type || 'UC');
            setExpectedResult(initialData.question_expected_result || 1.0);

            const responseData = initialData.question_response;

            switch (initialData.question_type) {
                case 'UC':
                case 'MC':
                    //@ts-ignore
                    if (responseData.options && Array.isArray(responseData.options)) {
                        //@ts-ignore
                        const correctAnswers = responseData.answers || [];
                        //@ts-ignore
                        setOptions(responseData.options.map((opt: any) => ({
                            id: opt.id,
                            text: opt.text,
                            isCorrect: correctAnswers.includes(opt.id)
                        })));
                    }
                    break;

                case 'TF':
                    //@ts-ignore
                    if (responseData.options && Array.isArray(responseData.options)) {
                        //@ts-ignore
                        setTfItems(responseData.options.map((opt: any) => ({
                            id: opt.id,
                            text: opt.text,
                            isTrue: opt.isTrue
                        })));
                    }
                    break;

                case 'SA':
                case 'ES':
                    //@ts-ignore
                    setOpenAnswer(responseData.expected_text || '');
                    break;
            }
        } else {
            resetForm();
        }
    }, [initialData]);

    const resetForm = () => {
        setDescription('');
        setType('UC');
        setExpectedResult(1.0);
        setOptions([{ id: 'A', text: '', isCorrect: true }, { id: 'B', text: '', isCorrect: false }]);
        setTfItems([{ id: 'Q1', text: '', isTrue: true }]);
        setOpenAnswer('');
    };

    // --- FUNÇÕES DE MANIPULAÇÃO DE ARRAY ---
    const addOption = () => setOptions([...options, { id: String.fromCharCode(65 + options.length), text: '', isCorrect: false }]);
    const removeOption = (index: number) => {
        if (options.length <= 2) return alert("Mínimo de 2 alternativas.");
        const filtered = options.filter((_, i) => i !== index);
        setOptions(filtered.map((opt, i) => ({ ...opt, id: String.fromCharCode(65 + i), isCorrect: (options[index].isCorrect && i===0) ? true : opt.isCorrect })));
    };
    const updateOptionText = (index: number, text: string) => setOptions(options.map((opt, i) => i === index ? { ...opt, text } : opt));
    const setCorrectOptionUC = (index: number) => setOptions(options.map((opt, i) => ({ ...opt, isCorrect: i === index })));
    const toggleCorrectOptionMC = (index: number) => setOptions(options.map((opt, i) => i === index ? { ...opt, isCorrect: !opt.isCorrect } : opt));

    const addTfItem = () => setTfItems([...tfItems, { id: `Q${tfItems.length + 1}`, text: '', isTrue: true }]);
    const removeTfItem = (index: number) => {
        if (tfItems.length <= 1) return alert("Mínimo de 1 afirmativa.");
        setTfItems(tfItems.filter((_, i) => i !== index).map((item, i) => ({ ...item, id: `Q${i + 1}` })));
    };
    const updateTfText = (index: number, text: string) => setTfItems(tfItems.map((item, i) => i === index ? { ...item, text } : item));
    const setTfValue = (index: number, isTrue: boolean) => setTfItems(tfItems.map((item, i) => i === index ? { ...item, isTrue } : item));

    // --- SERIALIZAÇÃO: Construindo o JSON unificado para o Backend ---
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        let questionResponseJson: any = {};

        switch (type) {
            case 'UC':
                questionResponseJson = {
                    answers: [options.find(o => o.isCorrect)?.id || 'A'],
                    options: options.map(o => ({ id: o.id, text: o.text }))
                };
                break;
            case 'MC':
                questionResponseJson = {
                    answers: options.filter(o => o.isCorrect).map(o => o.id),
                    options: options.map(o => ({ id: o.id, text: o.text }))
                };
                break;
            case 'TF':
                questionResponseJson = {
                    options: tfItems.map(item => ({ id: item.id, text: item.text, isTrue: item.isTrue }))
                };
                break;
            case 'SA':
            case 'ES':
                questionResponseJson = { expected_text: openAnswer };
                break;
        }

        onSave({
            question_description: description,
            question_type: type,
            question_expected_result: expectedResult,
            question_response: questionResponseJson
        });
        
        if (!initialData) resetForm();
    };

    return (
        <form onSubmit={handleSubmit} className="p-6 rounded-xl bg-white border border-gray-200 shadow-sm gap-6 flex flex-col">
            <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Enunciado da Questão</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Ex: Assinale a alternativa que descreve a principal causa da..." className="textarea textarea-bordered w-full h-24 bg-gray-50 focus:border-[#621708] focus:ring-1 focus:ring-[#621708]" required />
            </div>

            <div className="flex flex-wrap gap-4 bg-gray-50 p-4 rounded-lg border border-gray-100">
                <div className="flex flex-col gap-1 flex-1 min-w-[200px]">
                    <label className="text-xs font-bold text-gray-500 uppercase">Formato de Resposta</label>
                    <select value={type} onChange={(e) => setType(e.target.value as QuestionDefinition['question_type'])} className="select select-bordered w-full bg-white font-medium">
                        <option value="UC">Única Escolha (Radio)</option>
                        <option value="MC">Múltipla Escolha (Checkbox)</option>
                        <option value="TF">Verdadeiro ou Falso</option>
                        <option value="SA">Resposta Curta</option>
                        <option value="ES">Dissertativa (Texto Longo)</option>
                    </select>
                </div>
                <div className="flex flex-col gap-1 w-32">
                    <label className="text-xs font-bold text-gray-500 uppercase">Valor (Pts)</label>
                    <input type="number" step="0.1" min="0" value={expectedResult} onChange={(e) => setExpectedResult(Number(e.target.value))} className="input input-bordered w-full bg-white font-bold text-indigo-600" required />
                </div>
            </div>

            <div className="border-l-4 border-[#621708] pl-4">
                <h4 className="text-sm font-bold text-gray-700 mb-4 uppercase">Gabarito e Alternativas</h4>

                {(type === 'UC' || type === 'MC') && (
                    <div className="flex flex-col gap-3">
                        {options.map((opt, index) => (
                            <div key={opt.id} className={`flex items-center gap-3 p-2 rounded-lg transition-colors border ${opt.isCorrect ? 'bg-green-50 border-green-400' : 'bg-transparent border-transparent'}`}>
                                <span className={`font-bold w-6 ${opt.isCorrect ? 'text-green-700' : 'text-gray-500'}`}>{opt.id})</span>
                                <input type="text" value={opt.text} onChange={(e) => updateOptionText(index, e.target.value)} placeholder={`Texto da alternativa ${opt.id}`} className={`input input-bordered input-sm flex-1 ${opt.isCorrect ? 'bg-white border-green-300 focus:ring-green-500' : 'bg-gray-50'}`} required />
                                {type === 'UC' ? (
                                    <label className="cursor-pointer flex items-center gap-2 w-24"><input type="radio" name="correct_uc" checked={opt.isCorrect} onChange={() => setCorrectOptionUC(index)} className="radio radio-sm radio-success" /><span className={`text-xs font-bold ${opt.isCorrect ? 'text-green-700' : 'text-gray-400'}`}>Correta</span></label>
                                ) : (
                                    <label className="cursor-pointer flex items-center gap-2 w-24"><input type="checkbox" checked={opt.isCorrect} onChange={() => toggleCorrectOptionMC(index)} className="checkbox checkbox-sm checkbox-success" /><span className={`text-xs font-bold ${opt.isCorrect ? 'text-green-700' : 'text-gray-400'}`}>Correta</span></label>
                                )}
                                <button type="button" onClick={() => removeOption(index)} className="btn btn-square btn-ghost btn-sm text-red-400 hover:bg-red-50 hover:text-red-600"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button>
                            </div>
                        ))}
                        <button type="button" onClick={addOption} className="btn btn-sm btn-outline btn-ghost w-fit mt-2 text-gray-500">+ Adicionar Alternativa</button>
                    </div>
                )}

                {type === 'TF' && (
                    <div className="flex flex-col gap-3">
                        {tfItems.map((item, index) => (
                            <div key={item.id} className="flex items-center gap-3 p-2 rounded-lg bg-transparent border border-transparent">
                                <span className="font-bold text-gray-500 w-8">{item.id}.</span>
                                <input type="text" value={item.text} onChange={(e) => updateTfText(index, e.target.value)} placeholder="Afirmativa para ser julgada..." className="input input-bordered input-sm flex-1 bg-gray-50" required />
                                <div className="join w-32">
                                    <input type="radio" className="join-item btn btn-sm bg-white checked:bg-green-500 checked:text-white" aria-label="V" checked={item.isTrue} onChange={() => setTfValue(index, true)} />
                                    <input type="radio" className="join-item btn btn-sm bg-white checked:bg-red-500 checked:text-white" aria-label="F" checked={!item.isTrue} onChange={() => setTfValue(index, false)} />
                                </div>
                                <button type="button" onClick={() => removeTfItem(index)} className="btn btn-square btn-ghost btn-sm text-red-400 hover:bg-red-50 hover:text-red-600"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button>
                            </div>
                        ))}
                        <button type="button" onClick={addTfItem} className="btn btn-sm btn-outline btn-ghost w-fit mt-2 text-gray-500">+ Adicionar Afirmativa</button>
                    </div>
                )}

                {(type === 'SA' || type === 'ES') && (
                    <div className="flex flex-col gap-2 mt-2">
                        <label className="text-xs font-medium text-gray-500">Resposta Esperada (Espelho de Correção)</label>
                        <textarea value={openAnswer} onChange={(e) => setOpenAnswer(e.target.value)} placeholder="Descreva aqui os pontos chave que a resposta do aluno deve conter..." className="textarea textarea-bordered w-full h-24 bg-green-50 border-green-200 focus:border-green-500 focus:ring-1 focus:ring-green-500" required />
                    </div>
                )}
            </div>

            <div className="flex justify-end gap-3 mt-4 border-t pt-6">
                {initialData && <button type="button" onClick={onCancel} className="btn btn-ghost">Cancelar Edição</button>}
                <button type="submit" className="btn bg-[#621708] hover:bg-black text-white px-8 border-none shadow-md">
                    {initialData ? 'Atualizar Questão' : 'Salvar Questão'}
                </button>
            </div>
        </form>
    );
}