import { useMemo, useCallback, createElement, createContext, useContext } from 'react';
import EvidenceNode from '../components/EvidenceNode';
import NoteNode from '../components/NoteNode';
import ImageNode from '../components/ImageNode';
import TextNode from '../components/TextNode';
import ZoneNode from '../components/ZoneNode';
import UrlNode from '../components/UrlNode';
import { CustomEdgeDefault, CustomEdgeStraight, CustomEdgeStep, CustomEdgeSmoothStep } from '../components/CustomEdge';

export const ThemeContext = createContext(true);

const withTheme = (Component) => (props) => {
  const isDarkMode = useContext(ThemeContext);
  return createElement(Component, { ...props, isDarkMode });
};

const nodeTypes = {
  evidence: withTheme(EvidenceNode),
  note: withTheme(NoteNode),
  image: withTheme(ImageNode),
  text: withTheme(TextNode),
  zone: withTheme(ZoneNode),
  url: withTheme(UrlNode),
};

const edgeTypes = {
  default: CustomEdgeDefault,
  straight: CustomEdgeStraight,
  step: CustomEdgeStep,
  smoothstep: CustomEdgeSmoothStep,
};

const useFlowConfiguration = ({ connectionColor }) => {

  const proOptions = useMemo(() => ({ hideAttribution: true }), []);
  const connectionLineStyle = useMemo(() => ({ stroke: connectionColor, strokeWidth: 2 }), [connectionColor]);

  const nodeColor = useCallback((node) => {
    switch (node.type) {
      case 'evidence':
        switch (node.data.category) {
          case 'person': return '#3b82f6';
          case 'place': return '#22c55e';
          case 'clue': return '#f97316';
          case 'event': return '#ef4444';
          default: return '#ef4444';
        }
      case 'note': return '#eab308';
      case 'image': return '#a855f7';
      case 'text': return '#71717a';
      default: return '#ef4444';
    }
  }, []);

  return { nodeTypes, edgeTypes, proOptions, connectionLineStyle, nodeColor };
};

export default useFlowConfiguration;