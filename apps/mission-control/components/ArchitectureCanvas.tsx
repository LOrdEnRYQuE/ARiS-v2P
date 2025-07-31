'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CanvasNode {
  id: string;
  type: 'service' | 'database' | 'api' | 'ui' | 'external';
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  connections: string[];
  properties: Record<string, any>;
}

interface CanvasConnection {
  id: string;
  from: string;
  to: string;
  type: 'data' | 'api' | 'event' | 'dependency';
  label?: string;
}

interface ArchitectureCanvasProps {
  onBlueprintUpdate?: (blueprint: any) => void;
  initialBlueprint?: any;
}

export default function ArchitectureCanvas({ onBlueprintUpdate, initialBlueprint }: ArchitectureCanvasProps) {
  const [nodes, setNodes] = useState<CanvasNode[]>([]);
  const [connections, setConnections] = useState<CanvasConnection[]>([]);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [draggingNode, setDraggingNode] = useState<string | null>(null);
  const [showPalette, setShowPalette] = useState(false);
  const [connectionMode, setConnectionMode] = useState(false);
  const [connectionStart, setConnectionStart] = useState<string | null>(null);
  
  const canvasRef = useRef<HTMLDivElement>(null);
  const nextId = useRef(1);

  useEffect(() => {
    if (initialBlueprint) {
      loadBlueprint(initialBlueprint);
    }
  }, [initialBlueprint]);

  useEffect(() => {
    if (onBlueprintUpdate) {
      const blueprint = generateBlueprint();
      onBlueprintUpdate(blueprint);
    }
  }, [nodes, connections, onBlueprintUpdate]);

  const loadBlueprint = (blueprint: any) => {
    // Convert blueprint to canvas nodes and connections
    const newNodes: CanvasNode[] = [];
    const newConnections: CanvasConnection[] = [];

    if (blueprint.services) {
      blueprint.services.forEach((service: any, index: number) => {
        newNodes.push({
          id: service.id || `service-${index}`,
          type: 'service',
          name: service.name,
          x: 100 + (index * 200),
          y: 100,
          width: 120,
          height: 80,
          connections: [],
          properties: service
        });
      });
    }

    if (blueprint.databases) {
      blueprint.databases.forEach((db: any, index: number) => {
        newNodes.push({
          id: db.id || `db-${index}`,
          type: 'database',
          name: db.name,
          x: 100 + (index * 200),
          y: 300,
          width: 120,
          height: 80,
          connections: [],
          properties: db
        });
      });
    }

    setNodes(newNodes);
    setConnections(newConnections);
  };

  const generateBlueprint = () => {
    const services = nodes
      .filter(node => node.type === 'service')
      .map(node => ({
        id: node.id,
        name: node.name,
        ...node.properties
      }));

    const databases = nodes
      .filter(node => node.type === 'database')
      .map(node => ({
        id: node.id,
        name: node.name,
        ...node.properties
      }));

    const apis = nodes
      .filter(node => node.type === 'api')
      .map(node => ({
        id: node.id,
        name: node.name,
        ...node.properties
      }));

    return {
      services,
      databases,
      apis,
      connections: connections.map(conn => ({
        from: conn.from,
        to: conn.to,
        type: conn.type,
        label: conn.label
      }))
    };
  };

  const addNode = (type: CanvasNode['type'], x: number, y: number) => {
    const newNode: CanvasNode = {
      id: `node-${nextId.current++}`,
      type,
      name: `${type.charAt(0).toUpperCase() + type.slice(1)} ${nextId.current}`,
      x,
      y,
      width: 120,
      height: 80,
      connections: [],
      properties: {}
    };

    setNodes(prev => [...prev, newNode]);
    setShowPalette(false);
  };

  const updateNodePosition = (id: string, x: number, y: number) => {
    setNodes(prev => prev.map(node => 
      node.id === id ? { ...node, x, y } : node
    ));
  };

  const updateNodeName = (id: string, name: string) => {
    setNodes(prev => prev.map(node => 
      node.id === id ? { ...node, name } : node
    ));
  };

  const deleteNode = (id: string) => {
    setNodes(prev => prev.filter(node => node.id !== id));
    setConnections(prev => prev.filter(conn => conn.from !== id && conn.to !== id));
  };

  const addConnection = (from: string, to: string, type: CanvasConnection['type'] = 'data') => {
    const newConnection: CanvasConnection = {
      id: `conn-${nextId.current++}`,
      from,
      to,
      type
    };

    setConnections(prev => [...prev, newConnection]);
    setConnectionMode(false);
    setConnectionStart(null);
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === canvasRef.current) {
      setSelectedNode(null);
      setShowPalette(true);
    }
  };

  const handleNodeClick = (nodeId: string) => {
    setSelectedNode(nodeId);
    setShowPalette(false);
  };

  const handleNodeDragStart = (nodeId: string) => {
    setDraggingNode(nodeId);
  };

  const handleNodeDragEnd = (nodeId: string, x: number, y: number) => {
    updateNodePosition(nodeId, x, y);
    setDraggingNode(null);
  };

  const getNodeColor = (type: CanvasNode['type']) => {
    const colors = {
      service: 'bg-blue-500',
      database: 'bg-green-500',
      api: 'bg-purple-500',
      ui: 'bg-orange-500',
      external: 'bg-gray-500'
    };
    return colors[type] || 'bg-gray-500';
  };

  const getNodeIcon = (type: CanvasNode['type']) => {
    const icons = {
      service: '⚙️',
      database: '🗄️',
      api: '🔌',
      ui: '🖥️',
      external: '🌐'
    };
    return icons[type] || '📦';
  };

  return (
    <div className="w-full h-full bg-gray-50 border border-gray-200 rounded-lg relative">
      {/* Toolbar */}
      <div className="absolute top-4 left-4 z-10 flex gap-2">
        <button
          onClick={() => setConnectionMode(!connectionMode)}
          className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            connectionMode 
              ? 'bg-blue-600 text-white' 
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          🔗 Connect
        </button>
        <button
          onClick={() => setShowPalette(!showPalette)}
          className="px-3 py-2 rounded-md text-sm font-medium bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
        >
          ➕ Add Node
        </button>
      </div>

      {/* Canvas */}
      <div
        ref={canvasRef}
        className="w-full h-full relative cursor-crosshair"
        onClick={handleCanvasClick}
      >
        {/* Connections */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          {connections.map(connection => {
            const fromNode = nodes.find(n => n.id === connection.from);
            const toNode = nodes.find(n => n.id === connection.to);
            
            if (!fromNode || !toNode) return null;

            const fromX = fromNode.x + fromNode.width / 2;
            const fromY = fromNode.y + fromNode.height / 2;
            const toX = toNode.x + toNode.width / 2;
            const toY = toNode.y + toNode.height / 2;

            return (
              <g key={connection.id}>
                <line
                  x1={fromX}
                  y1={fromY}
                  x2={toX}
                  y2={toY}
                  stroke="#6B7280"
                  strokeWidth="2"
                  markerEnd="url(#arrowhead)"
                />
                {connection.label && (
                  <text
                    x={(fromX + toX) / 2}
                    y={(fromY + toY) / 2 - 10}
                    textAnchor="middle"
                    className="text-xs fill-gray-600"
                  >
                    {connection.label}
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {/* Nodes */}
        <AnimatePresence>
          {nodes.map(node => (
            <motion.div
              key={node.id}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              drag
              dragMomentum={false}
              dragElastic={0}
              onDragStart={() => handleNodeDragStart(node.id)}
              onDragEnd={(e, info) => handleNodeDragEnd(node.id, info.point.x, info.point.y)}
              onClick={(e) => {
                e.stopPropagation();
                handleNodeClick(node.id);
              }}
              className={`absolute cursor-move select-none ${
                selectedNode === node.id ? 'ring-2 ring-blue-500' : ''
              }`}
              style={{
                left: node.x,
                top: node.y,
                width: node.width,
                height: node.height
              }}
            >
              <div className={`w-full h-full rounded-lg shadow-md border-2 border-white ${getNodeColor(node.type)}`}>
                <div className="flex flex-col items-center justify-center h-full p-2 text-white">
                  <div className="text-2xl mb-1">{getNodeIcon(node.type)}</div>
                  <input
                    type="text"
                    value={node.name}
                    onChange={(e) => updateNodeName(node.id, e.target.value)}
                    className="text-center bg-transparent border-none outline-none text-white placeholder-white/70 text-sm font-medium"
                    placeholder="Node name"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              </div>
              
              {/* Node controls */}
              {selectedNode === node.id && (
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 flex gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNode(node.id);
                    }}
                    className="w-6 h-6 bg-red-500 text-white rounded-full text-xs flex items-center justify-center hover:bg-red-600"
                  >
                    ×
                  </button>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Connection preview */}
        {connectionMode && connectionStart && (
          <div className="absolute inset-0 pointer-events-none">
            <svg className="w-full h-full">
              <line
                x1={nodes.find(n => n.id === connectionStart)?.x || 0}
                y1={nodes.find(n => n.id === connectionStart)?.y || 0}
                x2={0}
                y2={0}
                stroke="#3B82F6"
                strokeWidth="2"
                strokeDasharray="5,5"
              />
            </svg>
          </div>
        )}
      </div>

      {/* Node Palette */}
      <AnimatePresence>
        {showPalette && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-20"
            style={{
              left: '50px',
              top: '80px'
            }}
          >
            <div className="grid grid-cols-2 gap-2">
              {(['service', 'database', 'api', 'ui', 'external'] as CanvasNode['type'][]).map(type => (
                <button
                  key={type}
                  onClick={() => addNode(type, 200, 200)}
                  className="flex flex-col items-center p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  <div className="text-2xl mb-1">{getNodeIcon(type)}</div>
                  <span className="text-xs font-medium text-gray-700 capitalize">{type}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Connection Type Selector */}
      {connectionMode && (
        <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg border border-gray-200 p-3">
          <div className="text-sm font-medium text-gray-700 mb-2">Connection Type:</div>
          <div className="flex gap-2">
            {(['data', 'api', 'event', 'dependency'] as CanvasConnection['type'][]).map(type => (
              <button
                key={type}
                className="px-2 py-1 text-xs rounded border border-gray-200 hover:bg-gray-50"
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 