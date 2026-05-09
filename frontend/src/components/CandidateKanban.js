import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Button, Card, Col, Container, Form, Row, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { getCandidatesByPosition, updateCandidateStage, updateInterviewScore } from '../services/candidateService';

const CandidateKanban = () => {
    const POSITION_ID = 1;
    const [candidates, setCandidates] = useState([]);
    const [stageEdits, setStageEdits] = useState({});
    const [scoreEdits, setScoreEdits] = useState({});
    const [phaseFilter, setPhaseFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const loadCandidates = async (targetPositionId) => {
        setLoading(true);
        setError('');
        setSuccess('');
        try {
            const data = await getCandidatesByPosition(targetPositionId);
            setCandidates(data);
        } catch (loadError) {
            setCandidates([]);
            setError(loadError.message || 'No se pudieron cargar los candidatos');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCandidates(POSITION_ID);
    }, []);

    const availablePhases = useMemo(() => {
        const uniquePhases = Array.from(new Set(candidates.map((candidate) => String(candidate.current_interview_step))));
        return uniquePhases.sort((a, b) => Number(a) - Number(b));
    }, [candidates]);

    const filteredCandidates = useMemo(() => {
        return candidates.filter((candidate) => {
            const matchesPhase = phaseFilter === 'all'
                ? true
                : String(candidate.current_interview_step) === phaseFilter;

            const matchesSearch = candidate.fullName
                .toLowerCase()
                .includes(searchTerm.trim().toLowerCase());

            return matchesPhase && matchesSearch;
        });
    }, [candidates, phaseFilter, searchTerm]);

    const groupedCandidates = useMemo(() => {
        const groups = filteredCandidates.reduce((acc, candidate) => {
            const step = String(candidate.current_interview_step);
            if (!acc[step]) {
                acc[step] = [];
            }
            acc[step].push(candidate);
            return acc;
        }, {});

        return Object.entries(groups).sort((a, b) => Number(a[0]) - Number(b[0]));
    }, [filteredCandidates]);

    const handleReload = async () => {
        await loadCandidates(POSITION_ID);
    };

    const handleStageUpdate = async (candidate) => {
        const customValue = stageEdits[candidate.candidateId];
        const nextStep = customValue !== undefined && customValue !== ''
            ? Number(customValue)
            : Number(candidate.current_interview_step);

        if (Number.isNaN(nextStep)) {
            setError('La etapa debe ser un numero valido');
            return;
        }

        setError('');
        setSuccess('');

        try {
            await updateCandidateStage(candidate.candidateId, {
                positionId: POSITION_ID,
                currentInterviewStep: nextStep,
            });
            setSuccess(`Etapa actualizada para ${candidate.fullName}`);
            await loadCandidates(POSITION_ID);
        } catch (updateError) {
            setError(updateError.message || 'No se pudo actualizar la etapa');
        }
    };

    const handleScoreUpdate = async (candidate) => {
        const customValue = scoreEdits[candidate.candidateId];
        const nextScore = Number(customValue);

        if (customValue === undefined || customValue === '' || Number.isNaN(nextScore)) {
            setError('El puntaje debe ser un numero valido');
            return;
        }

        if (nextScore < 0 || nextScore > 100) {
            setError('El puntaje debe estar entre 0 y 100');
            return;
        }

        setError('');
        setSuccess('');

        try {
            await updateInterviewScore(candidate.candidateId, {
                positionId: POSITION_ID,
                score: nextScore,
            });
            setSuccess(`Puntaje actualizado para ${candidate.fullName}`);
            await loadCandidates(POSITION_ID);
        } catch (updateError) {
            setError(updateError.message || 'No se pudo actualizar el puntaje');
        }
    };

    return (
        <Container className="mt-5">
            <Row className="mb-3">
                <Col>
                    <Link to="/">
                        <Button variant="secondary" className="btn-block shadow-sm">
                            Volver al Dashboard
                        </Button>
                    </Link>
                </Col>
            </Row>

            <h1 className="mb-4">Kanban de Candidatos</h1>
            <Alert variant="secondary" className="shadow-sm">
                Mostrando candidatos de la posicion 1. Usa los filtros por fase y buscador por nombre para refinar resultados.
            </Alert>

            <Card className="shadow p-4 mb-4">
                <Form>
                    <Row className="align-items-end g-3">
                        <Col md={4}>
                            <Form.Group controlId="phaseFilter">
                                <Form.Label>Fase de entrevista</Form.Label>
                                <Form.Select
                                    value={phaseFilter}
                                    onChange={(event) => setPhaseFilter(event.target.value)}
                                    className="form-control shadow-sm"
                                >
                                    <option value="all">Todas</option>
                                    {availablePhases.map((phase) => (
                                        <option key={phase} value={phase}>{`Fase ${phase}`}</option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                        </Col>
                        <Col md={4}>
                            <Form.Group controlId="searchByName">
                                <Form.Label>Buscar</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Nombre"
                                    value={searchTerm}
                                    onChange={(event) => setSearchTerm(event.target.value)}
                                    className="form-control shadow-sm"
                                />
                            </Form.Group>
                        </Col>
                        <Col md={3}>
                            <Button type="button" onClick={handleReload} className="btn btn-primary btn-block shadow-sm w-100">
                                Recargar candidatos
                            </Button>
                        </Col>
                    </Row>
                </Form>
            </Card>

            {error && <Alert variant="danger">{error}</Alert>}
            {success && <Alert variant="success">{success}</Alert>}

            {loading && (
                <div className="text-center py-4">
                    <Spinner animation="border" />
                </div>
            )}

            {!loading && candidates.length === 0 && (
                <Alert variant="info">No hay candidatos para la posicion seleccionada.</Alert>
            )}

            {!loading && groupedCandidates.length > 0 && (
                <Row className="g-4">
                    {groupedCandidates.map(([step, stepCandidates]) => (
                        <Col md={4} key={step}>
                            <Card className="h-100 shadow p-2">
                                <Card.Header>
                                    <strong>Etapa {step}</strong>
                                </Card.Header>
                                <Card.Body>
                                    {stepCandidates.map((candidate) => (
                                        <Card className="mb-3 shadow-sm" key={candidate.applicationId}>
                                            <Card.Body>
                                                <Card.Title className="mb-2">{candidate.fullName}</Card.Title>
                                                <Card.Text className="mb-1">
                                                    Puntaje promedio: {candidate.averageScore === null ? 'Sin entrevistas' : candidate.averageScore.toFixed(2)}
                                                </Card.Text>
                                                <Card.Text className="mb-2">
                                                    Etapa actual: {candidate.current_interview_step}
                                                </Card.Text>
                                                <Form.Group className="mb-2">
                                                    <Form.Label>Nueva etapa</Form.Label>
                                                    <Form.Control
                                                        type="number"
                                                        min="1"
                                                        placeholder={String(candidate.current_interview_step)}
                                                        value={stageEdits[candidate.candidateId] ?? ''}
                                                        className="form-control shadow-sm"
                                                        onChange={(event) => {
                                                            setStageEdits((prev) => ({
                                                                ...prev,
                                                                [candidate.candidateId]: event.target.value,
                                                            }));
                                                        }}
                                                    />
                                                </Form.Group>
                                                <Button size="sm" className="btn btn-primary shadow-sm" onClick={() => handleStageUpdate(candidate)}>
                                                    Actualizar etapa
                                                </Button>
                                                <Form.Group className="mt-3 mb-2">
                                                    <Form.Label>Asignar puntaje (0-100)</Form.Label>
                                                    <Form.Control
                                                        type="number"
                                                        min="0"
                                                        max="100"
                                                        placeholder="Ej: 85"
                                                        value={scoreEdits[candidate.candidateId] ?? ''}
                                                        className="form-control shadow-sm"
                                                        onChange={(event) => {
                                                            setScoreEdits((prev) => ({
                                                                ...prev,
                                                                [candidate.candidateId]: event.target.value,
                                                            }));
                                                        }}
                                                    />
                                                </Form.Group>
                                                <Button size="sm" className="btn btn-success shadow-sm" onClick={() => handleScoreUpdate(candidate)}>
                                                    Guardar puntaje
                                                </Button>
                                            </Card.Body>
                                        </Card>
                                    ))}
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>
            )}
        </Container>
    );
};

export default CandidateKanban;
