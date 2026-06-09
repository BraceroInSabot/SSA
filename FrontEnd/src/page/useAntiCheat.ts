import { useEffect, useRef } from 'react';
import { api } from '../services/api';

export function useAntiCheat(activityId: string) {
    const evasionStartTime = useRef<number | null>(null);

    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.hidden) {
                // Aluno minimizou ou trocou de aba
                evasionStartTime.current = Date.now();
            } else {
                // Aluno retornou
                if (evasionStartTime.current) {
                    const duration = Math.floor((Date.now() - evasionStartTime.current) / 1000); // Em segundos
                    sendLog('tab_switch_or_minimize', duration);
                    evasionStartTime.current = null;
                }
            }
        };

        const handleBlur = () => {
            if (!evasionStartTime.current) evasionStartTime.current = Date.now();
        };

        const handleFocus = () => {
            if (evasionStartTime.current && !document.hidden) {
                const duration = Math.floor((Date.now() - evasionStartTime.current) / 1000);
                sendLog('window_blur', duration);
                evasionStartTime.current = null;
            }
        };

        const sendLog = (eventType: string, duration: number) => {
            if (duration < 1) return; // Ignore very quick blurs
            alert(`Aviso do Sistema Anti-Cheat:\nFoi detectado que você saiu da tela por ${duration} segundos. Isso foi registrado no log da sua prova.`);
            api.post(`/activities/${activityId}/anti-cheat-log/`, {
                timestamp: new Date().toISOString(),
                duration_seconds: duration,
                event_type: eventType
            }).catch(err => console.error("Falha ao registrar log de anti-cheat silencioso.", err));
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('blur', handleBlur);
        window.addEventListener('focus', handleFocus);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('blur', handleBlur);
            window.removeEventListener('focus', handleFocus);
        };
    }, [activityId]);
}