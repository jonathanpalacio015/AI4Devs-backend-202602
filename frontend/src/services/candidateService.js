const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3010';

const parseResponse = async (response, fallbackErrorMessage) => {
    const contentType = response.headers.get('content-type') || '';
    const isJson = contentType.includes('application/json');
    const payload = isJson ? await response.json() : null;

    if (!response.ok) {
        const message = payload?.error || payload?.message || fallbackErrorMessage;
        throw new Error(message);
    }

    return payload;
};

export const uploadCV = async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/upload`, {
        method: 'POST',
        body: formData,
    });

    return parseResponse(response, 'Error al subir el archivo');
};

export const sendCandidateData = async (candidateData) => {
    const response = await fetch(`${API_BASE_URL}/candidates`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(candidateData),
    });

    return parseResponse(response, 'Error al enviar datos del candidato');
};

export const getCandidatesByPosition = async (positionId) => {
    const response = await fetch(`${API_BASE_URL}/positions/${positionId}/candidates`, {
        method: 'GET',
    });

    return parseResponse(response, 'Error al cargar candidatos por posicion');
};

export const updateCandidateStage = async (candidateId, payload) => {
    const response = await fetch(`${API_BASE_URL}/candidates/${candidateId}/stage`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });

    return parseResponse(response, 'Error al actualizar etapa del candidato');
};

export const updateInterviewScore = async (candidateId, payload) => {
    const response = await fetch(`${API_BASE_URL}/candidates/${candidateId}/score`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });

    return parseResponse(response, 'Error al actualizar puntaje de entrevista');
};