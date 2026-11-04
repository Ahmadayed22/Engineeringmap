import axios from 'axios';
import { useState } from 'react';
import type { Edge, Node } from '@xyflow/react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import useCourseQueries, {
  courseQueryKeys,
} from '@hooks/ReactQueryHook/courses/useCourseQueries';
import { AxiosErrorHandler } from '@util/index';
import { useI18n } from '@i18n/context';
import type { MessageKey } from '@i18n/strings';
import type { PlanKey } from '../useStudyMap';
import {
  COREQ_COLOR,
  paletteFor,
  edgeColor,
  isCoreq,
  isRootNode,
  nodeColor,
} from './editorOps';

type Course = {
  id: number;
  name: string;
  label: string;
  description: string | null;
  creditHours: number | null;
};

type Props = {
  plan: PlanKey;
  nodes: Node[];
  selectedNode?: Node;
  selectedEdge?: Edge;
  /** Call before a change that should be undoable as one step. */
  onSnapshot: () => void;
  onRename: (node: Node, label: string) => void;
  onNodeColor: (node: Node, color: string) => void;
  onRemoveNode: (node: Node) => void;
  onEdgeStyle: (edge: Edge, color: string, coreq: boolean) => void;
  onRemoveEdge: (edge: Edge) => void;
};

const Swatches = ({
  colors,
  value,
  onPick,
}: {
  colors: { color: string; label: string }[];
  value: string;
  onPick: (color: string) => void;
}) => {
  const { t } = useI18n();
  return (
    <div className="flex flex-wrap items-center gap-2">
      {colors.map((c) => (
        <button
          key={c.color + c.label}
          type="button"
          onClick={() => onPick(c.color)}
          title={c.label}
          aria-label={c.label}
          aria-pressed={value === c.color}
          className={`h-8 w-8 cursor-pointer rounded-full border-2 ${
            value === c.color ? 'border-white' : 'border-white/20'
          }`}
          style={{ backgroundColor: c.color }}
        />
      ))}
      <label className="flex items-center gap-1 text-xs text-white/60">
        <input
          type="color"
          value={value}
          onChange={(e) => onPick(e.target.value.toLowerCase())}
          aria-label={t('mapEditor.customColor')}
          className="h-8 w-8 cursor-pointer rounded border-0 bg-transparent p-0"
        />
        {t('mapEditor.customColor')}
      </label>
    </div>
  );
};

const CreditHours = ({ course }: { course: Course }) => {
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const [hours, setHours] = useState(String(course.creditHours ?? ''));
  const save = useMutation({
    mutationFn: () =>
      axios.put(`/api/courses/${course.id}`, {
        name: course.name,
        label: course.label || course.name,
        description: course.description?.trim() || course.name,
        creditHours: Number(hours),
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: courseQueryKeys.all });
      toast.success(t('mapEditor.hoursSaved'));
    },
    onError: (e) => toast.error(AxiosErrorHandler(e)),
  });
  const valid = /^\d+$/.test(hours) && Number(hours) > 0 && Number(hours) < 30;
  return (
    <div className="space-y-1">
      <label className="block text-xs text-white/60" htmlFor="map-hours">
        {t('mapEditor.creditHours')}
      </label>
      <div className="flex gap-2">
        <input
          id="map-hours"
          inputMode="numeric"
          value={hours}
          onChange={(e) => setHours(e.target.value.trim())}
          className="w-20 rounded-lg border border-white/15 bg-neutral-950 px-2 py-1.5 text-white"
        />
        <button
          type="button"
          disabled={!valid || save.isPending || Number(hours) === course.creditHours}
          onClick={() => save.mutate()}
          className="cursor-pointer rounded-lg bg-white/15 px-3 py-1.5 text-sm text-white hover:bg-white/25 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {t('mapEditor.saveHours')}
        </button>
      </div>
      <p className="text-xs text-white/50">{t('mapEditor.hoursNote')}</p>
    </div>
  );
};

const EditorPanel = ({
  plan,
  nodes,
  selectedNode,
  selectedEdge,
  onSnapshot,
  onRename,
  onNodeColor,
  onRemoveNode,
  onEdgeStyle,
  onRemoveEdge,
}: Props) => {
  const { t } = useI18n();
  const { useCoursesQuery } = useCourseQueries();
  const { data: courses } = useCoursesQuery();
  const palette = paletteFor(plan);
  const labelOf = (id: string) =>
    String(nodes.find((n) => n.id === id)?.data?.label ?? id);

  if (selectedNode) {
    const root = isRootNode(selectedNode);
    const courseId = Number(selectedNode.data?.courseId);
    const course = (courses as Course[] | undefined)?.find(
      (c) => c.id === courseId
    );
    const copies = root
      ? 1
      : nodes.filter((n) => Number(n.data?.courseId) === courseId).length;
    return (
      <div className="space-y-4">
        <h2 className="text-base font-semibold text-white">
          {root ? t('mapEditor.banner') : t('mapEditor.courseId', { n: courseId })}
        </h2>
        <div className="space-y-1">
          <label className="block text-xs text-white/60" htmlFor="map-label">
            {t('mapEditor.nameOnMap')}
          </label>
          <textarea
            id="map-label"
            rows={2}
            value={String(selectedNode.data?.label ?? '')}
            onFocus={onSnapshot}
            onChange={(e) => onRename(selectedNode, e.target.value)}
            className="w-full rounded-lg border border-white/15 bg-neutral-950 px-2 py-1.5 text-white"
          />
          {!root && copies > 1 && (
            <p className="text-xs text-white/50">
              {t('mapEditor.nameAllCopies')} {t('mapEditor.copies', { n: copies })}
            </p>
          )}
        </div>
        <div className="space-y-1">
          <span className="block text-xs text-white/60">{t('mapEditor.color')}</span>
          <Swatches
            value={nodeColor(selectedNode)}
            colors={palette.map((s) => ({
              color: s.node,
              label: t(s.nameKey as MessageKey),
            }))}
            onPick={(c) => onNodeColor(selectedNode, c)}
          />
        </div>
        {!root && course && <CreditHours key={course.id} course={course} />}
        {!root && (
          <div className="space-y-1 border-t border-white/10 pt-4">
            <button
              type="button"
              onClick={() => onRemoveNode(selectedNode)}
              className="cursor-pointer rounded-lg bg-red-600/80 px-3 py-1.5 text-sm font-semibold text-white hover:bg-red-600"
            >
              {t('mapEditor.removeBox')}
            </button>
            <p className="text-xs text-white/50">{t('mapEditor.removeNote')}</p>
          </div>
        )}
      </div>
    );
  }

  if (selectedEdge) {
    const color = edgeColor(selectedEdge);
    const coreq = isCoreq(selectedEdge);
    const edgeColors = [
      ...palette.map((s) => ({ color: s.edge, label: t(s.nameKey as MessageKey) })),
      { color: COREQ_COLOR, label: t('mapEditor.coreqColor') },
    ];
    return (
      <div className="space-y-4">
        <h2 className="text-base font-semibold text-white">{t('mapEditor.arrow')}</h2>
        <p className="text-sm text-white/80">
          {t('mapEditor.arrowFromTo', {
            from: labelOf(selectedEdge.source),
            to: labelOf(selectedEdge.target),
          })}
        </p>
        <label className="flex cursor-pointer items-start gap-2 text-sm text-white">
          <input
            type="checkbox"
            checked={coreq}
            onChange={(e) => onEdgeStyle(selectedEdge, color, e.target.checked)}
            className="mt-1"
          />
          {t('mapEditor.coreq')}
        </label>
        <div className="space-y-1">
          <span className="block text-xs text-white/60">{t('mapEditor.color')}</span>
          <Swatches
            value={color}
            colors={edgeColors}
            onPick={(c) => onEdgeStyle(selectedEdge, c, coreq)}
          />
        </div>
        <button
          type="button"
          onClick={() => onRemoveEdge(selectedEdge)}
          className="cursor-pointer rounded-lg bg-red-600/80 px-3 py-1.5 text-sm font-semibold text-white hover:bg-red-600"
        >
          {t('mapEditor.removeArrow')}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2 text-sm text-white/80">
      <h2 className="text-base font-semibold text-white">{t('mapEditor.help.title')}</h2>
      <ul className="list-disc space-y-1 ps-5">
        <li>{t('mapEditor.help.move')}</li>
        <li>{t('mapEditor.help.connect')}</li>
        <li>{t('mapEditor.help.select')}</li>
        <li>{t('mapEditor.help.keys')}</li>
        <li>{t('mapEditor.help.publish')}</li>
      </ul>
    </div>
  );
};

export default EditorPanel;
