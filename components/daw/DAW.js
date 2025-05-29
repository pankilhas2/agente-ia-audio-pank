import React, { useState, useEffect } from 'react';
import { Box, Heading, Textarea, Button, Select, VStack, HStack, Progress, Alert, AlertIcon, AlertTitle, AlertDescription } from '@chakra-ui/react';
import { FaPlay, FaStop, FaDownload } from 'react-icons/fa';
import { getVoices, generateSpeech } from '../../lib/elevenLabsService';
import { generateContent } from '../../lib/openaiService';

const languages = [
  { id: 'pt', name: 'Português' },
  { id: 'en', name: 'Inglês' },
  { id: 'es', name: 'Espanhol' }
];

const DAW = () => {
  const [briefing, setBriefing] = useState('');
  const [aiSuggestion, setAiSuggestion] = useState('');
  const [selectedVoice, setSelectedVoice] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('pt');
  const [selectedTrack, setSelectedTrack] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);

  const [availableVoices, setAvailableVoices] = useState([]);

  useEffect(() => {
    const fetchVoices = async () => {
      try {
        const voices = await getVoices(selectedLanguage);
        setAvailableVoices(voices);
      } catch (error) {
        console.error('Erro ao buscar vozes:', error);
      }
    };

    if (selectedLanguage) {
      fetchVoices();
    }
  }, [selectedLanguage]);

  const languages = [
    { id: 'pt', name: 'Português' },
    { id: 'en', name: 'Inglês' },
    { id: 'es', name: 'Espanhol' }
    { id: 'es', name: 'Alemão' }
    { id: 'es', name: 'Frances' }
  ];

  const generateContent = async () => {
    if (!briefing.trim()) return;
    
    setIsGenerating(true);
    setProgress(10);
    
    try {
      const content = await generateContent(briefing);
      setAiSuggestion(content);
      setProgress(100);
      setIsGenerating(false);
    } catch (error) {
      console.error('Erro ao gerar conteúdo:', error);
      setIsGenerating(false);
      setProgress(0);
      setAlert({
        type: 'error',
        title: 'Erro',
        description: 'Não foi possível gerar o conteúdo. Por favor, tente novamente.'
      });
    }
  };

  const downloadAudio = async () => {
    if (!aiSuggestion.trim() || !selectedVoice || !selectedTrack) {
      setAlert({
        type: 'warning',
        title: 'Atenção',
        description: 'Por favor, preencha todas as informações necessárias antes de gerar o áudio.'
      });
      return;
    }

    try {
      setIsGenerating(true);
      setProgress(10);

      // Gerar áudio da voz
      setProgress(30);
      const voiceAudio = await generateAudio(aiSuggestion, selectedVoice, selectedLanguage);

      // Mixar com a trilha
      setProgress(70);
      const mixedAudio = await mixAudio(voiceAudio.audioUrl, selectedTrack);

      // Download
      setProgress(100);
      const audioBlob = await fetch(mixedAudio.mixedAudioUrl).then(r => r.blob());
      const url = window.URL.createObjectURL(audioBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'audio_mixado.mp3';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setIsGenerating(false);
      setAlert({
        type: 'success',
        title: 'Sucesso',
        description: 'Áudio mixado baixado com sucesso!'
      });
    } catch (error) {
      console.error('Erro ao gerar áudio:', error);
      setIsGenerating(false);
      setProgress(0);
      setAlert({
        type: 'error',
        title: 'Erro',
        description: 'Não foi possível gerar o áudio. Por favor, tente novamente.'
      });
    }
  };

  return (
    <Box p={4}>
      <Heading size="lg" mb={4}>DAW - Gravações e Produções de Áudio</Heading>
      
      <VStack spacing={4} align="stretch">
        {/* Área de Briefing */}
        <Box p={4} borderWidth={1} borderRadius="md">
          <Heading size="sm" mb={2}>Briefing</Heading>
          <Textarea
            placeholder="Descreva sua ideia inicial..."
            value={briefing}
            onChange={(e) => setBriefing(e.target.value)}
            height="200px"
          />
          
          <Button 
            colorScheme="blue" 
            onClick={handleGenerateContent}
            isLoading={isGenerating}
            loadingText="Gerando conteúdo..."
          >
            Gerar Sugestão
          </Button>
        </Box>

        {/* Área de Sugestão */}
        <Box p={4} borderWidth={1} borderRadius="md">
          <Heading size="sm" mb={2}>Sugestão de Conteúdo</Heading>
          <Textarea
            value={aiSuggestion}
            readOnly
            height="200px"
          />
        </Box>

        {/* Área de Configurações */}
        <Box p={4} borderWidth={1} borderRadius="md">
          <Heading size="sm" mb={2}>Configurações de Voz</Heading>
          <HStack spacing={4}>
            <Select 
              placeholder="Selecione a voz"
              value={selectedVoice}
              onChange={(e) => setSelectedVoice(e.target.value)}
            >
              {availableVoices.map(voice => (
                <option key={voice.id} value={voice.id}>{voice.name}</option>
              ))}
            </Select>
            
            <Select 
              placeholder="Selecione o idioma"
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
            >
              {languages.map(lang => (
                <option key={lang.id} value={lang.id}>{lang.name}</option>
              ))}
            </Select>
          </HStack>
        </Box>

        {/* Área de Trilhas */}
        <Box p={4} borderWidth={1} borderRadius="md">
          <Heading size="sm" mb={2}>Biblioteca de Trilhas</Heading>
          <Select 
            placeholder="Selecione a trilha"
            value={selectedTrack}
            onChange={(e) => setSelectedTrack(e.target.value)}
          >
            <option value="track1">Trilha 1 - Dramática</option>
            <option value="track2">Trilha 2 - Inspiracional</option>
            <option value="track3">Trilha 3 - Corporativa</option>
          </Select>
        </Box>

        {/* Área de Progresso */}
        <Box p={4} borderWidth={1} borderRadius="md">
          <Heading size="sm" mb={2}>Progresso da Mixagem</Heading>
          <Progress value={progress} size="sm" />
        </Box>

        {/* Botões de Ação */}
        <HStack spacing={4}>
          <Button 
            leftIcon={<FaDownload />} 
            colorScheme="green"
            onClick={downloadAudio}
          >
            Baixar Áudio Mixado
          </Button>
        </HStack>
      </VStack>
    </Box>
  );
};

export default DAW;
