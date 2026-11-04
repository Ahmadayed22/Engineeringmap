import '@xyflow/react/dist/style.css';
import axios, { isAxiosError } from 'axios';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Controls,
  MarkerType,
  ReactFlow,
  ReactFlowProvider,
  applyEdgeChanges,
  applyNodeChanges,
  useReactFlow,
  type Connection,
  type Edge,
  type EdgeChange,
  type Node,
  type NodeChange,
} from '@xyflow/react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { AxiosErrorHandler } from '@util/index';
import { useI18n } from '@i18n/context';
import type { PlanInfo } from '@features/progress/plans';
import { fromFlow, toFlow, type StudyMapDoc } from '../mapFormat';
import {
  studyMapKey,
  writeCachedMap,
  type StudyMapResponse,
} from '../useStudyMap';
import EditorNode from './EditorNode';
import EditorPanel from './EditorPanel';
import { AddCourseDialog, HistoryDialog } from './EditorDialogs';
import {
  paletteFor,
  clearDraft,
  connectProblem,
  edgeColor,
  edgeColorFor,
  isCoreq,
  isRootNode,
  makeEdge,
  nodeColor,
  readDraft,
  renameCourse,
  sameDoc,
  uniqueNodeId,
  withEdgeStyle,
  withNodeColor,
  writeDraft,
} from './editorOps';

const nodeTypes = { course: EditorNode };
const defaultEdgeOptions = { markerEnd: { type: MarkerType.ArrowClosed } };
const MAX_UNDO = 100;

/** Map document → editor nodes (course boxes use the editor's box; the banner can't be deleted). */
const toEditor = (doc: StudyMapDoc) => {
  const { nodes, edges } = toFlow(doc);
  return {
    nodes: nodes.map((n) =>
      isRootNode(n) ? { ...n, deletable: false } : { ...n, type: 'course' }
    ),
    edges,
  };
};

type Props = { plan: PlanInfo; name: string; onExit: () => void };

const Editor = ({ plan, name, onExit }: Props) => {
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const { screenToFlowPosition } = useReactFlow();
  const key = plan.key;

  // Start from this browser's unpublished draft when it was made on the current version.
  const [start] = useState(() => {
    const draft = readDraft(key);
    if (draft && draft.baseVersion === plan.version)
      return { doc: draft.doc, note: 'restored' as const };
    if (draft) clearDraft(key);
    return { doc: plan.doc, note: draft ? ('outdated' as const) : null };
  });
  useEffect(() => {
    // A fixed id so the message shows once even if the effect runs twice (React dev mode).
    if (start.note === 'restored')
      toast(t('mapEditor.draftRestored'), { id: 'map-draft' });
    if (start.note === 'outdated')
      toast(t('mapEditor.draftOutdated'), { id: 'map-draft' });
    // Only once, when the editor opens.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const initial = useMemo(() => toEditor(start.doc), [start]);
  const [nodes, setNodes] = useState<Node[]>(initial.nodes);
  const [edges, setEdges] = useState<Edge[]>(initial.edges);
  const [dirty, setDirty] = useState(start.note === 'restored');
  const [dialog, setDialog] = useState<'add' | 'history' | null>(null);
  const [conflict, setConflict] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);

  // ----- Undo -----
  const current = useRef({ nodes, edges });
  useEffect(() => {
    current.current = { nodes, edges };
  }, [nodes, edges]);
  const past = useRef<{ nodes: Node[]; edges: Edge[] }[]>([]);
  const [canUndo, setCanUndo] = useState(false);
  const snapshot = useCallback(() => {
    past.current.push(current.current);
    if (past.current.length > MAX_UNDO) past.current.shift();
    setCanUndo(true);
  }, []);
  const undo = useCallback(() => {
    const prev = past.current.pop();
    if (!prev) return;
    setNodes(prev.nodes.map((n) => ({ ...n, selected: false })));
    setEdges(prev.edges.map((e) => ({ ...e, selected: false })));
    setCanUndo(past.current.length > 0);
  }, []);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        undo();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [undo]);

  // ----- Draft: kept in this browser until published or discarded -----
  useEffect(() => {
    const timer = setTimeout(() => {
      const doc = fromFlow(nodes, edges);
      if (sameDoc(doc, plan.doc)) {
        clearDraft(key);
        setDirty(false);
      } else {
        writeDraft(key, {
          baseVersion: plan.version,
          doc,
          savedAt: new Date().toISOString(),
        });
        setDirty(true);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [nodes, edges, key, plan.doc, plan.version]);

  // ----- Canvas events -----
  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      if (changes.some((c) => c.type === 'remove')) snapshot();
      setNodes((ns) => applyNodeChanges(changes, ns));
    },
    [snapshot]
  );
  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      if (changes.some((c) => c.type === 'remove')) snapshot();
      setEdges((es) => applyEdgeChanges(changes, es));
    },
    [snapshot]
  );
  const onConnect = useCallback(
    ({ source, target }: Connection) => {
      const { nodes: ns, edges: es } = current.current;
      const problem = connectProblem(ns, es, source, target);
      if (problem) {
        toast.error(t(`mapEditor.problem.${problem}`));
        return;
      }
      snapshot();
      setEdges([...es, makeEdge(key, ns, es, source, target)]);
    },
    [key, snapshot, t]
  );

  const selectedNode = nodes.find((n) => n.selected);
  const selectedEdge = selectedNode ? undefined : edges.find((e) => e.selected);

  // Selected arrows are drawn thicker (display only; not stored).
  const shownEdges = useMemo(
    () =>
      edges.map((e) =>
        e.selected ? { ...e, style: { ...e.style, strokeWidth: 8 } } : e
      ),
    [edges]
  );

  // ----- Panel actions -----
  const rename = useCallback((node: Node, label: string) => {
    setNodes((ns) =>
      isRootNode(node)
        ? ns.map((n) => (n.id === node.id ? { ...n, data: { ...n.data, label } } : n))
        : renameCourse(ns, Number(node.data?.courseId), label)
    );
  }, []);

  const recolorNode = useCallback(
    (node: Node, color: string) => {
      snapshot();
      const oldArrow = edgeColorFor(key, nodeColor(node));
      const newArrow = edgeColorFor(key, color);
      setNodes((ns) => ns.map((n) => (n.id === node.id ? withNodeColor(n, color) : n)));
      // Arrows into this box that used its old colour follow the new one.
      setEdges((es) =>
        es.map((e) =>
          e.target === node.id && !isCoreq(e) && edgeColor(e) === oldArrow
            ? withEdgeStyle(e, newArrow, false)
            : e
        )
      );
    },
    [key, snapshot]
  );

  const removeNode = useCallback(
    (node: Node) => {
      snapshot();
      setNodes((ns) => ns.filter((n) => n.id !== node.id));
      setEdges((es) => es.filter((e) => e.source !== node.id && e.target !== node.id));
    },
    [snapshot]
  );

  const styleEdge = useCallback(
    (edge: Edge, color: string, coreq: boolean) => {
      snapshot();
      setEdges((es) => es.map((e) => (e.id === edge.id ? withEdgeStyle(e, color, coreq) : e)));
    },
    [snapshot]
  );

  const removeEdge = useCallback(
    (edge: Edge) => {
      snapshot();
      setEdges((es) => es.filter((e) => e.id !== edge.id));
    },
    [snapshot]
  );

  const addCourse = useCallback(
    (courseId: number, label: string) => {
      snapshot();
      const rect = canvasRef.current?.getBoundingClientRect();
      const position = screenToFlowPosition({
        x: rect ? rect.left + rect.width / 2 : window.innerWidth / 2,
        y: rect ? rect.top + rect.height / 2 : window.innerHeight / 2,
      });
      const color = selectedNode && !isRootNode(selectedNode)
        ? nodeColor(selectedNode)
        : paletteFor(key)[0].node;
      setNodes((ns) => {
        const id = uniqueNodeId(ns, courseId);
        return [
          ...ns.map((n) => ({ ...n, selected: false })),
          {
            id,
            type: 'course',
            position: { x: position.x - 112, y: position.y - 30 },
            data: { label, courseId, title: id },
            style: { borderRadius: '14px', backgroundColor: color },
            selected: true,
          },
        ];
      });
      setEdges((es) => es.map((e) => ({ ...e, selected: false })));
      setDialog(null);
    },
    [key, screenToFlowPosition, selectedNode, snapshot]
  );

  // ----- Publish / discard / restore -----
  const applyPublished = useCallback(
    (map: StudyMapResponse) => {
      queryClient.setQueryData(studyMapKey(key), map);
      writeCachedMap(map);
      void queryClient.invalidateQueries({ queryKey: ['studyMapVersions', key] });
      clearDraft(key);
      onExit();
    },
    [key, onExit, queryClient]
  );

  const publish = useMutation({
    mutationFn: async () =>
      (
        await axios.put<StudyMapResponse>(`/api/admin/maps/${key}`, {
          baseVersion: plan.version,
          content: fromFlow(nodes, edges),
        })
      ).data,
    onSuccess: (map) => {
      toast.success(t('mapEditor.published', { n: map.version }));
      applyPublished(map);
    },
    onError: (e) => {
      if (isAxiosError(e) && e.response?.status === 409) setConflict(true);
      else toast.error(AxiosErrorHandler(e), { duration: 8000 });
    },
  });

  const discard = () => {
    if (!window.confirm(t('mapEditor.confirmDiscard'))) return;
    snapshot();
    const fresh = toEditor(plan.doc);
    setNodes(fresh.nodes);
    setEdges(fresh.edges);
    clearDraft(key);
  };

  const loadLatest = async () => {
    clearDraft(key);
    await queryClient.invalidateQueries({ queryKey: studyMapKey(key) });
    onExit();
  };

  const button =
    'cursor-pointer rounded-lg px-3 py-1.5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-40';

  return (
    <div className="flex h-[calc(100dvh-6rem)] flex-col gap-2 px-2 pb-2 sm:px-6">
      <header className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-2xl border border-white/10 bg-neutral-900/90 px-4 py-2 text-white">
        <div className="me-auto">
          <h1 className="text-base font-semibold">
            {t('mapEditor.title', { plan: name })}
          </h1>
          <p className="text-xs text-white/60">
            {t('mapEditor.version', { n: plan.version })} ·{' '}
            {dirty ? t('mapEditor.unsaved') : t('mapEditor.noChanges')}
          </p>
        </div>
        <button type="button" onClick={() => setDialog('add')} className={`${button} bg-white/15 hover:bg-white/25`}>
          + {t('mapEditor.addCourse')}
        </button>
        <button type="button" onClick={undo} disabled={!canUndo} className={`${button} bg-white/10 hover:bg-white/20`}>
          {t('mapEditor.undo')}
        </button>
        <button type="button" onClick={() => setDialog('history')} className={`${button} bg-white/10 hover:bg-white/20`}>
          {t('mapEditor.history')}
        </button>
        <button type="button" onClick={discard} disabled={!dirty} className={`${button} bg-white/10 hover:bg-white/20`}>
          {t('mapEditor.discard')}
        </button>
        <button
          type="button"
          disabled={!dirty || publish.isPending}
          onClick={() => {
            if (window.confirm(t('mapEditor.confirmPublish'))) publish.mutate();
          }}
          className={`${button} bg-emerald-500 text-neutral-950 hover:bg-emerald-400`}
        >
          {publish.isPending ? t('mapEditor.publishing') : t('mapEditor.publish')}
        </button>
        <button type="button" onClick={onExit} className={`${button} border border-white/20 hover:bg-white/10`}>
          {t('mapEditor.exit')}
        </button>
      </header>

      {conflict && (
        <div role="alert" className="flex flex-wrap items-center gap-3 rounded-xl border border-amber-400/40 bg-amber-500/15 px-4 py-2 text-sm text-amber-100">
          {t('mapEditor.conflict')}
          <button type="button" onClick={() => void loadLatest()} className="cursor-pointer underline">
            {t('mapEditor.loadLatest')}
          </button>
        </div>
      )}

      <div className="flex min-h-0 flex-1 flex-col gap-2 md:flex-row">
        <div ref={canvasRef} className="map-editor min-h-[50vh] flex-1 overflow-hidden rounded-2xl border border-white/10">
          <ReactFlow
            nodes={nodes}
            edges={shownEdges}
            nodeTypes={nodeTypes}
            defaultEdgeOptions={defaultEdgeOptions}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeDragStart={snapshot}
            deleteKeyCode={['Delete', 'Backspace']}
            minZoom={0.2}
            fitView
            fitViewOptions={{ padding: 0.15 }}
            proOptions={{ hideAttribution: true }}
            style={{ background: 'transparent' }}
          >
            <Controls showInteractive={false} />
          </ReactFlow>
        </div>
        <aside className="max-h-[40vh] shrink-0 overflow-auto rounded-2xl border border-white/10 bg-neutral-900/90 p-4 md:max-h-none md:w-80">
          <EditorPanel
            plan={key}
            nodes={nodes}
            selectedNode={selectedNode}
            selectedEdge={selectedEdge}
            onSnapshot={snapshot}
            onRename={rename}
            onNodeColor={recolorNode}
            onRemoveNode={removeNode}
            onEdgeStyle={styleEdge}
            onRemoveEdge={removeEdge}
          />
        </aside>
      </div>

      {dialog === 'add' && (
        <AddCourseDialog nodes={nodes} onAdd={addCourse} onClose={() => setDialog(null)} />
      )}
      {dialog === 'history' && (
        <HistoryDialog
          plan={key}
          currentVersion={plan.version}
          onRestored={applyPublished}
          onClose={() => setDialog(null)}
        />
      )}
    </div>
  );
};

/** Admin editor for one study-plan map: move, add, connect and remove courses, then publish. */
const MapEditor = (props: Props) => (
  <ReactFlowProvider>
    <Editor {...props} />
  </ReactFlowProvider>
);

export default MapEditor;
