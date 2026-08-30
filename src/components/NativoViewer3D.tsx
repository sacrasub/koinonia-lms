'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Compass, RotateCw, ZoomIn, ZoomOut, Sparkles, Layers, Eye, RefreshCw } from 'lucide-react';
import { Cenario3D, Hotspot3D } from '@/types';

interface NativoViewer3DProps {
  cenario: Cenario3D;
  hotspotAtivo: Hotspot3D | null;
  onSelecionarHotspot: (hotspot: Hotspot3D) => void;
}

export const NativoViewer3D: React.FC<NativoViewer3DProps> = ({
  cenario,
  hotspotAtivo,
  onSelecionarHotspot,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [rotacaoX, setRotacaoX] = useState<number>(20);
  const [rotacaoY, setRotacaoY] = useState<number>(45);
  const [zoom, setZoom] = useState<number>(1.1);
  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const lastMousePos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Animação de Renderização 3D Pseudo-WebGL / 3D Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let tick = 0;

    const render = () => {
      tick++;
      if (autoRotate && !isDragging) {
        setRotacaoY((prev) => (prev + 0.25) % 360);
      }

      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      // 1. Fundo do Espaço / Céu Noturno do Deserto com Estrelas
      const gradBg = ctx.createRadialGradient(
        width / 2, height / 2, 50,
        width / 2, height / 2, width * 0.7
      );
      gradBg.addColorStop(0, '#0a0f1d');
      gradBg.addColorStop(0.5, '#050811');
      gradBg.addColorStop(1, '#020307');
      ctx.fillStyle = gradBg;
      ctx.fillRect(0, 0, width, height);

      // Estrelas cintilantes
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      for (let i = 0; i < 40; i++) {
        const sx = (Math.sin(i * 99 + tick * 0.01) * 0.5 + 0.5) * width;
        const sy = (Math.cos(i * 33 + tick * 0.005) * 0.5 + 0.5) * (height * 0.6);
        const radius = (Math.sin(tick * 0.05 + i) * 0.5 + 0.8);
        ctx.beginPath();
        ctx.arc(sx, sy, radius, 0, Math.PI * 2);
        ctx.fill();
      }

      // 2. Chão do Deserto / Terreno do Santuário (Perspectiva 3D)
      const centerX = width / 2;
      const centerY = height / 2 + 50;
      const radY = (rotacaoY * Math.PI) / 180;
      const radX = (rotacaoX * Math.PI) / 180;

      // Grade do Solo (Terreno Sagrado)
      ctx.strokeStyle = 'rgba(180, 140, 80, 0.25)';
      ctx.lineWidth = 1;
      const gridSize = 14;
      const spacing = 22 * zoom;

      for (let i = -gridSize; i <= gridSize; i++) {
        ctx.beginPath();
        // Linhas X
        const p1x = centerX + (i * spacing * Math.cos(radY) - (-gridSize * spacing) * Math.sin(radY));
        const p1y = centerY + (i * spacing * Math.sin(radY) + (-gridSize * spacing) * Math.cos(radY)) * Math.sin(radX);
        const p2x = centerX + (i * spacing * Math.cos(radY) - (gridSize * spacing) * Math.sin(radY));
        const p2y = centerY + (i * spacing * Math.sin(radY) + (gridSize * spacing) * Math.cos(radY)) * Math.sin(radX);
        ctx.moveTo(p1x, p1y);
        ctx.lineTo(p2x, p2y);
        ctx.stroke();

        // Linhas Z
        ctx.beginPath();
        const q1x = centerX + ((-gridSize * spacing) * Math.cos(radY) - i * spacing * Math.sin(radY));
        const q1y = centerY + ((-gridSize * spacing) * Math.sin(radY) + i * spacing * Math.cos(radY)) * Math.sin(radX);
        const q2x = centerX + ((gridSize * spacing) * Math.cos(radY) - i * spacing * Math.sin(radY));
        const q2y = centerY + ((gridSize * spacing) * Math.sin(radY) + i * spacing * Math.cos(radY)) * Math.sin(radX);
        ctx.moveTo(q1x, q1y);
        ctx.lineTo(q2x, q2y);
        ctx.stroke();
      }

      // 3. Projeção 3D do Edifício / Tabernáculo / Templo
      const project = (x: number, y: number, z: number) => {
        // Rotação Y
        const rx = x * Math.cos(radY) - z * Math.sin(radY);
        const rz = x * Math.sin(radY) + z * Math.cos(radY);
        // Rotação X e inclinação
        const ry = y * Math.cos(radX) - rz * Math.sin(radX);
        const depth = y * Math.sin(radX) + rz * Math.cos(radX);

        const scale = zoom;
        return {
          x: centerX + rx * scale,
          y: centerY - ry * scale,
          depth,
        };
      };

      // Desenhar Pátio Externo do Tabernáculo (Colunas de Bronze e Cortinas de Linho Fino)
      const patioW = 160;
      const patioL = 260;
      const patioH = 35;

      const ptl = project(-patioW, 0, -patioL);
      const ptr = project(patioW, 0, -patioL);
      const pbr = project(patioW, 0, patioL);
      const pbl = project(-patioW, 0, patioL);

      const ptlT = project(-patioW, patioH, -patioL);
      const ptrT = project(patioW, patioH, -patioL);
      const pbrT = project(patioW, patioH, patioL);
      const pblT = project(-patioW, patioH, patioL);

      // Cortinas do Pátio (Linho Branco com transparência)
      ctx.fillStyle = 'rgba(240, 235, 220, 0.25)';
      ctx.strokeStyle = 'rgba(212, 175, 55, 0.7)';
      ctx.lineWidth = 1.5;

      // Paredes do pátio
      const drawQuad = (p1: any, p2: any, p3: any, p4: any, fill: string, stroke: string) => {
        ctx.fillStyle = fill;
        ctx.strokeStyle = stroke;
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.lineTo(p3.x, p3.y);
        ctx.lineTo(p4.x, p4.y);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      };

      drawQuad(ptl, ptr, ptrT, ptlT, 'rgba(245, 240, 230, 0.15)', 'rgba(200, 160, 80, 0.5)');
      drawQuad(ptr, pbr, pbrT, ptrT, 'rgba(245, 240, 230, 0.18)', 'rgba(200, 160, 80, 0.5)');
      drawQuad(pbr, pbl, pblT, pbrT, 'rgba(245, 240, 230, 0.22)', 'rgba(200, 160, 80, 0.5)');
      drawQuad(pbl, ptl, ptlT, pblT, 'rgba(245, 240, 230, 0.18)', 'rgba(200, 160, 80, 0.5)');

      // Tenda do Santuário (Lugar Santo + Santo dos Santos)
      const tendaW = 60;
      const tendaL = 140;
      const tendaH = 65;

      const t1 = project(-tendaW, 0, -tendaL * 0.5);
      const t2 = project(tendaW, 0, -tendaL * 0.5);
      const t3 = project(tendaW, 0, tendaL * 0.7);
      const t4 = project(-tendaW, 0, tendaL * 0.7);

      const t1T = project(-tendaW, tendaH, -tendaL * 0.5);
      const t2T = project(tendaW, tendaH, -tendaL * 0.5);
      const t3T = project(tendaW, tendaH, tendaL * 0.7);
      const t4T = project(-tendaW, tendaH, tendaL * 0.7);

      // Cumeeira do Teto da Tenda (Peles de Texugo e Carneiro Vermelho)
      const tPeak1 = project(0, tendaH + 18, -tendaL * 0.5);
      const tPeak2 = project(0, tendaH + 18, tendaL * 0.7);

      // Paredes de Ouro do Tabernáculo
      drawQuad(t1, t2, t2T, t1T, 'rgba(218, 165, 32, 0.65)', 'rgba(255, 215, 0, 0.9)');
      drawQuad(t2, t3, t3T, t2T, 'rgba(184, 134, 11, 0.6)', 'rgba(255, 215, 0, 0.9)');
      drawQuad(t3, t4, t4T, t3T, 'rgba(218, 165, 32, 0.7)', 'rgba(255, 215, 0, 0.9)');
      drawQuad(t4, t1, t1T, t4T, 'rgba(184, 134, 11, 0.6)', 'rgba(255, 215, 0, 0.9)');

      // Telhado Inclinado
      drawQuad(t1T, t2T, tPeak1, tPeak1, 'rgba(139, 0, 0, 0.75)', 'rgba(255, 99, 71, 0.8)');
      drawQuad(t2T, t3T, tPeak2, tPeak1, 'rgba(90, 40, 20, 0.8)', 'rgba(200, 100, 50, 0.8)');
      drawQuad(t4T, t1T, tPeak1, tPeak2, 'rgba(120, 50, 25, 0.8)', 'rgba(200, 100, 50, 0.8)');

      // Altar de Holocausto (Bronze) com Fogo Sagrado no Pátio
      const altarPos = project(0, 0, -140);
      const altarPosT = project(0, 22, -140);
      ctx.fillStyle = 'rgba(180, 80, 40, 0.9)';
      ctx.fillRect(altarPosT.x - 14 * zoom, altarPosT.y - 10 * zoom, 28 * zoom, 20 * zoom);
      
      // Chamas e fumaça do Altar
      const flameH = (Math.sin(tick * 0.15) * 5 + 15) * zoom;
      ctx.fillStyle = 'rgba(255, 140, 0, 0.85)';
      ctx.beginPath();
      ctx.arc(altarPosT.x, altarPosT.y - flameH * 0.5, 7 * zoom, 0, Math.PI * 2);
      ctx.fill();

      // Glória Shekinah (Luz do Santo dos Santos sobre a Arca)
      const arcaPos = project(0, 25, tendaL * 0.35);
      const glowGrad = ctx.createRadialGradient(
        arcaPos.x, arcaPos.y, 4 * zoom,
        arcaPos.x, arcaPos.y, (30 + Math.sin(tick * 0.08) * 8) * zoom
      );
      glowGrad.addColorStop(0, 'rgba(255, 245, 180, 0.95)');
      glowGrad.addColorStop(0.4, 'rgba(255, 215, 0, 0.5)');
      glowGrad.addColorStop(1, 'rgba(255, 215, 0, 0)');
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(arcaPos.x, arcaPos.y, (30 + Math.sin(tick * 0.08) * 8) * zoom, 0, Math.PI * 2);
      ctx.fill();

      // 4. Desenhar os Pins dos Hotspots Exegéticos no Espaço 3D
      cenario.hotspots.forEach((h, idx) => {
        // Converte coordenadas percentuais (X%, Y%) em coordenadas 3D no cenário
        const posX = ((h.coordenadas_x - 50) / 50) * 120;
        const posZ = ((h.coordenadas_y - 50) / 50) * 200;
        const posY = 35 + Math.sin(tick * 0.08 + idx) * 4;

        const pin = project(posX, posY, posZ);
        const isSelected = hotspotAtivo?.id === h.id;

        // Anel pulsante
        if (isSelected) {
          ctx.strokeStyle = 'rgba(6, 182, 212, 0.8)';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          const pulseR = (12 + Math.sin(tick * 0.1) * 4) * zoom;
          ctx.arc(pin.x, pin.y, pulseR, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Círculo do Hotspot
        ctx.fillStyle = isSelected ? '#06b6d4' : '#f43f5e';
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(pin.x, pin.y, 9 * zoom, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Número do Hotspot
        ctx.fillStyle = '#ffffff';
        ctx.font = `bold ${Math.max(9, 10 * zoom)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(String(idx + 1), pin.x, pin.y);

        // Rótulo Flutuante
        if (isSelected || zoom > 1.2) {
          ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
          const text = h.titulo;
          const textW = ctx.measureText(text).width + 12;
          ctx.fillRect(pin.x - textW / 2, pin.y - 24 * zoom, textW, 16 * zoom);
          ctx.fillStyle = '#38bdf8';
          ctx.fillText(text, pin.x, pin.y - 16 * zoom);
        }
      });

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [rotacaoX, rotacaoY, zoom, autoRotate, isDragging, cenario, hotspotAtivo]);

  // Controles de Mouse / Touch
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    lastMousePos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const deltaX = e.clientX - lastMousePos.current.x;
    const deltaY = e.clientY - lastMousePos.current.y;

    setRotacaoY((prev) => (prev + deltaX * 0.6) % 360);
    setRotacaoX((prev) => Math.max(5, Math.min(80, prev + deltaY * 0.4)));

    lastMousePos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    setZoom((prev) => Math.max(0.6, Math.min(2.5, prev - e.deltaY * 0.0015)));
  };

  return (
    <div className="relative w-full h-[460px] sm:h-[560px] bg-slate-950 rounded-3xl overflow-hidden shadow-2xl border border-cyan-500/40 select-none">
      {/* Canvas 3D Interativo */}
      <canvas
        ref={canvasRef}
        width={900}
        height={560}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        className="w-full h-full cursor-grab active:cursor-grabbing block"
      />

      {/* Overlay Superior de Controles */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
        <div className="bg-slate-900/85 backdrop-blur-md px-3.5 py-1.5 rounded-2xl border border-cyan-500/40 text-xs font-bold text-white flex items-center gap-2 shadow-lg pointer-events-auto">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-cyan-300 font-extrabold">WebGL Nativo LMS</span>
          <span className="text-slate-400">|</span>
          <span className="text-[11px] text-slate-300">Girar 360° com o Mouse • Scroll para Zoom</span>
        </div>

        <div className="flex items-center gap-1.5 pointer-events-auto">
          <button
            type="button"
            onClick={() => setAutoRotate(!autoRotate)}
            className={`p-2 rounded-xl border text-xs font-bold transition flex items-center gap-1 cursor-pointer shadow-md ${
              autoRotate
                ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-extrabold'
                : 'bg-slate-900/90 text-slate-300 border-slate-700 hover:bg-slate-800'
            }`}
            title="Ativar/Pausar Rotação Automática da Maquete"
          >
            <RotateCw className={`w-3.5 h-3.5 ${autoRotate ? 'animate-spin' : ''}`} style={{ animationDuration: '6s' }} />
            <span className="hidden sm:inline">{autoRotate ? 'Órbita Ativa' : 'Pausado'}</span>
          </button>

          <button
            type="button"
            onClick={() => setZoom((prev) => Math.min(2.5, prev + 0.2))}
            className="p-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700 transition cursor-pointer shadow-md"
            title="Aproximar Zoom"
          >
            <ZoomIn className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => setZoom((prev) => Math.max(0.6, prev - 0.2))}
            className="p-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700 transition cursor-pointer shadow-md"
            title="Afastar Zoom"
          >
            <ZoomOut className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => {
              setRotacaoX(20);
              setRotacaoY(45);
              setZoom(1.1);
            }}
            className="p-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700 transition cursor-pointer shadow-md"
            title="Restaurar Ângulo Inicial"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Guia Rápido Inferior com Hotspots Clicáveis */}
      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between flex-wrap gap-2 pointer-events-none">
        <div className="bg-slate-900/90 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-slate-700 text-[11px] text-slate-200 font-medium flex items-center gap-3 shadow-lg pointer-events-auto">
          <span className="text-amber-300 font-black flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" /> Pontos no 3D:
          </span>
          <div className="flex items-center gap-1.5 overflow-x-auto">
            {cenario.hotspots.map((h, i) => (
              <button
                key={h.id}
                type="button"
                onClick={() => onSelecionarHotspot(h)}
                className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border transition cursor-pointer ${
                  hotspotAtivo?.id === h.id
                    ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-extrabold'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                }`}
              >
                #{i + 1} {h.titulo.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>

        <div className="text-[10px] text-cyan-300 font-mono bg-black/60 px-2.5 py-1 rounded-lg border border-cyan-800/40">
          Render 60 FPS • {cenario.periodo_historico}
        </div>
      </div>
    </div>
  );
};
